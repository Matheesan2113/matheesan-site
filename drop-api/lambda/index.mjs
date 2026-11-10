// matheesan.ca/drop backend: a Lambda function URL that hands out short-lived S3 URLs.
// Files go browser -> S3 directly (presigned POST), so the Lambda never sees file bytes.
//
// Two kinds of caller:
//   owner  Authorization: Bearer <Authentik access token>. Verified against Authentik's JWKS (RS256/ES256),
//          issuer, audience, expiry, and the ALLOWED_USERS list (sub = Authentik username).
//   guest  x-drop-link: <upload-link token>. The owner creates time-limited links; a guest can only upload
//          files through one, never list, read or delete anything.
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, createPublicKey, randomBytes, verify } from 'node:crypto';

const { BUCKET, OIDC_ISSUER = '', OIDC_CLIENT_ID = '', ALLOWED_USERS = '', S3_ENDPOINT } = process.env;
const PREFIX = 'drops/';
const LINKS = 'links/';
const MAX_FILE_BYTES = 250 * 1024 * 1024;
const MAX_NOTE_CHARS = 100_000;
const URL_TTL_SECONDS = 15 * 60;
const LINK_MAX_HOURS = 7 * 24;
const LINK_MAX_FILES = 50;
const CLOCK_SKEW_SECONDS = 60;

// S3_ENDPOINT is only set by the offline test (a local fake S3).
const s3 = new S3Client(S3_ENDPOINT ? { endpoint: S3_ENDPOINT, forcePathStyle: true } : {});
const allowedUsers = new Set(ALLOWED_USERS.split(',').map((u) => u.trim()).filter(Boolean));

class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

const reply = (statusCode, body) => ({
	statusCode,
	headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	body: JSON.stringify(body),
});

// ---------- owner auth: Authentik JWT ----------

let jwks = new Map();
let jwksLoadedAt = 0;
let jwksLoading = null; // concurrent requests share one fetch

async function fetchJwks() {
	const res = await fetch(`${OIDC_ISSUER}jwks/`, { signal: AbortSignal.timeout(5000) });
	if (!res.ok) throw new Error(`JWKS returned ${res.status}`);
	const { keys = [] } = await res.json();
	jwks = new Map(keys.filter((k) => k.kid).map((k) => [k.kid, createPublicKey({ key: k, format: 'jwk' })]));
	jwksLoadedAt = Date.now();
}

function loadJwks() {
	jwksLoading ??= fetchJwks().finally(() => {
		jwksLoading = null;
	});
	return jwksLoading;
}

async function signingKey(kid) {
	const age = Date.now() - jwksLoadedAt;
	// Refresh hourly, or sooner (at most once a minute) when Authentik rotates its key.
	if (age > 3600_000 || (!jwks.has(kid) && age > 60_000)) {
		try {
			await loadJwks();
		} catch (err) {
			console.error('jwks', err);
			if (!jwks.has(kid)) throw new HttpError(503, 'The login service is unreachable. Try again shortly.');
		}
	}
	return jwks.get(kid);
}

const ALGS = {
	RS256: (key) => key,
	ES256: (key) => ({ key, dsaEncoding: 'ieee-p1363' }),
};

/** Returns the username for a valid owner token, or null. */
async function verifyOwner(headers) {
	const auth = headers?.authorization ?? '';
	if (!auth.startsWith('Bearer ') || !OIDC_ISSUER || !OIDC_CLIENT_ID) return null;
	const parts = auth.slice(7).trim().split('.');
	if (parts.length !== 3) return null;
	let header, claims;
	try {
		header = JSON.parse(Buffer.from(parts[0], 'base64url'));
		claims = JSON.parse(Buffer.from(parts[1], 'base64url'));
	} catch {
		return null;
	}
	const alg = ALGS[header.alg]; // never 'none' or HS256
	if (!alg || typeof header.kid !== 'string') return null;
	const key = await signingKey(header.kid);
	if (!key) return null;
	const ok = verify('sha256', Buffer.from(`${parts[0]}.${parts[1]}`), alg(key), Buffer.from(parts[2], 'base64url'));
	if (!ok) return null;

	const now = Math.floor(Date.now() / 1000);
	const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
	if (claims.iss !== OIDC_ISSUER || !aud.includes(OIDC_CLIENT_ID)) return null;
	if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_SECONDS < now) return null;
	if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_SKEW_SECONDS > now) return null;
	if (!allowedUsers.has(claims.sub)) return null;
	return claims.sub;
}

// ---------- helpers ----------

// Keep names readable but safe as S3 keys and download filenames.
function cleanName(name) {
	const cleaned = String(name ?? '')
		.normalize('NFKC')
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
		.replace(/^\.+/, '')
		.trim()
		.slice(0, 150);
	return cleaned || 'file';
}

// "Mom's tax docs!" -> "mom-s-tax-docs". Used in drop keys, so never contains "--".
function slugify(label) {
	return (
		String(label)
			.normalize('NFKD')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 40)
			.replace(/-+$/, '') || 'guest'
	);
}

// drops/2026-10-30T17-05-12Z-a1b2c3/<name>, or drops/...-a1b2c3--<from>/<name> for guest uploads.
// Sorts by time and never collides.
function newKey(name, from) {
	const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z').replace(/:/g, '-');
	const folder = `${stamp}-${randomBytes(3).toString('hex')}${from ? `--${from}` : ''}`;
	return `${PREFIX}${folder}/${cleanName(name)}`;
}

function parseBody(event) {
	if (!event.body) return {};
	const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
	try {
		const body = JSON.parse(raw);
		return body && typeof body === 'object' ? body : null;
	} catch {
		return null;
	}
}

function checkSize(body) {
	const size = Number(body.size);
	if (!Number.isFinite(size) || size <= 0) throw new HttpError(400, 'size is required');
	if (size > MAX_FILE_BYTES) throw new HttpError(413, `Files are limited to ${MAX_FILE_BYTES / 1024 / 1024} MB`);
}

async function presignUpload(body, from) {
	checkSize(body);
	const key = newKey(body.name, from);
	const post = await createPresignedPost(s3, {
		Bucket: BUCKET,
		Key: key,
		Conditions: [['content-length-range', 1, MAX_FILE_BYTES]],
		Fields: { 'Content-Type': String(body.type || 'application/octet-stream').slice(0, 100) },
		Expires: URL_TTL_SECONDS,
	});
	return { key, url: post.url, fields: post.fields };
}

const isMissing = (err) => ['NoSuchKey', 'NotFound', 'AccessDenied'].includes(err?.name);

// ---------- upload links ----------

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const linkKey = (id) => `${LINKS}${id}.json`;

async function getLink(id) {
	try {
		const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: linkKey(id) }));
		return { link: JSON.parse(await obj.Body.transformToString('utf-8')), etag: obj.ETag };
	} catch (err) {
		if (isMissing(err)) return null;
		throw err;
	}
}

const putLink = (link, etag) =>
	s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: linkKey(link.id),
			Body: JSON.stringify(link),
			ContentType: 'application/json',
			...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' }),
		}),
	);

function linkState(link) {
	if (link.revoked) return 'revoked';
	if (Date.parse(link.expires) <= Date.now()) return 'expired';
	if (link.used >= link.maxFiles) return 'used up';
	return 'active';
}

// What the owner sees. Never includes the token: only its hash is stored.
const publicLink = (link) => ({ ...link, state: linkState(link), remaining: Math.max(0, link.maxFiles - link.used) });

async function guestLink(headers) {
	const token = headers?.['x-drop-link'] ?? '';
	if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
	return getLink(hashToken(token));
}

// ---------- owner routes ----------

async function createNote(body) {
	const text = String(body.text ?? '');
	if (!text.trim()) throw new HttpError(400, 'Note is empty');
	if (text.length > MAX_NOTE_CHARS) throw new HttpError(413, 'Note is too long');
	const key = newKey('note.txt');
	await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: text, ContentType: 'text/plain; charset=utf-8' }));
	return { key };
}

async function listAll(prefix) {
	const objects = [];
	let ContinuationToken;
	do {
		const page = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken }));
		objects.push(...(page.Contents ?? []));
		ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
	} while (ContinuationToken);
	return objects;
}

async function listDrops() {
	const items = [];
	for (const obj of await listAll(PREFIX)) {
		const [, folder = '', name = ''] = obj.Key.split('/');
		const url = await getSignedUrl(
			s3,
			new GetObjectCommand({
				Bucket: BUCKET,
				Key: obj.Key,
				ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
			}),
			{ expiresIn: URL_TTL_SECONDS },
		);
		items.push({ key: obj.Key, name, from: folder.split('--')[1] ?? null, size: obj.Size, modified: obj.LastModified, url });
	}
	items.sort((a, b) => (a.key < b.key ? 1 : -1));
	return { items };
}

async function readNote(body) {
	const key = String(body.key ?? '');
	if (!key.startsWith(PREFIX) || !key.endsWith('/note.txt') || key.includes('..')) throw new HttpError(400, 'Not a note');
	const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
	return { text: await obj.Body.transformToString('utf-8') };
}

async function deleteDrop(body) {
	const key = String(body.key ?? '');
	if (!key.startsWith(PREFIX) || key.includes('..')) throw new HttpError(400, 'Bad key');
	await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
	return { deleted: key };
}

async function createLink(body, owner) {
	const label = String(body.label ?? '').trim().slice(0, 60);
	if (!label) throw new HttpError(400, 'Give the link a name, such as who it is for');
	const hours = Number(body.hours ?? 24);
	if (!Number.isInteger(hours) || hours < 1 || hours > LINK_MAX_HOURS) throw new HttpError(400, `hours must be 1-${LINK_MAX_HOURS}`);
	const maxFiles = Number(body.maxFiles ?? 10);
	if (!Number.isInteger(maxFiles) || maxFiles < 1 || maxFiles > LINK_MAX_FILES) throw new HttpError(400, `maxFiles must be 1-${LINK_MAX_FILES}`);

	const token = randomBytes(24).toString('base64url'); // 192 bits, shown to the owner once
	const now = new Date();
	const link = {
		id: hashToken(token),
		label,
		from: slugify(label),
		createdBy: owner,
		created: now.toISOString(),
		expires: new Date(now.getTime() + hours * 3600_000).toISOString(),
		maxFiles,
		used: 0,
		revoked: false,
	};
	await putLink(link);
	return { token, link: publicLink(link) };
}

async function listLinks() {
	const links = [];
	for (const obj of await listAll(LINKS)) {
		const id = obj.Key.slice(LINKS.length).replace(/\.json$/, '');
		const found = await getLink(id);
		if (found) links.push(publicLink(found.link));
	}
	links.sort((a, b) => (a.created < b.created ? 1 : -1));
	return { links };
}

async function revokeLink(body) {
	const id = String(body.id ?? '');
	if (!/^[0-9a-f]{64}$/.test(id)) throw new HttpError(400, 'Bad link id');
	const found = await getLink(id);
	if (!found) throw new HttpError(404, 'No such link');
	found.link.revoked = true;
	await putLink(found.link, found.etag);
	return { link: publicLink(found.link) };
}

// ---------- guest routes ----------

function usable(found) {
	if (!found) throw new HttpError(401, 'This upload link is not valid');
	const state = linkState(found.link);
	if (state !== 'active') throw new HttpError(410, state === 'used up' ? 'This upload link has been used up' : 'This upload link has expired');
	return found;
}

async function guestInfo(_body, found) {
	const { link } = usable(found);
	return { label: link.label, expires: link.expires, remaining: link.maxFiles - link.used, maxFileBytes: MAX_FILE_BYTES };
}

async function guestUpload(body, found, headers) {
	checkSize(body);
	// Count the upload first. If-Match makes concurrent uploads retry instead of overwriting each other's count.
	for (let attempt = 0; ; attempt++) {
		const { link, etag } = usable(found);
		link.used += 1;
		try {
			await putLink(link, etag);
			return { ...(await presignUpload(body, link.from)), remaining: link.maxFiles - link.used };
		} catch (err) {
			if (err?.name !== 'PreconditionFailed' && err?.$metadata?.httpStatusCode !== 412) throw err;
			if (attempt >= 4) throw new HttpError(409, 'Busy, try again');
			found = await guestLink(headers);
		}
	}
}

// ---------- routing ----------

const ownerRoutes = {
	'/upload': (body) => presignUpload(body),
	'/note': createNote,
	'/list': listDrops,
	'/read': readNote,
	'/delete': deleteDrop,
	'/links': listLinks,
	'/links/create': createLink,
	'/links/revoke': revokeLink,
};

const guestRoutes = {
	'/guest/info': guestInfo,
	'/guest/upload': guestUpload,
};

// Slow down guessing; reserved concurrency caps how many guesses run at once.
const slowDeny = async (status, error) => {
	await new Promise((r) => setTimeout(r, 1000));
	return reply(status, { error });
};

export async function handler(event) {
	if (event.requestContext?.http?.method !== 'POST') return reply(405, { error: 'POST only' });
	const path = event.rawPath;
	const ownerRoute = ownerRoutes[path];
	const guestRoute = guestRoutes[path];
	if (!ownerRoute && !guestRoute) return reply(404, { error: 'Unknown endpoint' });
	const body = parseBody(event);
	if (body === null) return reply(400, { error: 'Invalid JSON' });

	try {
		if (ownerRoute) {
			const owner = await verifyOwner(event.headers);
			if (!owner) return await slowDeny(401, 'Please sign in again');
			return reply(200, await ownerRoute(body, owner));
		}
		const found = await guestLink(event.headers);
		if (!found) return await slowDeny(401, 'This upload link is not valid');
		return reply(200, await guestRoute(body, found, event.headers));
	} catch (err) {
		if (err instanceof HttpError) return reply(err.status, { error: err.message });
		console.error(path, err);
		return reply(500, { error: 'Something went wrong' });
	}
}

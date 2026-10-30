// matheesan.ca/drop backend: a Lambda function URL that hands out short-lived S3 URLs.
// Files go browser -> S3 directly (presigned POST), so the Lambda never sees file bytes.
// Every request must carry the drop passphrase in the x-drop-key header.
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

const { BUCKET, KEY_SALT, KEY_HASH } = process.env;
const PREFIX = 'drops/';
const MAX_FILE_BYTES = 250 * 1024 * 1024;
const MAX_NOTE_CHARS = 100_000;
const URL_TTL_SECONDS = 15 * 60;

const s3 = new S3Client({});
const expectedHash = Buffer.from(KEY_HASH ?? '', 'hex');

function authorized(headers) {
	const given = headers?.['x-drop-key'];
	if (!given || expectedHash.length === 0) return false;
	const hash = scryptSync(given, Buffer.from(KEY_SALT, 'hex'), expectedHash.length);
	return timingSafeEqual(hash, expectedHash);
}

const reply = (statusCode, body) => ({
	statusCode,
	headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	body: JSON.stringify(body),
});

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

// drops/2026-10-30T17-05-12Z-a1b2c3/<name>: sorts by time, never collides.
function newKey(name) {
	const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z').replace(/:/g, '-');
	return `${PREFIX}${stamp}-${randomBytes(3).toString('hex')}/${cleanName(name)}`;
}

function parseBody(event) {
	if (!event.body) return {};
	const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

async function createUpload(body) {
	const size = Number(body.size);
	if (!Number.isFinite(size) || size <= 0) return reply(400, { error: 'size is required' });
	if (size > MAX_FILE_BYTES) return reply(413, { error: `Files are limited to ${MAX_FILE_BYTES / 1024 / 1024} MB` });
	const key = newKey(body.name);
	const post = await createPresignedPost(s3, {
		Bucket: BUCKET,
		Key: key,
		Conditions: [['content-length-range', 1, MAX_FILE_BYTES]],
		Fields: { 'Content-Type': String(body.type || 'application/octet-stream').slice(0, 100) },
		Expires: URL_TTL_SECONDS,
	});
	return reply(200, { key, url: post.url, fields: post.fields });
}

async function createNote(body) {
	const text = String(body.text ?? '');
	if (!text.trim()) return reply(400, { error: 'Note is empty' });
	if (text.length > MAX_NOTE_CHARS) return reply(413, { error: 'Note is too long' });
	const key = newKey('note.txt');
	await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: text, ContentType: 'text/plain; charset=utf-8' }));
	return reply(200, { key });
}

async function listDrops() {
	const items = [];
	let ContinuationToken;
	do {
		const page = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PREFIX, ContinuationToken }));
		for (const obj of page.Contents ?? []) {
			const name = obj.Key.split('/').pop();
			const url = await getSignedUrl(
				s3,
				new GetObjectCommand({
					Bucket: BUCKET,
					Key: obj.Key,
					ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
				}),
				{ expiresIn: URL_TTL_SECONDS },
			);
			items.push({ key: obj.Key, name, size: obj.Size, modified: obj.LastModified, url });
		}
		ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
	} while (ContinuationToken);
	items.sort((a, b) => (a.key < b.key ? 1 : -1));
	return reply(200, { items });
}

async function readNote(body) {
	const key = String(body.key ?? '');
	if (!key.startsWith(PREFIX) || !key.endsWith('/note.txt')) return reply(400, { error: 'Not a note' });
	const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
	return reply(200, { text: await obj.Body.transformToString('utf-8') });
}

async function deleteDrop(body) {
	const key = String(body.key ?? '');
	if (!key.startsWith(PREFIX) || key.includes('..')) return reply(400, { error: 'Bad key' });
	await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
	return reply(200, { deleted: key });
}

const routes = {
	'/upload': createUpload,
	'/note': createNote,
	'/list': listDrops,
	'/read': readNote,
	'/delete': deleteDrop,
};

export async function handler(event) {
	if (event.requestContext?.http?.method !== 'POST') return reply(405, { error: 'POST only' });
	const route = routes[event.rawPath];
	if (!route) return reply(404, { error: 'Unknown endpoint' });
	if (!authorized(event.headers)) {
		// Slow down guessing; reserved concurrency caps how many guesses run at once.
		await new Promise((r) => setTimeout(r, 1000));
		return reply(401, { error: 'Wrong passphrase' });
	}
	const body = parseBody(event);
	if (body === null) return reply(400, { error: 'Invalid JSON' });
	try {
		return await route(body);
	} catch (err) {
		console.error(event.rawPath, err);
		return reply(500, { error: 'Something went wrong' });
	}
}

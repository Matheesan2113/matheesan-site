// Offline test for lambda/index.mjs: bundles it the way deploy.mjs does, then checks owner auth (Authentik JWTs
// signed by a throwaway key), guest upload links, routing and validation. Nothing leaves this machine: JWKS comes
// from a stubbed fetch and S3 is a small in-memory fake on localhost.
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const ISSUER = 'https://auth.example.test/application/o/matheesan-drop/';
const CLIENT_ID = 'matheesan-drop';
const BUCKET = 'test-bucket';

// ---- fake S3 (path-style): PUT/GET/DELETE objects, ListObjectsV2, If-Match / If-None-Match ----
const store = new Map(); // key -> { body: Buffer, etag }
const xmlError = (res, status, code) => {
	res.writeHead(status, { 'content-type': 'application/xml' });
	res.end(`<?xml version="1.0" encoding="UTF-8"?><Error><Code>${code}</Code><Message>${code}</Message></Error>`);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const s3 = createServer(async (req, res) => {
	const chunks = [];
	for await (const c of req) chunks.push(c);
	const body = Buffer.concat(chunks);
	const url = new URL(req.url, 'http://x');
	const path = decodeURIComponent(url.pathname);
	const key = path.slice(`/${BUCKET}/`.length);
	if (req.method === 'GET' && (path === `/${BUCKET}` || path === `/${BUCKET}/`) && url.searchParams.get('list-type') === '2') {
		const prefix = url.searchParams.get('prefix') ?? '';
		const items = [...store].filter(([k]) => k.startsWith(prefix));
		res.writeHead(200, { 'content-type': 'application/xml' });
		return res.end(
			`<?xml version="1.0" encoding="UTF-8"?><ListBucketResult><Name>${BUCKET}</Name><Prefix>${esc(prefix)}</Prefix>` +
				`<KeyCount>${items.length}</KeyCount><IsTruncated>false</IsTruncated>` +
				items
					.map(([k, v]) => `<Contents><Key>${esc(k)}</Key><Size>${v.body.length}</Size><LastModified>2026-11-10T12:00:00.000Z</LastModified><ETag>${v.etag}</ETag></Contents>`)
					.join('') +
				'</ListBucketResult>',
		);
	}
	const existing = store.get(key);
	if (req.method === 'PUT') {
		if (req.headers['if-none-match'] === '*' && existing) return xmlError(res, 412, 'PreconditionFailed');
		if (req.headers['if-match'] && req.headers['if-match'] !== existing?.etag) return xmlError(res, 412, 'PreconditionFailed');
		const etag = `"${createHash('md5').update(body).update(randomBytes(4)).digest('hex')}"`;
		store.set(key, { body, etag });
		res.writeHead(200, { etag });
		return res.end();
	}
	if (req.method === 'GET') {
		if (!existing) return xmlError(res, 404, 'NoSuchKey');
		res.writeHead(200, { etag: existing.etag, 'content-length': existing.body.length });
		return res.end(existing.body);
	}
	if (req.method === 'DELETE') {
		store.delete(key);
		res.writeHead(204);
		return res.end();
	}
	xmlError(res, 400, 'Unsupported');
});
await new Promise((r) => s3.listen(0, '127.0.0.1', r));

// ---- fake Authentik signing key + JWKS ----
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
const KID = 'test-kid';
const realFetch = globalThis.fetch;
let jwksFetches = 0;
globalThis.fetch = async (url, opts) => {
	if (String(url) === `${ISSUER}jwks/`) {
		jwksFetches++;
		return new Response(JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' }] }));
	}
	return realFetch(url, opts);
};

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(claims = {}, { key = privateKey, header = {} } = {}) {
	const now = Math.floor(Date.now() / 1000);
	const h = b64({ alg: 'RS256', kid: KID, typ: 'JWT', ...header });
	const p = b64({ iss: ISSUER, aud: CLIENT_ID, sub: 'owner', iat: now, exp: now + 3600, ...claims });
	const sig = header.alg === 'none' ? '' : sign('sha256', Buffer.from(`${h}.${p}`), key).toString('base64url');
	return `${h}.${p}.${sig}`;
}

Object.assign(process.env, {
	BUCKET,
	OIDC_ISSUER: ISSUER,
	OIDC_CLIENT_ID: CLIENT_ID,
	ALLOWED_USERS: 'owner, second-owner',
	S3_ENDPOINT: `http://127.0.0.1:${s3.address().port}`,
	AWS_REGION: 'ca-central-1',
	AWS_ACCESS_KEY_ID: 'AKIAFAKEFAKEFAKE',
	AWS_SECRET_ACCESS_KEY: 'fake',
});

const out = await build({
	entryPoints: [fileURLToPath(new URL('../lambda/index.mjs', import.meta.url))],
	bundle: true,
	platform: 'node',
	format: 'esm',
	write: false,
	outfile: 'index.mjs',
	banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
const bundlePath = join(mkdtempSync(join(tmpdir(), 'drop-smoke-')), 'index.mjs');
writeFileSync(bundlePath, out.outputFiles[0].contents);
const { handler } = await import(pathToFileURL(bundlePath).href);

const call = async (path, { token, link, body = {}, method = 'POST' } = {}) => {
	const headers = {};
	if (token) headers.authorization = `Bearer ${token}`;
	if (link) headers['x-drop-link'] = link;
	const res = await handler({ rawPath: path, requestContext: { http: { method } }, headers, body: JSON.stringify(body) });
	return { status: res.statusCode, body: JSON.parse(res.body) };
};
const status = async (...args) => (await call(...args)).status;
const OWNER = jwt();

// ---- routing ----
assert.equal(await status('/list', { token: OWNER, method: 'GET' }), 405);
assert.equal(await status('/nope', { token: OWNER }), 404);

// ---- owner auth: everything that must be refused (run together; each refusal waits 1 s) ----
const now = Math.floor(Date.now() / 1000);
const refused = {
	'no token': {},
	garbage: { token: 'not.a.jwt' },
	'other key': { token: jwt({}, { key: other.privateKey }) },
	'alg none': { token: jwt({}, { header: { alg: 'none' } }) },
	'alg HS256': { token: jwt({}, { header: { alg: 'HS256' } }) },
	'unknown kid': { token: jwt({}, { header: { kid: 'nope' } }) },
	'wrong issuer': { token: jwt({ iss: 'https://evil.test/' }) },
	'wrong audience': { token: jwt({ aud: 'some-other-app' }) },
	expired: { token: jwt({ exp: now - 120 }) },
	'not yet valid': { token: jwt({ nbf: now + 600 }) },
	'user not allowed': { token: jwt({ sub: 'mallory' }) },
	'guest link on owner route': { link: 'A'.repeat(32) },
};
const refusedResults = await Promise.all(Object.entries(refused).map(async ([name, opts]) => [name, await status('/list', opts)]));
for (const [name, code] of refusedResults) assert.equal(code, 401, `${name} should be refused`);
assert.equal(await status('/list', { token: jwt({ aud: ['x', CLIENT_ID], sub: 'second-owner' }) }), 200);
assert.equal(jwksFetches <= 2, true, `JWKS fetched ${jwksFetches} times; should be cached`);

// ---- owner validation ----
assert.equal(await status('/upload', { token: OWNER, body: { name: 'big.zip', size: 300e6 } }), 413);
assert.equal(await status('/upload', { token: OWNER, body: { name: 'x' } }), 400);
assert.equal(await status('/note', { token: OWNER, body: { text: '   ' } }), 400);
assert.equal(await status('/delete', { token: OWNER, body: { key: '../secret' } }), 400);
assert.equal(await status('/delete', { token: OWNER, body: { key: 'links/abc.json' } }), 400);
assert.equal(await status('/read', { token: OWNER, body: { key: 'drops/a/photo.jpg' } }), 400);
assert.equal((await handler({ rawPath: '/list', requestContext: { http: { method: 'POST' } }, headers: { authorization: `Bearer ${OWNER}` }, body: '{bad' })).statusCode, 400);

const up = await call('/upload', { token: OWNER, body: { name: '../we:ird/name?.pdf', size: 1234, type: 'application/pdf' } });
assert.equal(up.status, 200);
assert.match(up.body.key, /^drops\/\d{4}-\d\d-\d\dT\d\d-\d\d-\d\dZ-[0-9a-f]{6}\/[^/]+$/);
assert.ok(up.body.key.endsWith('/_we_ird_name_.pdf'), up.body.key);
assert.equal(up.body.fields.key, up.body.key);
assert.ok(up.body.fields.Policy && up.body.fields['X-Amz-Signature']);

// ---- notes round trip ----
const note = await call('/note', { token: OWNER, body: { text: 'hello\nworld' } });
assert.equal(note.status, 200);
assert.equal((await call('/read', { token: OWNER, body: { key: note.body.key } })).body.text, 'hello\nworld');
let inbox = (await call('/list', { token: OWNER })).body.items;
assert.equal(inbox.length, 1);
assert.equal(inbox[0].from, null);
assert.equal((await call('/delete', { token: OWNER, body: { key: note.body.key } })).status, 200);
assert.equal((await call('/list', { token: OWNER })).body.items.length, 0);

// ---- upload links ----
assert.equal(await status('/links/create', { token: OWNER, body: { label: '  ' } }), 400);
assert.equal(await status('/links/create', { token: OWNER, body: { label: 'x', hours: 0 } }), 400);
assert.equal(await status('/links/create', { token: OWNER, body: { label: 'x', hours: 200 } }), 400);
assert.equal(await status('/links/create', { token: OWNER, body: { label: 'x', maxFiles: 51 } }), 400);
assert.equal(await status('/links/create', { token: OWNER, body: { label: 'x', hours: 1.5 } }), 400);

const created = await call('/links/create', { token: OWNER, body: { label: "Mom's tax docs!", hours: 24, maxFiles: 2 } });
assert.equal(created.status, 200);
const { token: linkToken, link } = created.body;
assert.match(linkToken, /^[A-Za-z0-9_-]{32}$/);
assert.equal(link.from, 'mom-s-tax-docs');
assert.equal(link.state, 'active');
assert.equal(link.createdBy, 'owner');
assert.ok(![...store.values()].some((v) => v.body.includes(linkToken)), 'the token itself must never be stored');

const info = await call('/guest/info', { link: linkToken });
assert.equal(info.status, 200);
assert.deepEqual([info.body.label, info.body.remaining], ["Mom's tax docs!", 2]);
assert.equal(await status('/guest/upload', { link: linkToken, body: { name: 'x', size: 300e6 } }), 413);

const g1 = await call('/guest/upload', { link: linkToken, body: { name: 'T4 2025.pdf', size: 10, type: 'application/pdf' } });
assert.equal(g1.status, 200);
assert.match(g1.body.key, /^drops\/[^/]+-[0-9a-f]{6}--mom-s-tax-docs\/T4 2025\.pdf$/);
assert.equal(g1.body.remaining, 1);
assert.equal((await call('/guest/upload', { link: linkToken, body: { name: 'b', size: 10 } })).status, 200);
const usedUp = await call('/guest/upload', { link: linkToken, body: { name: 'c', size: 10 } });
assert.equal(usedUp.status, 410);
assert.match(usedUp.body.error, /used up/);

// Guests can't do anything else, and bad tokens are refused.
const [badLink, guestList] = await Promise.all([status('/guest/info', { link: 'B'.repeat(32) }), status('/list', { link: linkToken })]);
assert.equal(badLink, 401);
assert.equal(guestList, 401);

// The inbox labels guest uploads by link.
store.set(g1.body.key, { body: Buffer.from('pdf'), etag: '"x"' });
inbox = (await call('/list', { token: OWNER })).body.items;
assert.equal(inbox.length, 1);
assert.equal(inbox[0].from, 'mom-s-tax-docs');
assert.equal(inbox[0].name, 'T4 2025.pdf');

// Links list + revoke + expiry.
const second = (await call('/links/create', { token: OWNER, body: { label: 'Alex', hours: 1, maxFiles: 5 } })).body;
let links = (await call('/links', { token: OWNER })).body.links;
assert.equal(links.length, 2);
assert.deepEqual(links.map((l) => l.state).sort(), ['active', 'used up']);
assert.ok(links.every((l) => !('token' in l)));
assert.equal((await call('/links/revoke', { token: OWNER, body: { id: second.link.id } })).body.link.state, 'revoked');
assert.equal(await status('/guest/info', { link: second.token }), 410);
assert.equal(await status('/links/revoke', { token: OWNER, body: { id: 'nope' } }), 400);

const third = (await call('/links/create', { token: OWNER, body: { label: 'Later', hours: 1 } })).body;
const rec = store.get(`links/${third.link.id}.json`);
const expired = { ...JSON.parse(rec.body), expires: new Date(Date.now() - 1000).toISOString() };
store.set(`links/${third.link.id}.json`, { body: Buffer.from(JSON.stringify(expired)), etag: '"e"' });
const exp = await call('/guest/info', { link: third.token });
assert.equal(exp.status, 410);
assert.match(exp.body.error, /expired/);

// Concurrent guest uploads never exceed maxFiles.
const race = (await call('/links/create', { token: OWNER, body: { label: 'Race', maxFiles: 3 } })).body;
const results = await Promise.all(
	Array.from({ length: 6 }, (_, i) => status('/guest/upload', { link: race.token, body: { name: `f${i}`, size: 1 } })),
);
assert.equal(results.filter((s) => s === 200).length, 3, `got ${results}`);
assert.ok(results.every((s) => s === 200 || s === 410 || s === 409), `got ${results}`);
assert.equal(JSON.parse(store.get(`links/${race.link.id}.json`).body).used, 3);

s3.close();
console.log(`ok - bundle ${Math.round(out.outputFiles[0].contents.length / 1024)} KB, ${jwksFetches} JWKS fetch(es)`);

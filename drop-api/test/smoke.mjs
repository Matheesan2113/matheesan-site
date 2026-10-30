// Offline smoke test for lambda/index.mjs: bundles it the way deploy.mjs does, then checks auth,
// routing and validation. S3 is never contacted (presigning is local; list/note/read are not called).
import { scryptSync, randomBytes } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const PASS = 'correct-horse-battery';
const salt = randomBytes(16);
Object.assign(process.env, {
	BUCKET: 'test-bucket',
	KEY_SALT: salt.toString('hex'),
	KEY_HASH: scryptSync(PASS, salt, 32).toString('hex'),
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

const call = async (path, key, body, method = 'POST') => {
	const res = await handler({
		rawPath: path,
		requestContext: { http: { method } },
		headers: key ? { 'x-drop-key': key } : {},
		body: JSON.stringify(body),
	});
	return { status: res.statusCode, body: JSON.parse(res.body) };
};

assert.equal((await call('/list', PASS, {}, 'GET')).status, 405);
assert.equal((await call('/list', null, {})).status, 401);
assert.equal((await call('/list', 'wrong-passphrase-here', {})).status, 401);
assert.equal((await call('/nope', PASS, {})).status, 404);
assert.equal((await call('/upload', PASS, { name: 'big.zip', size: 300e6 })).status, 413);
assert.equal((await call('/upload', PASS, { name: 'x' })).status, 400);
assert.equal((await call('/note', PASS, { text: '   ' })).status, 400);
assert.equal((await call('/delete', PASS, { key: '../secret' })).status, 400);
assert.equal((await call('/read', PASS, { key: 'drops/a/photo.jpg' })).status, 400);

const up = await call('/upload', PASS, { name: '../we:ird/name?.pdf', size: 1234, type: 'application/pdf' });
assert.equal(up.status, 200);
assert.match(up.body.key, /^drops\/\d{4}-\d\d-\d\dT\d\d-\d\d-\d\dZ-[0-9a-f]{6}\/[^/]+$/);
assert.ok(up.body.key.endsWith('/_we_ird_name_.pdf'), up.body.key);
assert.equal(up.body.fields.key, up.body.key);
assert.ok(up.body.fields.Policy && up.body.fields['X-Amz-Signature']);

console.log(`ok - bundle ${Math.round(out.outputFiles[0].contents.length / 1024)} KB, sample key ${up.body.key}`);

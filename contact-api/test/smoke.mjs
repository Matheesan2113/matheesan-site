// Offline smoke test for lambda/index.mjs: bundles it the way deploy.mjs does, then exercises the handler with
// a fake Turnstile check and a fake mail sender. Nothing touches AWS or Cloudflare.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

Object.assign(process.env, { AWS_REGION: 'ca-central-1', AWS_ACCESS_KEY_ID: 'AKIAFAKEFAKEFAKE', AWS_SECRET_ACCESS_KEY: 'fake' });

const out = await build({
	entryPoints: [fileURLToPath(new URL('../lambda/index.mjs', import.meta.url))],
	bundle: true,
	platform: 'node',
	format: 'esm',
	write: false,
	outfile: 'index.mjs',
	banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
const bundlePath = join(mkdtempSync(join(tmpdir(), 'contact-smoke-')), 'index.mjs');
writeFileSync(bundlePath, out.outputFiles[0].contents);
const { makeHandler, verifyTurnstile } = await import(pathToFileURL(bundlePath).href);

const env = { CONTACT_TO: 'owner@example.com', CONTACT_FROM: 'Site <contact@example.org>', TURNSTILE_SECRET: 'secret' };
const sent = [];
const handler = makeHandler({
	env,
	verify: async ({ token }) => token === 'good-token',
	sendMail: async (params) => sent.push(params),
});

const good = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there, nice homelab!', token: 'good-token' };
const call = async (body, method = 'POST') => {
	const res = await handler({
		requestContext: { http: { method, sourceIp: '203.0.113.9', userAgent: 'test-agent' } },
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
	return { status: res.statusCode, body: JSON.parse(res.body) };
};

assert.equal((await call(good, 'GET')).status, 405);
assert.equal((await call('not json')).status, 400);
assert.equal((await call({ ...good, name: '  ' })).status, 400);
assert.equal((await call({ ...good, email: 'nope' })).status, 400);
assert.equal((await call({ ...good, email: 'a@b.com\r\nBcc: victim@example.com' })).status, 400);
assert.equal((await call({ ...good, message: 'short' })).status, 400);
assert.equal((await call({ ...good, message: 'x'.repeat(5001) })).status, 400);
assert.equal((await call({ ...good, token: 'bad-token' })).status, 403);
assert.equal(sent.length, 0, 'nothing sent for rejected requests');

// Honeypot: looks successful, sends nothing.
assert.deepEqual(await call({ ...good, website: 'http://spam.example' }), { status: 200, body: { ok: true } });
assert.equal(sent.length, 0);

// Header injection in the name is flattened to one line.
const ok = await call({ ...good, name: 'Ada\r\nBcc: victim@example.com' });
assert.equal(ok.status, 200);
assert.equal(sent.length, 1);
const mail = sent[0];
assert.deepEqual(mail.Destination.ToAddresses, ['owner@example.com'], 'recipient is fixed');
assert.deepEqual(mail.ReplyToAddresses, ['ada@example.com']);
assert.equal(mail.FromEmailAddress, env.CONTACT_FROM);
assert.ok(!/[\r\n]/.test(mail.Content.Simple.Subject.Data), 'subject is one line');
assert.match(mail.Content.Simple.Body.Text.Data, /Hello there, nice homelab!/);

// Missing config fails closed.
const unconfigured = makeHandler({ env: {}, verify: async () => true, sendMail: async () => assert.fail('must not send') });
assert.equal((await unconfigured({ requestContext: { http: { method: 'POST' } }, body: JSON.stringify(good) })).statusCode, 503);

// verifyTurnstile: action and hostname must both match.
const fakeFetch = (data) => async () => ({ ok: true, json: async () => data });
const base = { secret: 's', token: 't', ip: '1.2.3.4', allowedHosts: ['matheesan.ca'] };
assert.equal(await verifyTurnstile({ ...base, fetchImpl: fakeFetch({ success: true, action: 'contact', hostname: 'matheesan.ca' }) }), true);
assert.equal(await verifyTurnstile({ ...base, fetchImpl: fakeFetch({ success: true, action: 'login', hostname: 'matheesan.ca' }) }), false);
assert.equal(await verifyTurnstile({ ...base, fetchImpl: fakeFetch({ success: true, action: 'contact', hostname: 'evil.example' }) }), false);
assert.equal(await verifyTurnstile({ ...base, fetchImpl: fakeFetch({ success: false }) }), false);
assert.equal(await verifyTurnstile({ ...base, token: '' }), false);

console.log(`ok - bundle ${Math.round(out.outputFiles[0].contents.length / 1024)} KB, ${sent.length} message(s) through the fake sender`);

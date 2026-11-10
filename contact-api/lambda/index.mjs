// matheesan.ca/contact backend: a Lambda function URL that checks a Cloudflare Turnstile token and then
// emails the message to the site owner through Amazon SES.
//
// Safety rules:
//  - The recipient is fixed (CONTACT_TO env var). Visitors can never choose who gets mail, and they never
//    receive mail themselves (no auto-reply), so the form cannot be used to spam other people.
//  - The visitor's address only goes in Reply-To, after strict validation. Name and subject-like fields are
//    stripped of control characters so nothing can inject headers.
//  - Bots that fill the hidden honeypot field get a normal-looking 200 and nothing is sent.
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const LIMITS = { name: 100, email: 254, message: 5000, minMessage: 10 };
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const reply = (statusCode, body) => ({
	statusCode,
	headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	body: JSON.stringify(body),
});

function parseBody(event) {
	if (!event.body) return null;
	const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
	if (raw.length > 20_000) return null;
	try {
		const body = JSON.parse(raw);
		return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
	} catch {
		return null;
	}
}

// One line, no control characters (blocks header injection), trimmed and capped.
const oneLine = (value, max) =>
	String(value ?? '')
		.normalize('NFKC')
		.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
		.trim()
		.slice(0, max);

// Multi-line text: keep newlines/tabs, drop other control characters.
const multiLine = (value, max) =>
	String(value ?? '')
		.normalize('NFKC')
		.replace(/\r\n?/g, '\n')
		.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
		.trim()
		.slice(0, max);

export function validate(body) {
	const name = oneLine(body.name, LIMITS.name);
	const email = oneLine(body.email, LIMITS.email);
	const message = multiLine(body.message, LIMITS.message + 1);
	if (!name) return { error: 'Please add your name.' };
	if (!EMAIL_RE.test(email)) return { error: 'Please use a valid email address.' };
	if (message.length < LIMITS.minMessage) return { error: 'The message is a little short.' };
	if (message.length > LIMITS.message) return { error: `Please keep it under ${LIMITS.message} characters.` };
	return { name, email, message };
}

export async function verifyTurnstile({ secret, token, ip, allowedHosts, fetchImpl = fetch }) {
	if (!secret || !token || typeof token !== 'string' || token.length > 4096) return false;
	const form = new URLSearchParams({ secret, response: token });
	if (ip) form.set('remoteip', ip);
	const res = await fetchImpl(TURNSTILE_URL, { method: 'POST', body: form, signal: AbortSignal.timeout(5000) });
	if (!res.ok) return false;
	const data = await res.json();
	return data.success === true && data.action === 'contact' && allowedHosts.includes(data.hostname);
}

export function makeHandler({ env = process.env, verify = verifyTurnstile, sendMail } = {}) {
	const ses = sendMail ? null : new SESv2Client({});
	const send = sendMail ?? ((params) => ses.send(new SendEmailCommand(params)));
	const allowedHosts = (env.ALLOWED_HOSTS || 'matheesan.ca,www.matheesan.ca').split(',').map((h) => h.trim());

	return async (event) => {
		if (event.requestContext?.http?.method !== 'POST') return reply(405, { error: 'POST only' });
		if (!env.CONTACT_TO || !env.CONTACT_FROM || !env.TURNSTILE_SECRET) return reply(503, { error: 'Contact form is not configured.' });

		const body = parseBody(event);
		if (!body) return reply(400, { error: 'Bad request.' });
		if (String(body.website ?? '').trim()) return reply(200, { ok: true }); // honeypot: pretend success

		const fields = validate(body);
		if (fields.error) return reply(400, { error: fields.error });

		const ip = event.requestContext?.http?.sourceIp;
		let human = false;
		try {
			human = await verify({ secret: env.TURNSTILE_SECRET, token: body.token, ip, allowedHosts });
		} catch (err) {
			console.error('turnstile check failed', err.name);
		}
		if (!human) return reply(403, { error: 'The anti-spam check failed. Please reload the page and try again.' });

		const agent = oneLine(event.requestContext?.http?.userAgent, 200);
		const text = [
			fields.message,
			'',
			'--',
			`From: ${fields.name} <${fields.email}>`,
			`Sent: ${new Date().toISOString()} via matheesan.ca/contact`,
			`IP: ${ip ?? 'unknown'} · ${agent || 'unknown browser'}`,
			'Reply to this email to answer them directly.',
		].join('\n');

		try {
			await send({
				FromEmailAddress: env.CONTACT_FROM,
				Destination: { ToAddresses: [env.CONTACT_TO] },
				ReplyToAddresses: [fields.email],
				Content: {
					Simple: {
						Subject: { Data: `matheesan.ca: message from ${fields.name}`, Charset: 'UTF-8' },
						Body: { Text: { Data: text, Charset: 'UTF-8' } },
					},
				},
			});
		} catch (err) {
			console.error('ses send failed', err.name, err.message);
			return reply(502, { error: 'Sorry, the message could not be sent. Please try again later.' });
		}
		console.log('contact message sent', { ip, chars: fields.message.length });
		return reply(200, { ok: true });
	};
}

export const handler = makeHandler();

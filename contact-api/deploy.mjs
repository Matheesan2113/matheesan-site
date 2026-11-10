// Deploy (or update) the matheesan.ca/contact backend: an IAM role that may only send from contact@matheesan.ca
// to the owner, a Lambda, and its public function URL. Idempotent: re-run after changing lambda/index.mjs.
//
// Needs AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (see deploy-user-policy.json), optionally AWS_REGION
// (default ca-central-1). First deploy also needs CONTACT_TO, TURNSTILE_SECRET and TURNSTILE_SITE_KEY; later
// deploys keep the deployed values for any that are unset. Never prints secrets or the recipient address.
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { IAMClient, GetRoleCommand, CreateRoleCommand, AttachRolePolicyCommand, PutRolePolicyCommand } from '@aws-sdk/client-iam';
import {
	LambdaClient,
	GetFunctionCommand,
	CreateFunctionCommand,
	UpdateFunctionCodeCommand,
	UpdateFunctionConfigurationCommand,
	PutFunctionConcurrencyCommand,
	GetFunctionUrlConfigCommand,
	CreateFunctionUrlConfigCommand,
	UpdateFunctionUrlConfigCommand,
	AddPermissionCommand,
	waitUntilFunctionActiveV2,
	waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { build } from 'esbuild';
import AdmZip from 'adm-zip';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const region = process.env.AWS_REGION || 'ca-central-1';
const FUNCTION = 'matheesan-contact';
const ROLE = 'matheesan-contact-lambda';
const FROM_ADDRESS = 'contact@matheesan.ca';
const FROM = `matheesan.ca contact form <${FROM_ADDRESS}>`;
const ORIGINS = ['https://matheesan.ca', 'https://www.matheesan.ca', 'http://localhost:4321'];
const ALLOWED_HOSTS = 'matheesan.ca,www.matheesan.ca,localhost';
const RESERVED_CONCURRENCY = 2;

const sts = new STSClient({ region });
const iam = new IAMClient({ region });
const lambda = new LambdaClient({ region });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isNotFound = (err) =>
	err.$metadata?.httpStatusCode === 404 || ['NoSuchEntity', 'NoSuchEntityException', 'ResourceNotFoundException'].includes(err.name);
const opt = (name) => process.env[name]?.trim() || undefined;

async function ensureRole(account, to) {
	let arn;
	try {
		arn = (await iam.send(new GetRoleCommand({ RoleName: ROLE }))).Role.Arn;
		console.log(`role ${ROLE}: exists`);
	} catch (err) {
		if (!isNotFound(err)) throw err;
		const trust = {
			Version: '2012-10-17',
			Statement: [{ Effect: 'Allow', Principal: { Service: 'lambda.amazonaws.com' }, Action: 'sts:AssumeRole' }],
		};
		arn = (await iam.send(new CreateRoleCommand({ RoleName: ROLE, AssumeRolePolicyDocument: JSON.stringify(trust) }))).Role.Arn;
		console.log(`role ${ROLE}: created`);
	}
	await iam.send(
		new AttachRolePolicyCommand({ RoleName: ROLE, PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole' }),
	);
	if (to) {
		// Send only as contact@matheesan.ca and only to the owner. identity/* because SES also checks the
		// recipient's identity while the account is in the sandbox.
		const access = {
			Version: '2012-10-17',
			Statement: [
				{
					Effect: 'Allow',
					Action: 'ses:SendEmail',
					Resource: `arn:aws:ses:${region}:${account}:identity/*`,
					Condition: { StringEquals: { 'ses:FromAddress': FROM_ADDRESS }, 'ForAllValues:StringEquals': { 'ses:Recipients': [to] } },
				},
			],
		};
		await iam.send(new PutRolePolicyCommand({ RoleName: ROLE, PolicyName: 'ses-send-to-owner', PolicyDocument: JSON.stringify(access) }));
		console.log(`role ${ROLE}: SES policy set (from ${FROM_ADDRESS}, owner only)`);
	}
	return arn;
}

async function bundle() {
	const out = await build({
		entryPoints: [join(here, 'lambda', 'index.mjs')],
		bundle: true,
		platform: 'node',
		target: 'node22',
		format: 'esm',
		minify: true,
		write: false,
		outfile: 'index.mjs',
		banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
	});
	const zip = new AdmZip();
	zip.addFile('index.mjs', Buffer.from(out.outputFiles[0].contents));
	return zip.toBuffer();
}

async function ensureFunction(roleArn, code, to, secret) {
	let existing;
	try {
		existing = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION }));
	} catch (err) {
		if (!isNotFound(err)) throw err;
	}
	const vars = {
		...existing?.Configuration?.Environment?.Variables,
		CONTACT_FROM: FROM,
		ALLOWED_HOSTS,
		...(to ? { CONTACT_TO: to } : {}),
		...(secret ? { TURNSTILE_SECRET: secret } : {}),
	};

	if (!existing) {
		if (!to || !secret) throw new Error('First deploy needs CONTACT_TO and TURNSTILE_SECRET');
		const params = {
			FunctionName: FUNCTION,
			Runtime: 'nodejs22.x',
			Architectures: ['arm64'],
			Handler: 'index.handler',
			Role: roleArn,
			Code: { ZipFile: code },
			MemorySize: 128,
			Timeout: 10,
			Environment: { Variables: vars },
		};
		for (let attempt = 1; ; attempt++) {
			try {
				await lambda.send(new CreateFunctionCommand(params));
				break;
			} catch (err) {
				if (err.name !== 'InvalidParameterValueException' || attempt >= 10) throw err;
				await sleep(3000); // a brand-new role takes a few seconds to become assumable
			}
		}
		await waitUntilFunctionActiveV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		console.log(`function ${FUNCTION}: created`);
	} else {
		await lambda.send(new UpdateFunctionCodeCommand({ FunctionName: FUNCTION, ZipFile: code }));
		await waitUntilFunctionUpdatedV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		await lambda.send(new UpdateFunctionConfigurationCommand({ FunctionName: FUNCTION, Environment: { Variables: vars } }));
		await waitUntilFunctionUpdatedV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		console.log(`function ${FUNCTION}: code updated${to ? ', recipient set' : ''}${secret ? ', Turnstile secret set' : ''}`);
	}

	// Caps cost and how fast a flood can fill the owner's inbox.
	try {
		await lambda.send(new PutFunctionConcurrencyCommand({ FunctionName: FUNCTION, ReservedConcurrentExecutions: RESERVED_CONCURRENCY }));
		console.log(`function ${FUNCTION}: reserved concurrency ${RESERVED_CONCURRENCY}`);
	} catch (err) {
		console.warn(`function ${FUNCTION}: could not set reserved concurrency (${err.name})`);
	}
}

async function ensureUrl() {
	const cors = { AllowOrigins: ORIGINS, AllowMethods: ['POST'], AllowHeaders: ['content-type'], MaxAge: 3600 };
	let url;
	try {
		await lambda.send(new GetFunctionUrlConfigCommand({ FunctionName: FUNCTION }));
		url = (await lambda.send(new UpdateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	} catch (err) {
		if (!isNotFound(err)) throw err;
		url = (await lambda.send(new CreateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	}
	const grants = [
		{ StatementId: 'url-invoke-url', Action: 'lambda:InvokeFunctionUrl', FunctionUrlAuthType: 'NONE' },
		{ StatementId: 'url-invoke-function', Action: 'lambda:InvokeFunction', InvokedViaFunctionUrl: true },
	];
	for (const grant of grants) {
		try {
			await lambda.send(new AddPermissionCommand({ FunctionName: FUNCTION, Principal: '*', ...grant }));
		} catch (err) {
			if (err.name !== 'ResourceConflictException') throw err;
		}
	}
	console.log(`function URL: ${url}`);
	return url;
}

const to = opt('CONTACT_TO');
const secret = opt('TURNSTILE_SECRET');
const account = (await sts.send(new GetCallerIdentityCommand({}))).Account;
console.log(`account ${account}, region ${region}`);
const roleArn = await ensureRole(account, to);
await ensureFunction(roleArn, await bundle(), to, secret);
const endpoint = (await ensureUrl()).replace(/\/$/, '');

// The page reads these at build time; neither is a secret.
const dataFile = join(here, '..', 'src', 'data', 'contact.json');
let previous = {};
try {
	previous = JSON.parse(readFileSync(dataFile, 'utf8'));
} catch {}
const siteKey = opt('TURNSTILE_SITE_KEY') || previous.siteKey || '';
mkdirSync(dirname(dataFile), { recursive: true });
writeFileSync(dataFile, JSON.stringify({ endpoint, siteKey }, null, 2) + '\n');
console.log(`wrote src/data/contact.json${siteKey ? '' : ' (no Turnstile site key yet!)'}`);

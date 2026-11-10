// Deploy (or update) the matheesan.ca/drop backend: private S3 bucket + Lambda function URL.
// Idempotent: re-run after changing lambda/index.mjs to push new code.
//
// Needs AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (see deploy-user-policy.json) and optionally
// AWS_REGION (default ca-central-1). Owner login is Authentik OIDC:
//   DROP_ALLOWED_USERS   required, comma-separated Authentik usernames allowed into the inbox
//   DROP_OIDC_ISSUER     default https://auth.matheesan.ca/application/o/matheesan-drop/
//   DROP_OIDC_CLIENT_ID  default matheesan-drop
// Never prints secrets (the function's environment no longer holds any).
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
	S3Client,
	HeadBucketCommand,
	CreateBucketCommand,
	PutPublicAccessBlockCommand,
	PutBucketLifecycleConfigurationCommand,
	PutBucketCorsCommand,
} from '@aws-sdk/client-s3';
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
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const region = process.env.AWS_REGION || 'ca-central-1';
const FUNCTION = 'matheesan-drop';
const ROLE = 'matheesan-drop-lambda';
const ORIGINS = ['https://matheesan.ca', 'https://www.matheesan.ca', 'http://localhost:4321'];
const RETENTION_DAYS = 30;
const RESERVED_CONCURRENCY = 5;
const OIDC_ISSUER = process.env.DROP_OIDC_ISSUER || 'https://auth.matheesan.ca/application/o/matheesan-drop/';
const OIDC_CLIENT_ID = process.env.DROP_OIDC_CLIENT_ID || 'matheesan-drop';
const ALLOWED_USERS = (process.env.DROP_ALLOWED_USERS ?? '').split(',').map((u) => u.trim()).filter(Boolean).join(',');
const RETIRED_ENV = ['KEY_SALT', 'KEY_HASH']; // the old shared passphrase

const sts = new STSClient({ region });
const s3 = new S3Client({ region });
const iam = new IAMClient({ region });
const lambda = new LambdaClient({ region });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isNotFound = (err) =>
	err.$metadata?.httpStatusCode === 404 ||
	['NotFound', 'NoSuchEntity', 'NoSuchEntityException', 'ResourceNotFoundException', 'NoSuchBucket'].includes(err.name);

async function ensureBucket(bucket) {
	try {
		await s3.send(new HeadBucketCommand({ Bucket: bucket }));
		console.log(`bucket ${bucket}: exists`);
	} catch (err) {
		if (!isNotFound(err)) throw err;
		await s3.send(new CreateBucketCommand({ Bucket: bucket, CreateBucketConfiguration: { LocationConstraint: region } }));
		console.log(`bucket ${bucket}: created`);
	}
	await s3.send(
		new PutPublicAccessBlockCommand({
			Bucket: bucket,
			PublicAccessBlockConfiguration: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true },
		}),
	);
	await s3.send(
		new PutBucketLifecycleConfigurationCommand({
			Bucket: bucket,
			LifecycleConfiguration: {
				Rules: [
					{ ID: 'expire-drops', Status: 'Enabled', Filter: { Prefix: 'drops/' }, Expiration: { Days: RETENTION_DAYS } },
						// Upload links last at most 7 days; their records are cleaned up after 30.
						{ ID: 'expire-links', Status: 'Enabled', Filter: { Prefix: 'links/' }, Expiration: { Days: RETENTION_DAYS } },
					{ ID: 'abort-incomplete', Status: 'Enabled', Filter: { Prefix: '' }, AbortIncompleteMultipartUpload: { DaysAfterInitiation: 1 } },
				],
			},
		}),
	);
	// Browsers upload (POST) and download (GET) straight from S3 with presigned URLs.
	await s3.send(
		new PutBucketCorsCommand({
			Bucket: bucket,
			CORSConfiguration: { CORSRules: [{ AllowedOrigins: ORIGINS, AllowedMethods: ['POST', 'GET'], AllowedHeaders: ['*'], MaxAgeSeconds: 3600 }] },
		}),
	);
	console.log(`bucket ${bucket}: public access blocked, ${RETENTION_DAYS}-day expiry, CORS set`);
}

async function ensureRole(bucket) {
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
	// Only drops/ (files and notes) and links/ (upload-link records, never deleted by the function) of this one bucket.
	const access = {
		Version: '2012-10-17',
		Statement: [
			{ Effect: 'Allow', Action: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'], Resource: `arn:aws:s3:::${bucket}/drops/*` },
			{ Effect: 'Allow', Action: ['s3:PutObject', 's3:GetObject'], Resource: `arn:aws:s3:::${bucket}/links/*` },
			{
				Effect: 'Allow',
				Action: 's3:ListBucket',
				Resource: `arn:aws:s3:::${bucket}`,
				Condition: { StringLike: { 's3:prefix': ['drops/*', 'links/*'] } },
			},
		],
	};
	await iam.send(new PutRolePolicyCommand({ RoleName: ROLE, PolicyName: 'drops-bucket', PolicyDocument: JSON.stringify(access) }));
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
		// Some SDK dependencies still call require() for Node built-ins.
		banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
	});
	const zip = new AdmZip();
	zip.addFile('index.mjs', Buffer.from(out.outputFiles[0].contents));
	return zip.toBuffer();
}

// Checks the Authentik provider exists before pointing the function at it, and returns the endpoints the page needs.
async function discoverOidc() {
	if (!ALLOWED_USERS) throw new Error('DROP_ALLOWED_USERS is required (Authentik usernames allowed into the inbox)');
	if (!OIDC_ISSUER.endsWith('/')) throw new Error('DROP_OIDC_ISSUER must end with /');
	const res = await fetch(`${OIDC_ISSUER}.well-known/openid-configuration`, { signal: AbortSignal.timeout(10000) });
	if (!res.ok) throw new Error(`OIDC discovery for ${OIDC_ISSUER} returned ${res.status}`);
	const conf = await res.json();
	if (conf.issuer !== OIDC_ISSUER) throw new Error(`OIDC issuer mismatch: ${conf.issuer}`);
	console.log(`oidc ${OIDC_ISSUER}: ok, client ${OIDC_CLIENT_ID}, ${ALLOWED_USERS.split(',').length} allowed user(s)`);
	return {
		issuer: OIDC_ISSUER,
		clientId: OIDC_CLIENT_ID,
		authorize: conf.authorization_endpoint,
		token: conf.token_endpoint,
		endSession: conf.end_session_endpoint ?? null,
	};
}

async function ensureFunction(roleArn, bucket, code) {
	const authEnv = { OIDC_ISSUER, OIDC_CLIENT_ID, ALLOWED_USERS };
	let existing;
	try {
		existing = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION }));
	} catch (err) {
		if (!isNotFound(err)) throw err;
	}

	if (!existing) {
		const params = {
			FunctionName: FUNCTION,
			Runtime: 'nodejs22.x',
			Architectures: ['arm64'],
			Handler: 'index.handler',
			Role: roleArn,
			Code: { ZipFile: code },
			MemorySize: 256,
			Timeout: 15,
			Environment: { Variables: { BUCKET: bucket, ...authEnv } },
		};
		// A brand-new IAM role takes a few seconds before Lambda can assume it.
		for (let attempt = 1; ; attempt++) {
			try {
				await lambda.send(new CreateFunctionCommand(params));
				break;
			} catch (err) {
				if (err.name !== 'InvalidParameterValueException' || attempt >= 10) throw err;
				await sleep(3000);
			}
		}
		await waitUntilFunctionActiveV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		console.log(`function ${FUNCTION}: created`);
	} else {
		await lambda.send(new UpdateFunctionCodeCommand({ FunctionName: FUNCTION, ZipFile: code }));
		await waitUntilFunctionUpdatedV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		const vars = { ...existing.Configuration.Environment?.Variables, BUCKET: bucket, ...authEnv };
		const retired = RETIRED_ENV.filter((k) => k in vars);
		for (const k of retired) delete vars[k];
		await lambda.send(new UpdateFunctionConfigurationCommand({ FunctionName: FUNCTION, Environment: { Variables: vars } }));
		await waitUntilFunctionUpdatedV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		console.log(`function ${FUNCTION}: code updated${retired.length ? ', old passphrase removed' : ''}`);
	}

	// Caps cost and how many token / link guesses can run at once.
	try {
		await lambda.send(new PutFunctionConcurrencyCommand({ FunctionName: FUNCTION, ReservedConcurrentExecutions: RESERVED_CONCURRENCY }));
		console.log(`function ${FUNCTION}: reserved concurrency ${RESERVED_CONCURRENCY}`);
	} catch (err) {
		console.warn(`function ${FUNCTION}: could not set reserved concurrency (${err.name}); new accounts often have a limit of 10`);
	}
}

async function ensureUrl() {
	const cors = { AllowOrigins: ORIGINS, AllowMethods: ['POST'], AllowHeaders: ['content-type', 'authorization', 'x-drop-link'], MaxAge: 3600 };
	let url;
	try {
		await lambda.send(new GetFunctionUrlConfigCommand({ FunctionName: FUNCTION }));
		url = (await lambda.send(new UpdateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	} catch (err) {
		if (!isNotFound(err)) throw err;
		url = (await lambda.send(new CreateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	}
	// Public function URLs need both permissions; the login / upload-link check happens inside the handler.
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

const account = (await sts.send(new GetCallerIdentityCommand({}))).Account;
const bucket = `matheesan-drop-${account}`;
console.log(`account ${account}, region ${region}`);
const oidc = await discoverOidc();
await ensureBucket(bucket);
const roleArn = await ensureRole(bucket);
await ensureFunction(roleArn, bucket, await bundle());
const endpoint = (await ensureUrl()).replace(/\/$/, '');

// The page reads these at build time; none is a secret (the OIDC client is public and uses PKCE).
const dataDir = join(here, '..', 'src', 'data');
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, 'drop.json'), JSON.stringify({ endpoint, oidc }, null, 2) + '\n');
console.log('wrote src/data/drop.json');

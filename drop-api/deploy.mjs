// Deploy (or update) the matheesan.ca/drop backend: private S3 bucket + Lambda function URL.
// Idempotent: re-run after changing lambda/index.mjs to push new code.
//
// Needs AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (see deploy-user-policy.json) and optionally
// AWS_REGION (default ca-central-1). DROP_PASSPHRASE sets or rotates the passphrase; leave it unset
// on later deploys to keep the current one. Never prints secrets.
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
import { randomBytes, scryptSync } from 'node:crypto';
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
	// Only the drops/ prefix of this one bucket.
	const access = {
		Version: '2012-10-17',
		Statement: [
			{ Effect: 'Allow', Action: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'], Resource: `arn:aws:s3:::${bucket}/drops/*` },
			{ Effect: 'Allow', Action: 's3:ListBucket', Resource: `arn:aws:s3:::${bucket}`, Condition: { StringLike: { 's3:prefix': 'drops/*' } } },
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

function passphraseEnv() {
	const passphrase = process.env.DROP_PASSPHRASE?.trim();
	if (!passphrase) return null;
	if (passphrase.length < 16) throw new Error('DROP_PASSPHRASE must be at least 16 characters');
	const salt = randomBytes(16);
	return { KEY_SALT: salt.toString('hex'), KEY_HASH: scryptSync(passphrase, salt, 32).toString('hex') };
}

async function ensureFunction(roleArn, bucket, code) {
	const keyEnv = passphraseEnv();
	let existing;
	try {
		existing = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION }));
	} catch (err) {
		if (!isNotFound(err)) throw err;
	}

	if (!existing) {
		if (!keyEnv) throw new Error('First deploy needs DROP_PASSPHRASE');
		const params = {
			FunctionName: FUNCTION,
			Runtime: 'nodejs22.x',
			Architectures: ['arm64'],
			Handler: 'index.handler',
			Role: roleArn,
			Code: { ZipFile: code },
			MemorySize: 256,
			Timeout: 15,
			Environment: { Variables: { BUCKET: bucket, ...keyEnv } },
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
		const vars = { ...existing.Configuration.Environment?.Variables, BUCKET: bucket, ...(keyEnv ?? {}) };
		await lambda.send(new UpdateFunctionConfigurationCommand({ FunctionName: FUNCTION, Environment: { Variables: vars } }));
		await waitUntilFunctionUpdatedV2({ client: lambda, maxWaitTime: 120 }, { FunctionName: FUNCTION });
		console.log(`function ${FUNCTION}: code updated${keyEnv ? ', passphrase rotated' : ''}`);
	}

	// Caps cost and how many passphrase guesses can run at once.
	try {
		await lambda.send(new PutFunctionConcurrencyCommand({ FunctionName: FUNCTION, ReservedConcurrentExecutions: RESERVED_CONCURRENCY }));
		console.log(`function ${FUNCTION}: reserved concurrency ${RESERVED_CONCURRENCY}`);
	} catch (err) {
		console.warn(`function ${FUNCTION}: could not set reserved concurrency (${err.name}); new accounts often have a limit of 10`);
	}
}

async function ensureUrl() {
	const cors = { AllowOrigins: ORIGINS, AllowMethods: ['POST'], AllowHeaders: ['content-type', 'x-drop-key'], MaxAge: 3600 };
	let url;
	try {
		await lambda.send(new GetFunctionUrlConfigCommand({ FunctionName: FUNCTION }));
		url = (await lambda.send(new UpdateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	} catch (err) {
		if (!isNotFound(err)) throw err;
		url = (await lambda.send(new CreateFunctionUrlConfigCommand({ FunctionName: FUNCTION, AuthType: 'NONE', Cors: cors }))).FunctionUrl;
	}
	// Public function URLs need both permissions; the passphrase check happens inside the handler.
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
await ensureBucket(bucket);
const roleArn = await ensureRole(bucket);
await ensureFunction(roleArn, bucket, await bundle());
const endpoint = (await ensureUrl()).replace(/\/$/, '');

// The page reads the endpoint at build time; it is not a secret.
const dataDir = join(here, '..', 'src', 'data');
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, 'drop.json'), JSON.stringify({ endpoint }, null, 2) + '\n');
console.log('wrote src/data/drop.json');

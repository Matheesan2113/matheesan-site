# drop-api

Backend for [matheesan.ca/drop](https://matheesan.ca/drop/): a private drop box for sending files and notes to myself,
plus time-limited upload links so other people can send me files.

```
owner browser ──Authentik login (OIDC + PKCE)──▶ auth.matheesan.ca ──access token──▶ browser
owner browser ──POST + Authorization: Bearer──▶ Lambda function URL ──▶ presigned S3 URLs
guest browser ──POST + x-drop-link (from /drop/send/#token)──▶ Lambda ──▶ presigned upload URL only
browsers ───────── file bytes ─────────────────────────────────────▶ private S3 bucket (30-day expiry)
```

- **`lambda/index.mjs`** is the handler.
  - The owner routes are `/upload`, `/note`, `/list`, `/read`, `/delete`, `/links`, `/links/create` and `/links/revoke`.
    They need an Authentik access token, which is checked against the provider's JWKS, issuer, audience, expiry and
    `ALLOWED_USERS`.
  - The guest routes `/guest/info` and `/guest/upload` need an upload-link token. Only its SHA-256 is stored, under
    `links/`.
  - Files never pass through the Lambda. It returns a presigned POST, limited to 250 MB, that is valid for 15 minutes.
- **`deploy.mjs`** creates or updates everything, and is safe to re-run.
  - It sets up the bucket (public access blocked, CORS, lifecycle) and an IAM role scoped to `drops/*` and `links/*`.
  - It deploys the Lambda (nodejs22.x, arm64, reserved concurrency 5) and its function URL.
  - It checks the Authentik provider through OIDC discovery, then writes the endpoint and the OIDC settings to
    `../src/data/drop.json`, which the pages read at build time. None of these values is a secret.
- **`deploy-user-policy.json`** lists the only permissions the deploy key needs.
- **`test/smoke.mjs`** (`npm test`) is an offline test. It covers token checks (bad signature, `alg: none`, wrong
  issuer or audience, expired, not allowed), guest links (limits, revoke, expiry, parallel uploads) and validation.
  It uses a throwaway signing key and an in-memory fake S3.

## Deploying

The allowed users and the AWS deploy key live in the private homelab repo, so deploy from there:

```bash
../homelab/scripts/deploy-drop.sh
```

Then commit and push this repo so GitHub Pages rebuilds `/drop`.

The Authentik provider and app (`matheesan-drop`) are created by `../homelab/scripts/setup-drop-authentik.py`. The
homelab copies new drops into Nextcloud with `../homelab/scripts/drop-pull/`.

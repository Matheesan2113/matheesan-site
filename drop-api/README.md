# drop-api

Backend for [matheesan.ca/drop](https://matheesan.ca/drop), a private drop box for sending files and notes to myself.

```
browser (/drop page) ──POST + x-drop-key──▶ Lambda function URL ──▶ presigned S3 URL
browser ──────────── file bytes ──────────────────────────────────▶ private S3 bucket (drops/, 30-day expiry)
```

- **`lambda/index.mjs`**: the handler. `/upload`, `/note`, `/list`, `/read` and `/delete` all need the passphrase
  (checked against a scrypt hash). Files never pass through the Lambda: it returns a presigned POST, limited to
  250 MB, that is valid for 15 minutes.
- **`deploy.mjs`**: creates or updates everything, and is safe to re-run. It sets up the bucket (public access
  blocked, CORS, lifecycle), an IAM role scoped to `drops/*`, the Lambda (nodejs22.x, arm64, reserved concurrency 5)
  and its function URL. It then writes the URL to `../src/data/drop.json`, which the page reads at build time.
- **`deploy-user-policy.json`**: the only permissions the deploy key needs.
- **`test/smoke.mjs`** (`npm test`): an offline check of auth, routing and validation.

## Deploying

The secrets live in the homelab repo, so deploy from there:

```bash
../homelab/scripts/deploy-drop.sh
```

Then commit and push this repo so GitHub Pages rebuilds `/drop` with the endpoint.

To rotate the passphrase, change `DROP_PASSPHRASE` in homelab `credentials.env` (and in Vaultwarden), then re-run the
script.

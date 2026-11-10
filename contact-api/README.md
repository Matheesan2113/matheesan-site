# contact-api

Backend for [matheesan.ca/contact](https://matheesan.ca/contact), the site's contact form.

```
browser (/contact + Cloudflare Turnstile) ──POST JSON──▶ Lambda function URL ──▶ Turnstile siteverify
                                                                             └──▶ Amazon SES ──▶ owner's inbox
```

- **`lambda/index.mjs`**: validates the form (name, email, 10–5000 character message), drops honeypot hits with a
  fake success, verifies the Turnstile token (action `contact`, hostname must be matheesan.ca), then sends **one**
  email to the fixed owner address with the visitor in `Reply-To`. It never emails the visitor.
- **`deploy.mjs`**: creates or updates the IAM role (SES send only from `contact@matheesan.ca`, only to the owner),
  the Lambda (nodejs22.x, arm64, reserved concurrency 2) and its function URL (CORS: matheesan.ca, www, localhost:4321).
  Writes `../src/data/contact.json` (endpoint + Turnstile site key, both public).
- **`deploy-user-policy.json`**: permissions the deploy key needs. Attached as a second inline policy on the
  `matheesan-drop-deployer` IAM user, so one key deploys both backends.
- **`test/smoke.mjs`** (`npm test`): offline checks with a fake Turnstile and a fake mail sender.

The recipient address and the Turnstile secret are only in the Lambda's environment, never in this (public) repo.

## Deploying

Secrets live in the homelab repo, so deploy from there:

```bash
../homelab/scripts/deploy-contact.sh
```

Then commit and push this repo so GitHub Pages rebuilds `/contact`.

For local development (`npm run dev`), Turnstile's [test site key](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
`1x00000000000000000000AA` always passes in the browser, but the deployed Lambda still checks real tokens.

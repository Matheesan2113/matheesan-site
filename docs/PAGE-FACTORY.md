# Page factory: generated subdomains

A small system for publishing a one-off page at `https://<slug>.pages.matheesan.ca/` in seconds.
It is a wildcard edge plus a spec renderer, not a second website builder: pages are static, no-JS and
owner-created.

This is the public-safe contract. The operator runbook (AWS IDs, host addresses, keys and the live
incident log) lives in the private homelab repo, `docs/services/PAGE-FACTORY.md`.

**Status:** edge live; the first real publish failed on an AWS CLI timeout and the operator service is
being restarted. See [Current status](#current-status).

## What a generated page is

A page is a small spec rendered to standalone HTML:

```json
{
  "title": "Poker night",
  "theme": "games",
  "recipe": "event",
  "visibility": "unlisted",
  "ttl": "7d",
  "brief": "Saturday 8pm, my place, bring snacks"
}
```

- **Themes:** `neutral`, `music`, `games`, `lab`, `notes`, `about`, `career`, plus the factory-only
  `event` and `minimal`. The tokens are extracted from `src/styles/global.css`, so a generated page
  follows the site's design system instead of carrying a second copy of it.
- **Recipes:** `microsite`, `event`, `note`, `link`, `gallery`.
- **Visibility:** `public` (indexable), `unlisted` (noindex, no canonical, no sitemap) and `private`
  (accepted by the validator; the static edge cannot enforce auth, so it is noindex like `unlisted`
  until a gate exists — see gaps).
- **TTL:** from one minute to 30 days. The page is routed by a CloudFront KeyValueStore key; expiry
  removes the key and the release.
- **Live example:** <https://poker-night.pages.matheesan.ca/> (games theme, unlisted, expiring).

## How it works

```
owner / ZeroClaw / Discord
        │  POST a spec (bearer token)
        ▼
launchpad control plane (private network)
        │  validate → render → upload release → put manifest
        ▼
private S3 bucket ──OAC──▶ CloudFront ──viewer-request function──▶ KVS route
                                      │
                                      └─ <slug>.pages.matheesan.ca → /releases/<slug>/<release>/
```

1. **One wildcard, one distribution.** `*.pages.matheesan.ca` is a single Route 53 record and a single
   ACM certificate on one CloudFront distribution. A new page is a new key in the KeyValueStore, not a
   new DNS record, certificate or Nginx vhost.
2. **The host is the slug.** A CloudFront Function reads the `Host` header, validates the slug, looks up
   the release prefix in the KVS and rewrites the request URI to that release. A missing key fails
   closed with a 404.
3. **Versioned releases.** Every publish writes an immutable `/releases/<slug>/<release>/` prefix and a
   manifest. Rolling back is putting the previous prefix back in the KVS.
4. **Short cache.** The distribution caches for five minutes by default (one hour maximum), so a
   takedown or a rollback is visible quickly without invalidating per page.
5. **Owner-only.** The API is LAN/tailnet only, behind a bearer token. It is not exposed to the
   internet.

## Guarantees

A generated page:

- ships **no JavaScript** (`script-src 'none'`), no forms and no `connect-src`;
- is rendered from escaped Markdown — no raw HTML, `http(s)`/`mailto` links only;
- is `noindex, nofollow` when unlisted, with no canonical and no sitemap entry;
- cannot shadow a real service: `www`, `mail`, `vault`, `auth`, `drop`, `contact`, `grafana`,
  `portainer`, `prometheus`, `alertmanager` and the rest of the reserved list are rejected by the spec
  validator;
- is single-label only. `poker.matheesan.ca` works with the wildcard; `a.b.matheesan.ca` needs its own
  certificate and is deliberately out of scope;
- is capped in size, TTL and link scheme before it reaches the renderer.

The edge adds a strict CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy:
no-referrer`, HSTS without `includeSubDomains`, and a `Permissions-Policy` that disables geolocation,
microphone and camera. There is no WAF in front of it.

## Content model

The factory renders a spec. It does not own the site's content. Personal details, bios, career facts
and page copy live in [`content/SITE-CONTENT.md`](../content/SITE-CONTENT.md), which is deliberately
theme-independent; see [`docs/CONTENT-MODEL.md`](./CONTENT-MODEL.md).

When a generated page needs personal copy, take it from the brief. Do not invent a second version of
the bio in a spec.

## Operating it

The operator path is intentionally outside this public repo:

- **Create:** a bearer-token API on the private network (`POST /v1/pages`), or the `pages.sh` client
  installed on the assistant host.
- **List / extend / delete:** `GET /v1/pages`, `POST /v1/pages/<slug>/extend`, `DELETE
  /v1/pages/<slug>`. Delete requires an explicit `--yes` (or an approval card in Discord).
- **Reap:** the service reaps expired pages hourly, and `POST /v1/reap` runs it on demand.
- **Health:** `GET /health` reports the live page count and whether publishing is in dry-run mode.

The private homelab doc is the source for the host, service unit, keys and the current incident.

## What must not go in this repo

This is a public repository. Keep out of it:

- AWS account IDs, bucket names, KVS ARNs, distribution IDs;
- LAN IPs, VLAN IDs, internal hostnames, Tailscale names;
- API tokens, deployer keys, `.secrets/` contents;
- the Terraform state and the operator's audit log.

The factory extracts the site theme from `global.css` so the public repo still owns the look. The edge,
the control plane and the bot are operator tooling.

## Current status

| Piece | State (2026-11-26) |
|---|---|
| Wildcard edge, certificate, distribution, KVS | live |
| `poker-night` page | live, 200 |
| Control plane | down; last start was 2026-11-25, no service unit installed yet |
| First real publish (`live-smoke`) | failed on an AWS CLI timeout; page is 404 and marked `failed` |
| Discord bridge | built, not currently running |
| ZeroClaw client | packaged; host install/allowlist still pending |

**Known gaps:**

- `private` visibility is a label, not an access control: the static edge has no auth and the API
  publishes the release like any other. Use `unlisted` for share-by-link until a gate exists;
- the TTL reaper only expires pages in the `live` state, so a rendered-but-never-published page is not
  cleaned up;
- there is no systemd unit for the API or the bot, so both die with the terminal that started them;
- the first live publish needs a retry now that credentials and network have been verified;
- `DOCS` status: the private runbook is authoritative; this page is the contract.

## Related

- [`docs/CONTENT-MODEL.md`](./CONTENT-MODEL.md) — how content is separated from the theme.
- [`content/SITE-CONTENT.md`](../content/SITE-CONTENT.md) — the theme-independent content brief.
- `docs/LINEAR-SYNC.md` — issue tracking for the site.
- Private homelab repo, `docs/services/PAGE-FACTORY.md` — operator runbook and incident log.

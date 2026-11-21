# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately:

- **GitHub private vulnerability reporting:** <https://github.com/Matheesan2113/matheesan-site/security/advisories/new>
- **Contact form:** <https://matheesan.ca/contact/>

Do not open a public issue for a security report. Do not test against third-party services, the
private drop box, or accounts and data you do not own. If you are unsure whether something is in
scope, ask first through the contact form.

This is a personal site maintained by one person. Reports are handled on a best-effort basis,
usually within five business days. There is no bug bounty.

## Scope

- The static site at `matheesan.ca` and its client-side code.
- The public contact and drop Lambda source in this repository. Only test systems you are authorised
  to use; the private drop box requires an account and explicit permission.

Out of scope: denial-of-service testing, social engineering, physical testing, spam through the
contact form, and testing against Google Fonts, Cloudflare Turnstile, AWS or any other third party.

## Current controls

- **CSP and Referrer-Policy in `<meta>`.** The CSP restricts scripts, styles, fonts, images, frames
  and network connections to the origins the site actually uses. `'unsafe-inline'` remains for
  Astro's inline component scripts and the site's CSS custom-property style attributes; moving those
  out of inline markup is a prerequisite for a hash/nonce-based CSP.
- **Private routes are not indexed.** `/drop/` and `/drop/send/` are `noindex` and disallowed in
  `robots.txt`.
- **No public signup.** Lab and drop accounts are created personally.
- **Lab page is capability-only.** It deliberately omits hosts, addresses, ports, software versions,
  hardware, storage sizes and the service map.
- **No secrets in the static build.** Runtime configuration contains only public OIDC client IDs,
  Turnstile site keys and function URLs.
- **Security contact published** at `/.well-known/security.txt`.
- **Repository controls:** GitHub private vulnerability reporting is enabled, along with Dependabot
  alerts, automated security updates, secret scanning and push protection.

## GitHub Pages limitation

GitHub Pages serves static files and does not support custom response headers. The site therefore
uses `<meta>` CSP and Referrer-Policy, which are the only effective in-page controls available. The
following headers cannot be set from this repository and are currently absent from production:

- `Strict-Transport-Security`
- `X-Frame-Options` / CSP `frame-ancestors`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `X-Content-Type-Options`

If the site is put behind Cloudflare, Netlify or another edge proxy, add:

```http
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Content-Security-Policy: default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.lambda-url.ca-central-1.on.aws https://auth.matheesan.ca https://s3.ca-central-1.amazonaws.com https://*.s3.ca-central-1.amazonaws.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; form-action 'self'; upgrade-insecure-requests
```

Add `includeSubDomains; preload` to HSTS only after every subdomain is HTTPS-only and you have
verified the preload requirements. The edge CSP above is the union of all routes; if the edge proxy
supports path rules, scope the contact Lambda/Turnstile origins to `/contact/` and the drop Lambda,
identity-provider and S3 origins to `/drop/*`. The edge CSP should be kept in sync with the
per-route `<meta>` CSP built from `src/layouts/layout.astro`; the header additionally supports
`frame-ancestors`.

## A note on history

Removing lab details from the current page does not remove them from older commits, cached copies or
web archives. If those details are sensitive rather than merely private, rotate any affected
identifiers and consider a coordinated history rewrite before treating them as withdrawn.

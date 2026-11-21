# matheesan.ca

Personal site for Matheesan Manokaran — senior software engineer at WayTrade, DJ, gamer, and the
homelab where the models meet the metal. A neutral cyberpunk channel hub leads to six separately
themed pages; career is one of them, not the frame around everything.

**Live:** [https://matheesan.ca](https://matheesan.ca)

## What's here

| Route | Purpose |
|---|---|
| `/` | Neutral channel hub: hero, now strip and the orbital channel selector |
| `/music/` | Magenta club theme: DJ identity, crate, booth notes, deck visual and the real public Spotify library |
| `/games/` | Acid-green HUD theme: the game rotation — Elden Ring, Wukong, Mario Kart, Valorant, Overwatch |
| `/career/` | Long-form career portfolio: timeline, tech evolution and case study index |
| `/career/<slug>/` | Individual case study (agentic-workbench, voice-agent, migration, silent-green, cloud-run) |
| `/tooling/` | Full 2021–2026 tooling timeline and workflow principles |
| `/lab/` | Emerging tech / ML lab, homelab and invite-only access |
| `/about/` | The longer version: bio, principles, terminal, music, games and life |
| `/notes/` | Field notes index |
| `/notes/<slug>/` | Long-form notes (markdown content collection) |
| `/resume/` | Print-friendly / ATS-oriented résumé, cross-linked with the career portfolio |
| `/contact/` | Turnstile-protected contact form (Lambda + SES) |
| `/drop/` | Private OIDC-authenticated drop box with presigned uploads |
| `/rss.xml` | Notes feed |
| `/sitemap.xml`, `/robots.txt` | Crawler basics |

## Stack

- **Astro 6**, static output, no UI framework.
- **Vanilla TypeScript** for interactions: command palette, terminal, eval console, canvas waves.
- **CSS custom properties** with component-scoped styles.
- **Content collections** for notes.
- **GitHub Pages** deployment via `.github/workflows/deploy.yml`.

No client-side framework, no analytics script, no cookie banner. Fonts and the contact page’s
Cloudflare Turnstile check are the only third-party requests.

## Commands

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # static build to dist/
npm run preview   # preview the build
```

## Editing content

- **Profile, now, channels, music, games, jobs, case files, tooling timeline** — `src/data/profile.ts`.
  This is the single source of truth for the channel hub, `/music/`, `/games/`, `/career/` and `/tooling/`.
- **Notes** — add a markdown file to `src/content/notes/` with `title`, `description`, `date`,
  `tags`, and `reading` frontmatter. The index, RSS feed and sitemap pick it up automatically.
- **Site chrome / SEO defaults** — `src/layouts/layout.astro`.
- **Palette commands** — `src/components/CommandPalette.astro`.
- **Art / diagrams** — `scripts/make-art.mjs` generates the SVGs in `public/art/` (workbench and homelab diagrams, playlist covers, game key art and the moon/dragon/wave studies). Run it with `node scripts/make-art.mjs` after editing.
- **OG image** — `public/og.png` (1200×630). Editable sources: `scripts/og.html` (open in a browser
  and screenshot at 1200×630) and `scripts/make-og.mjs` (sharp render; expects a fontconfig pointing
  at Cormorant Garamond, Space Mono and DM Sans, e.g.
  `FONTCONFIG_FILE=/path/to/fonts.conf node scripts/make-og.mjs`).

## Content policy

The experience copy is a **public-safe** version of a private career pack. Customer names, internal
service names, ticket IDs and unverified claims are deliberately omitted; numbers are kept where
they were cleared for public use. If you add a claim, add the source or don't add the claim.

## Design notes

- The moon / dragon / wave theme comes from the name (Matheesan = moon), the year of the dragon, and
  Varuna (storms and waves). The symbols are rendered with a CJK serif fallback and the Tamil text
  with Noto Sans Tamil.
- The site is deliberately grouped: music, games, lab, notes and about are the primary pages;
  career, tooling and résumé sit one level away; the home page is a scannable index, not the
  whole resume.
- Music is part of the visual system: an animated nav equalizer, the deck visual, the crate and
  booth notes. The crate is **basshall / dancehall, South Indian and R&B**, plus gaming OSTs,
  after-hours and a wildcard lane. Nothing autoplays. The real public profile is `music.spotify.url`;
  the four linked playlists are `Lock In 2025`, `Games`, `Mixxx` and `LumiereNew1`.
- The home page has an image-led `Worlds` section: a turntable/DJ photo with a spinning record for
  music, and a public-domain 19th-century Sun Wukong illustration with embers for games. The games
  page uses the same art in a larger spotlight. Image sources and licences are in
  [`CREDITS.md`](CREDITS.md).
- The games section is a rotation, not a ranking: Elden Ring, Black Myth: Wukong, Mario Kart,
  Valorant and Overwatch. The Wukong art is public-domain *Journey to the West* illustration, not
  publisher key art.
- The landing chrome stays neutral; the image-led `Worlds` section carries the first colour before
  the orbital channel selector. Each destination carries its own accent: music magenta, games acid
  green, lab teal, notes amber, about indigo/gold, career steel blue. Themes are set with `theme=`
  on `SiteLayout`.
- `/career/` and `/resume/` are deliberately separate. Career is the long-form portfolio — job
  phases, the 2021–2026 tooling evolution, case files and selected work. Résumé is the
  print-friendly/ATS-oriented CV. They cross-link, both link to LinkedIn, and their experience
  narrative is kept aligned; merging them would bury the CV in a long portfolio page.
- The hero has one deliberate professional path: **view résumé** links to `/resume/`; the channel
  selector remains the exploration path.
- Page headers carry a channel chip (for example `ch.01 / sound`) and a large translucent Japanese
  glyph. The hero also carries a vertical Tamil/Japanese glyph rail.
- WayTrade is the current role: a small team building an AI-powered marketplace for biofuels,
  feedstocks and critical materials. The featured project is the Replicant agentic workbench — one
  engine for data silos, plugins, MCPs, DeepSeek/Claude overnight loops and gated JIRA work.
- The tooling timeline is a curated narrative, not a market ranking: three tools per year, chosen
  because each one changed a different part of the loop.
- The command palette opens with **Ctrl/Cmd+K** or `/`.
- First visit per session gets a short signal/boot sequence. `?boot=0` skips it, `?boot=1` forces it.
- The hero constellation reacts to the pointer; the moon, panel and dragon parallax subtly.
- Dragon mode: type `dragon` in the About terminal or enter the Konami code (↑↑↓↓←→←→BA).
- `/tooling/` has a clickable workflow-stage filter; click a stage again to clear it.
- Cross-document view transitions are enabled where supported, with a no-motion fallback.
- The terminal in About is intentionally read-only theatre; it never touches a real shell.
- Reduced-motion users get static waves, no cursor follower, and no scroll animation.
- The résumé page prints cleanly: `print / save PDF` in the toolbar, or open `/resume/?print=1`.

## Security

- **The lab page publishes capabilities, not coordinates.** Hosts, addresses, ports, software
  versions, hardware, storage sizes and the service map are deliberately omitted. The public diagram
  is an abstract capability summary, not a network map.
- **CSP and Referrer-Policy are delivered via `<meta>`** because GitHub Pages cannot set response
  headers. The base CSP is self plus fonts; the contact and drop routes add only their own exact
  function, identity, Turnstile and S3 origins, so backend URLs are not broadcast on every page.
- **GitHub Pages cannot send HSTS, `X-Frame-Options`/`frame-ancestors`, Permissions-Policy,
  COOP/CORP or `X-Content-Type-Options`.** Those require an edge proxy. See [`SECURITY.md`](SECURITY.md)
  for the recommended edge header set.
- **Reporting:** `/.well-known/security.txt` and [`SECURITY.md`](SECURITY.md) define the private
  reporting path. Drop routes are `noindex` and disallowed in `robots.txt`.
- Lab and drop routes do not advertise themselves as targets; the private backend code is documented
  separately and does not ship in the static build.

## Motion

- Ambient loops are slow, low-contrast and reserved for large visuals: the hero canvas, the channel
  orbit, the turntable and the Wukong scene. Hover motion is a small zoom or lift, not a bounce.
- Each animated scene is marked `data-motion-scene`. An `IntersectionObserver` adds
  `.motion-paused` when the scene is offscreen, so loops do not keep painting or burning battery.
- `prefers-reduced-motion: reduce` removes floats, embers, spins, EQ, parallax and the boot
  sequence. No content depends on motion, and nothing autoplays audio.

## Deployment

Pushing to `main` triggers the GitHub Pages workflow. The `drop-api/` and `contact-api/` directories
are separate Lambda backends; see their READMEs and the private homelab repo for deployment keys and
allowed-user configuration.

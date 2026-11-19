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
| `/career/` | Experience timeline and case study index (linked, not primary) |
| `/career/<slug>/` | Individual case study (agentic-workbench, voice-agent, migration, silent-green, cloud-run) |
| `/tooling/` | Full 2021–2026 tooling timeline and workflow principles |
| `/lab/` | Emerging tech / ML lab, homelab and invite-only access |
| `/about/` | The longer version: bio, principles, terminal, music, games and life |
| `/notes/` | Field notes index |
| `/notes/<slug>/` | Long-form notes (markdown content collection) |
| `/resume/` | Public-safe résumé with print / save-as-PDF styling |
| `/contact/` | Turnstile-protected contact form (Lambda + SES) |
| `/drop/` | Private drop box (Authentik OIDC + S3 presigned uploads) |
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
  booth notes. Nothing autoplays. The real public profile is `music.spotify.url`; the four linked
  playlists are `Lock In 2025`, `Games`, `Mixxx` and `LumiereNew1`.
- The games section is a rotation, not a ranking: Elden Ring, Black Myth: Wukong, Mario Kart,
  Valorant and Overwatch.
- The landing is deliberately neutral: a monochrome chrome hub with an orbital channel selector.
  Each destination carries its own accent: music magenta, games acid green, lab teal, notes amber,
  about indigo/gold, career steel blue. Themes are set with `theme=` on `SiteLayout`.
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

## Deployment

Pushing to `main` triggers the GitHub Pages workflow. The `drop-api/` and `contact-api/` directories
are separate Lambda backends; see their READMEs and the private homelab repo for deployment keys and
allowed-user configuration.

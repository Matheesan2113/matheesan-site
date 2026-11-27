# Content model

How the words on matheesan.ca are organised, so a change to the person or the story does not
require a change to the theme.

## The short version

| Layer | Where it lives | Owns |
|---|---|---|
| **Decisions / source brief** | [`content/SITE-CONTENT.md`](../content/SITE-CONTENT.md) | What is true, what is public, what is missing. No CSS, no components. |
| **Runtime copy** | `src/data/profile.ts`, `src/data/story.ts`, `src/content/notes/` | The exact strings the current theme renders. |
| **Presentation** | `src/pages/`, `src/components/`, `src/styles/global.css` | Layout, colour, motion, per-page themes. |
| **Generated pages** | The page factory (private operator tooling) | A standalone page from a spec; themes are extracted from `global.css`. |

The rule is one-way: **content decides, the theme renders**. A theme change must not require a copy
change, and a copy change must not require a theme change.

## Why the brief exists

The site has seven visual themes (`neutral`, `music`, `games`, `lab`, `notes`, `about`, `career`) and
a page factory that renders standalone pages in those same themes. The same bio, tagline or career
fact is used by the home page, the About page, the résumé, page metadata and generated pages. If
those strings only exist inside a page component, every new theme becomes a copy-editing project.

`content/SITE-CONTENT.md` is the theme-independent answer sheet:

- identity, pronunciation, links and contact preference;
- short bios at 25 / 50 / 100 words, plus the longer story;
- work history and the public-safe rules for it;
- music, games, homelab and life-outside-the-screen prompts;
- the tone, the page purposes and the "never publish" list;
- a backlog and an answer checklist.

It is deliberately **not** wired into the Astro build yet. Wiring it is a separate change: it needs a
loader, a schema and a migration of `profile.ts` / `story.ts`. Until then it is the review file that
the runtime copy is edited from.

## Runtime mapping

Use this table when a brief answer changes and the site needs to reflect it.

| Brief section | Runtime file | Consumers |
|---|---|---|
| Identity, links, status line | `src/data/profile.ts` (`site`, `now`) | `layout.astro`, home, contact, footer |
| Short descriptions, tagline | `src/data/story.ts` (`intro`) and `profile.ts` (`site`) | home hero, metadata, OG |
| Name and roots | `src/data/story.ts` (`chapters`, `thinking`) | home chapter 1, `/about/#roots` |
| Work history | `src/data/profile.ts` (`jobs`, `careerStats`, `earlyProjects`, `caseFiles`) | `/career/`, `/resume/`, home |
| Craft and beliefs | `src/data/story.ts` (`beliefs`, `thinking`, `quotes`) | `/about/#thinking`, home |
| Music | `src/data/profile.ts` (`music`, `channels`) | `/music/`, nav, home |
| Games | `src/data/profile.ts` (`games`, `channels`) | `/games/`, home |
| Homelab and AI lab | `src/data/profile.ts` (`platformLayers`, `toolingYears`, `alsoBuilt`, `toolbox`) and `/lab/` copy | `/lab/`, `/tooling/`, `/career/` |
| Life outside the screen | `src/data/story.ts` (`chapters`, `influences`, `quotes`) | `/about/` |
| Page purposes and SEO | `src/pages/*` frontmatter, `src/layouts/layout.astro` | every page |
| Notes | `src/content/notes/*.md` | `/notes/`, RSS, sitemap |

If an answer does not fit any row, stop and decide where it belongs before editing a page. Adding a
one-off paragraph to a component is how the copy drifts.

## Applying a content change

1. Edit the answer in `content/SITE-CONTENT.md` first. Mark it `TODO` until it is cleared.
2. Update the runtime file from the mapping table. Keep the public-safe rules: no customer names,
   internal service names, ticket IDs, unverified numbers or anything under NDA.
3. Run `npm run build` and check the affected pages.
4. If the change is a generated-page preset, update the spec in the page factory, not the theme.
5. Commit the brief and the runtime change together, so the decision and the copy stay in sync.

## Public-safe rules

The experience copy is a public-safe version of a private career pack. A claim goes on the site only
when it has a source and has been cleared for public use. Numbers are kept where they were cleared;
adjectives are not a substitute for a number.

Never in this public repo:

- AWS account IDs, KVS ARNs, bucket names, distribution IDs;
- LAN IPs, VLAN IDs, internal hostnames or tunnel details;
- API keys, tokens, `.secrets/` contents;
- customer names, internal service names, ticket IDs or unannounced work;
- family members' full names, faces or schools without consent.

Operator documentation for the site's AWS services lives in the private homelab repo. See
[`docs/PAGE-FACTORY.md`](./PAGE-FACTORY.md) for the page factory's public contract.

## Future wiring (not done)

If the brief becomes the runtime source, the smallest safe change is:

1. Add a schema for the frontmatter and the repeated sections.
2. Load `content/SITE-CONTENT.md` at build time (frontmatter plus parsed headings), or move the
   structured parts to a YAML file beside it.
3. Re-export the existing `profile.ts` / `story.ts` names from the loader, so pages do not change.
4. Keep the Markdown prose for the long-form sections that do not fit a schema.

Do that only when the brief is stable enough to be a source of truth. Until then, duplicate less:
update the brief first, then the runtime copy.

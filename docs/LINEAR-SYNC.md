# GitHub → Linear issue sync

GitHub Issues are the source of truth for work on this site. Linear is the
planning view. The workflow in `.github/workflows/linear-sync.yml` mirrors any
GitHub issue labelled **`linear`** into a Linear project; closing the GitHub
issue moves the Linear issue to the team's completed state.

The first run creates the Linear project if it does not already exist. The
defaults are:

| Setting | Default |
|---|---|
| Linear team key | `MMH` |
| Linear project | `matheesan.ca — 2026 Site Review` |
| Opt-in label | `linear` |

## One-time setup

1. Create a Linear **personal API key** (Linear → Settings → API → Personal API
   keys). A project-scoped or workspace-scoped key is fine; do not use an OAuth
   token from another app.
2. Add it as a repository secret:

   ```sh
   gh secret set LINEAR_API_KEY --repo Matheesan2113/matheesan-site
   ```

3. Optionally override the defaults with repository variables:

   ```sh
   gh variable set LINEAR_TEAM_KEY --body "MMH" --repo Matheesan2113/matheesan-site
   gh variable set LINEAR_PROJECT_NAME --body "matheesan.ca — 2026 Site Review" --repo Matheesan2113/matheesan-site
   ```

4. Run the workflow once with **Sync all** enabled so existing labelled issues
   are mirrored:

   ```sh
   gh workflow run linear-sync.yml -f sync_all=true --repo Matheesan2113/matheesan-site
   ```

After that it runs automatically when a `linear`-labelled issue is opened,
edited, reopened, closed, labelled or unlabelled.

## What is synced

| GitHub | Linear |
|---|---|
| Title | Title |
| Body | Description, with a `<!-- github:owner/repo#123 -->` marker |
| `p0` / `p1` / `p2` / `p3` label | Priority: urgent / high / medium / low |
| Open | First unstarted state (usually Todo) |
| Closed | First completed state (usually Done) |
| `linear` label | Opt-in switch; removing it stops future syncs |

The GitHub issue body receives a hidden `<!-- linear:MMH-123 -->` marker on
first sync, which is how subsequent runs find the Linear issue without an
external database.

## What is not synced

- Comments (add them in one place; GitHub is the record).
- Assignees, due dates, estimates and arbitrary Linear labels.
- Linear → GitHub changes. This is deliberately one-way: if you edit the
  Linear title or description, the next GitHub edit overwrites it.
- Deletions. Removing a GitHub issue does not delete the Linear issue.

## Manual use

```sh
# Mirror one issue (the event path is how Actions passes it)
GITHUB_REPOSITORY=Matheesan2113/matheesan-site \
GITHUB_TOKEN="$(gh auth token)" \
LINEAR_API_KEY=... \
GITHUB_EVENT_PATH=/tmp/issue-event.json \
node scripts/sync-linear.mjs

# Mirror every issue labelled `linear`
GITHUB_REPOSITORY=Matheesan2113/matheesan-site \
GITHUB_TOKEN="$(gh auth token)" \
LINEAR_API_KEY=... \
SYNC_ALL=true node scripts/sync-linear.mjs

# Print the plan without calling Linear or editing GitHub
DRY_RUN=true SYNC_ALL=true ... node scripts/sync-linear.mjs
```

## Security

- The API key lives only in the Actions secret store; it is never written to the
  repository or the workflow log.
- The workflow has `contents: read` and `issues: write`; it does not check out
  or execute pull-request code, and it only runs on issue events or manual
  dispatch.
- The Linear key only needs permission to read teams/projects and create/update
  issues. Rotate it like any other credential.
- If the secret is absent, the workflow exits successfully with a notice rather
  than failing every issue event.

## Troubleshooting

- **Nothing syncs.** Confirm the issue has the `linear` label and that the
  `LINEAR_API_KEY` secret exists. Run the workflow manually with `sync_all` on.
- **Project not found.** Check `LINEAR_TEAM_KEY`; the API key must be able to
  see that team. The project is created on first run.
- **Duplicate Linear issues.** This can happen if a sync created the issue but
  failed before writing the GitHub marker. Link the issue manually by adding
  `<!-- linear:MMH-123 -->` to the GitHub body; the next run will update it.
- **Linear state does not move.** The team needs at least one `unstarted` or
  `backlog` state and one `completed` state.

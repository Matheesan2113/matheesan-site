#!/usr/bin/env node
// One-way GitHub Issues -> Linear mirror.
//
// GitHub is the source of truth. Any issue carrying the `linear` label is
// created or updated in a Linear project; closing the GitHub issue moves the
// Linear issue to the team's completed state. Linear edits are overwritten on
// the next sync, so the Linear side is a planning view, not a second inbox.
//
// Required environment:
//   GITHUB_REPOSITORY   owner/repo (set by Actions)
//   GITHUB_TOKEN        token with issues:write (set by Actions)
//   LINEAR_API_KEY      Linear personal API key
// Optional:
//   LINEAR_TEAM_KEY     default "MMH"
//   LINEAR_PROJECT_NAME default "matheesan.ca — 2026 Site Review"
//   SYNC_ALL            "true" to mirror every issue labeled `linear`
//   LINEAR_SYNC_LABEL   default "linear"
//   DRY_RUN             "true" to print the plan without calling Linear
//   GITHUB_API_URL / LINEAR_API_URL  overrides for local testing
//
// The link is stored in the GitHub issue body as `<!-- linear:MMH-123 -->`
// and in the Linear description as `<!-- github:owner/repo#123 -->`.

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const GITHUB_API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const LINEAR_API = process.env.LINEAR_API_URL || 'https://api.linear.app/graphql';
const REPO = process.env.GITHUB_REPOSITORY || '';
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const LINEAR_KEY = process.env.LINEAR_API_KEY || '';
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'MMH';
const PROJECT_NAME = process.env.LINEAR_PROJECT_NAME || 'matheesan.ca — 2026 Site Review';
const SYNC_LABEL = process.env.LINEAR_SYNC_LABEL || 'linear';
const SYNC_ALL = process.env.SYNC_ALL === 'true';
const DRY_RUN = process.env.DRY_RUN === 'true';

const GITHUB_MARKER_RE = /<!--\s*linear:([A-Z][A-Z0-9]*-\d+)\s*-->/;
const githubMarker = (number) => `<!-- github:${REPO}#${number} -->`;

const PRIORITY = { p0: 1, p1: 2, p2: 3, p3: 4 };

export function priorityFromLabels(labels) {
  const names = labels.map((label) => (typeof label === 'string' ? label : label.name)).map((name) => name.toLowerCase());
  for (const [label, priority] of Object.entries(PRIORITY)) {
    if (names.includes(label)) return priority;
  }
  return 0;
}

export function parseLinkMarker(body) {
  return String(body || '').match(GITHUB_MARKER_RE)?.[1] || null;
}

function fail(message) {
  throw new Error(message);
}

function log(message) {
  console.log(message);
}

async function github(path, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${GH_TOKEN}`,
      'user-agent': 'matheesan-site-linear-sync',
      'x-github-api-version': '2022-11-28',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    fail(`GitHub ${options.method || 'GET'} ${path} failed (${response.status}): ${text.slice(0, 400)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function linear(query, variables = {}) {
  const response = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: LINEAR_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors?.length) {
    fail(`Linear API failed (${response.status}): ${JSON.stringify(payload.errors || payload).slice(0, 600)}`);
  }
  return payload.data;
}

function labelNames(issue) {
  return (issue.labels || []).map((label) => (typeof label === 'string' ? label : label.name));
}

function hasSyncLabel(issue) {
  return labelNames(issue).some((name) => name.toLowerCase() === SYNC_LABEL.toLowerCase());
}

function normalizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    state: issue.state,
    html_url: issue.html_url,
    labels: labelNames(issue),
  };
}

async function issueFromEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return null;
  let event;
  try {
    event = JSON.parse(await readFile(eventPath, 'utf8'));
  } catch {
    return null;
  }
  if (event.pull_request || event.issue?.pull_request) return null;
  if (!event.issue) return null;
  if (event.action === 'unlabeled') return null;
  if (event.action === 'labeled' && event.label?.name?.toLowerCase() !== SYNC_LABEL.toLowerCase()) return null;
  const issue = normalizeIssue(event.issue);
  return hasSyncLabel(issue) ? issue : null;
}

async function issuesLabeledForSync() {
  const issues = [];
  for (let page = 1; ; page += 1) {
    const batch = await github(`/repos/${REPO}/issues?state=all&labels=${encodeURIComponent(SYNC_LABEL)}&per_page=100&page=${page}`);
    issues.push(...batch.filter((issue) => !issue.pull_request).map(normalizeIssue));
    if (batch.length < 100) break;
  }
  return issues;
}

async function resolveTeam() {
  const data = await linear(
    `query($key: String!) { teams(filter: { key: { eq: $key } }) { nodes { id key name } } }`,
    { key: TEAM_KEY },
  );
  const team = data.teams.nodes[0];
  if (!team) fail(`No Linear team with key "${TEAM_KEY}" is visible to this API key.`);
  return team;
}

async function resolveProject(teamId) {
  const data = await linear(
    `query($name: String!) { projects(filter: { name: { eq: $name } }) { nodes { id name } } }`,
    { name: PROJECT_NAME },
  );
  const existing = data.projects.nodes[0];
  if (existing) return existing;
  if (DRY_RUN) return { id: 'dry-run-project', name: PROJECT_NAME };
  const created = await linear(
    `mutation($input: ProjectCreateInput!) { projectCreate(input: $input) { success project { id name } } }`,
    {
      input: {
        name: PROJECT_NAME,
        description: `Cross-vertical review of matheesan.ca, November 2026. Mirrored from GitHub issues in ${REPO}. GitHub is the source of truth.`,
        teamIds: [teamId],
      },
    },
  );
  if (!created.projectCreate.success) fail('Linear refused to create the project.');
  log(`Created Linear project "${PROJECT_NAME}".`);
  return created.projectCreate.project;
}

async function projectIssues(projectId) {
  const nodes = [];
  let after = null;
  do {
    const data = await linear(
      `query($projectId: String!, $after: String) {
        issues(filter: { project: { id: { eq: $projectId } } }, first: 100, after: $after) {
          nodes { id identifier title description priority state { id name type } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { projectId, after },
    );
    nodes.push(...data.issues.nodes);
    after = data.issues.pageInfo.hasNextPage ? data.issues.pageInfo.endCursor : null;
  } while (after);
  return nodes;
}

async function teamStates(teamId) {
  const data = await linear(
    `query($teamId: String!) { team(id: $teamId) { states { nodes { id name type position } } } }`,
    { teamId },
  );
  const states = data.team?.states?.nodes || [];
  const byPosition = (a, b) => a.position - b.position;
  return {
    unstarted: states.filter((state) => state.type === 'unstarted').sort(byPosition)[0]
      || states.filter((state) => state.type === 'backlog').sort(byPosition)[0],
    completed: states.filter((state) => state.type === 'completed').sort(byPosition)[0],
  };
}

function descriptionFor(issue) {
  const body = issue.body.trim();
  return [
    body || '_No description._',
    '',
    '---',
    '',
    `Synced from [GitHub #${issue.number}](${issue.html_url}) in \`${REPO}\`.`,
    'GitHub is the source of truth; edits made in Linear are overwritten on the next sync.',
    '',
    githubMarker(issue.number),
  ].join('\n');
}

async function appendMarker(issue, identifier) {
  if (parseLinkMarker(issue.body)) return;
  const body = `${issue.body.trimEnd()}\n\n<!-- linear:${identifier} -->\n`;
  if (DRY_RUN) {
    log(`  would add marker ${identifier} to GitHub #${issue.number}`);
    return;
  }
  await github(`/repos/${REPO}/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ body }) });
  issue.body = body;
}

async function syncIssue(issue, context) {
  const description = descriptionFor(issue);
  const priority = priorityFromLabels(issue.labels);
  const linkedIdentifier = parseLinkMarker(issue.body);
  const existing = (linkedIdentifier && context.byIdentifier.get(linkedIdentifier))
    || context.byGithubMarker.get(issue.number);

  const targetState = issue.state === 'closed' ? context.states.completed : context.states.unstarted;
  const stateId = targetState?.id;
  const wantsCompleted = issue.state === 'closed';
  const isCompleted = existing?.state?.type === 'completed';
  const isCanceled = existing?.state?.type === 'canceled';
  const shouldMoveState = existing && stateId && (wantsCompleted ? !isCompleted : isCompleted || isCanceled);

  if (existing) {
    const input = {};
    if (existing.title !== issue.title) input.title = issue.title;
    if (existing.description !== description) input.description = description;
    if (existing.priority !== priority) input.priority = priority;
    if (shouldMoveState) input.stateId = stateId;
    if (!Object.keys(input).length) {
      log(`#${issue.number} ${existing.identifier}: unchanged`);
      await appendMarker(issue, existing.identifier);
      return;
    }
    if (!DRY_RUN) {
      await linear(
        `mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success issue { identifier } } }`,
        { id: existing.id, input },
      );
    }
    log(`#${issue.number} ${existing.identifier}: ${DRY_RUN ? 'would update' : 'updated'} (${Object.keys(input).join(', ')})`);
    await appendMarker(issue, existing.identifier);
    return;
  }

  if (DRY_RUN) {
    log(`#${issue.number}: would create in ${PROJECT_NAME} (priority ${priority}, state ${targetState?.name || 'default'})`);
    return;
  }

  const created = await linear(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id identifier } }
    }`,
    {
      input: {
        teamId: context.team.id,
        projectId: context.project.id,
        title: issue.title,
        description,
        priority,
        ...(stateId ? { stateId } : {}),
      },
    },
  );
  if (!created.issueCreate.success) fail(`Linear refused to create an issue for GitHub #${issue.number}.`);
  const identifier = created.issueCreate.issue.identifier;
  log(`#${issue.number}: created ${identifier}`);
  await appendMarker(issue, identifier);
}

async function main() {
  if (!REPO) fail('GITHUB_REPOSITORY is required.');
  if (!GH_TOKEN) fail('GITHUB_TOKEN is required.');
  if (!DRY_RUN && !LINEAR_KEY) fail('LINEAR_API_KEY is required (or set DRY_RUN=true).');

  const eventIssue = SYNC_ALL ? null : await issueFromEvent();
  const issues = SYNC_ALL ? await issuesLabeledForSync() : eventIssue ? [eventIssue] : [];

  if (!issues.length) {
    log('Nothing to sync (no issue with the linear label in this event).');
    return;
  }

  if (DRY_RUN) {
    for (const issue of issues) {
      log(`#${issue.number} "${issue.title}" -> ${PROJECT_NAME} [${issue.state}, priority ${priorityFromLabels(issue.labels)}, labels: ${issue.labels.join(', ')}]`);
    }
    return;
  }

  const team = await resolveTeam();
  const project = await resolveProject(team.id);
  const states = await teamStates(team.id);
  const existing = await projectIssues(project.id);
  const byIdentifier = new Map(existing.map((issue) => [issue.identifier, issue]));
  const byGithubMarker = new Map();
  for (const issue of existing) {
    const match = String(issue.description || '').match(new RegExp(`<!--\\s*github:${REPO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}#(\\d+)\\s*-->`));
    if (match) byGithubMarker.set(Number(match[1]), issue);
  }

  log(`Syncing ${issues.length} issue(s) to ${team.key} / ${project.name}.`);
  const errors = [];
  for (const issue of issues) {
    try {
      await syncIssue(issue, { team, project, states, byIdentifier, byGithubMarker });
    } catch (error) {
      errors.push(`#${issue.number}: ${error.message}`);
      console.error(`#${issue.number}: ${error.message}`);
    }
  }
  if (errors.length) {
    console.error(`\n${errors.length} issue(s) failed:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

// Public-safe copy. Customer names, internal service names and unverified claims
// are deliberately left out; numbers trace back to the private career pack.

export const site = {
  name: 'Matheesan',
  domain: 'https://matheesan.ca',
  role: 'Senior Software Engineer',
  personalRole: 'Engineer · DJ · Gamer',
  location: 'Markham, Ontario',
  coords: '43.8561° N · 79.3370° W',
  positioning: 'Engineer by day. DJ by night. Gamer in between.',
  intro:
    'Tamil-Canadian, born in Toronto, raised in Markham. I build AI systems for a living, mix music after hours, and spend the rest of my time in Elden Ring, Wukong, Mario Kart, Valorant and Overwatch. This is the whole map.',
  status: 'open to senior / staff AI engineering & platform roles',
  personalStatus: 'currently: agent evals · a new mix · Wukong',
  socials: {
    github: 'https://github.com/Matheesan2113',
    linkedin: 'https://www.linkedin.com/in/matheesanm',
    instagram: 'https://www.instagram.com/matheesan_m',
  },
};

export const now = [
  { value: 'house', label: 'listening', note: 'disco · ambient · Tamil' },
  { value: 'Wukong', label: 'playing', note: 'Elden Ring on deck' },
  { value: 'decks', label: 'mixing', note: 'a set I’ll never finish' },
  { value: 'Markham', label: 'based', note: '43.8561° N · 79.3370° W' },
];

export type CrateItem = {
  key: string;
  title: string;
  body: string;
  tags: string[];
};

export const music = {
  intro:
    'I DJ — house, disco, ambient, Tamil, hip-hop, whatever the room needs. The same part of my brain that likes a clean API likes a clean transition: read the room, set up the next move, don’t over-explain the drop.',
  crate: [
    {
      key: 'warm-up',
      title: 'Warm-up',
      body: 'Deep house, broken beat and slow disco. The first hour is a conversation, not a countdown.',
      tags: ['deep house', 'broken beat', 'slow disco'],
    },
    {
      key: 'peak time',
      title: 'Peak time',
      body: 'Disco, house and anything with a vocal that makes the room move before the drums do.',
      tags: ['disco', 'house', 'vocals'],
    },
    {
      key: 'after hours',
      title: 'After hours',
      body: 'Ambient, dub techno and late-night Tamil. For the drive home and the thoughts that arrive with it.',
      tags: ['ambient', 'dub techno', 'Tamil'],
    },
    {
      key: 'roots',
      title: 'Roots',
      body: 'Tamil film music, A. R. Rahman, Ilaiyaraaja. The first library I ever had, still the deepest.',
      tags: ['Tamil film', 'A. R. Rahman', 'Ilaiyaraaja'],
    },
    {
      key: 'home',
      title: 'Home listening',
      body: 'Jazz, film scores, lo-fi and the kind of album you put on to do one thing for three hours.',
      tags: ['jazz', 'scores', 'lo-fi'],
    },
    {
      key: 'wildcard',
      title: 'Wildcard',
      body: 'Whatever the room asks for. The best transitions are the ones nobody saw coming.',
      tags: ['whatever fits', 'left field', 'one more'],
    },
  ] as CrateItem[],
  booth: [
    {
      key: 'read the room, not the waveform',
      body: 'The crowd tells you what the next track is. The meters only tell you it is loud.',
    },
    {
      key: 'a transition is a handoff',
      body: 'Same as an API boundary: leave the next person — or the next track — in a better state than you found it.',
    },
    {
      key: 'practice the boring part',
      body: 'Beatmatching, cue points, gain. The exciting part is easier when the fundamentals are automatic.',
    },
  ],
  spotify: {
    url: '',
    search: 'https://open.spotify.com/search/Matheesan%20Manokaran',
  },
};

export type Game = {
  id: string;
  title: string;
  kind: string;
  status: string;
  body: string;
  tags: string[];
};

export const games: Game[] = [
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    kind: 'soulslike · open world',
    status: 'the benchmark',
    body: 'The first Tree Sentinel humbled me. The world kept me. Still the game I measure other games against — not for difficulty, for the feeling of finding something that was always there.',
    tags: ['soulslike', 'open world', 'exploration'],
  },
  {
    id: 'black-myth-wukong',
    title: 'Black Myth: Wukong',
    kind: 'action RPG',
    status: 'currently playing',
    body: 'A boss rush with the art direction turned up to eleven. Here for the transformations, the mythology and the next wall that makes the clear feel earned.',
    tags: ['action RPG', 'boss fights', 'mythology'],
  },
  {
    id: 'mario-kart',
    title: 'Mario Kart',
    kind: 'kart racer',
    status: 'comfort game',
    body: 'The great equalizer. Blue shells are a personality test, friendships are provisional, and the last lap is never over.',
    tags: ['kart racer', 'party game', 'chaos'],
  },
  {
    id: 'valorant',
    title: 'Valorant',
    kind: 'tactical FPS',
    status: 'aim training',
    body: 'Crosshair placement is a lifestyle. My aim is a work in progress; the comms are not. The best rounds are the ones where nobody panics.',
    tags: ['tactical FPS', 'comms', 'precision'],
  },
  {
    id: 'overwatch',
    title: 'Overwatch',
    kind: 'hero shooter',
    status: 'team fight',
    body: 'Ult economy, chaos and the eternal question of who is actually going to touch the point. I like the games where five people have to become one team.',
    tags: ['hero shooter', 'team play', 'ult economy'],
  },
];

export const principles = [
  {
    key: 'numbers > adjectives',
    body: 'If it can’t be measured, it’s a hypothesis. Every claim on this site has a number or a reproduction behind it.',
  },
  {
    key: 'deterministic > generative',
    body: 'LLMs where judgment helps. Code, constraints and test oracles where correctness matters.',
  },
  {
    key: 'absence must be loud',
    body: '“0 collected” is not “0 failed.” A suite that never ran looks exactly like a suite that passed.',
  },
  {
    key: 'be wrong in writing',
    body: 'Retract fast, fix faster, log the correction. The correction log is part of the work.',
  },
];

export type Job = {
  company: string;
  role: string;
  period: string;
  place: string;
  summary: string;
  highlights: string[];
  stack: string[];
  award?: string;
};

export const jobs: Job[] = [
  {
    company: 'Replicant',
    role: 'Senior Software Engineer',
    period: 'Oct 2021 — Oct 2026',
    place: 'Remote · Toronto',
    summary:
      'Forward-deployed AI engineer: enterprise LLM voice agents, model routing, knowledge/RAG layers, evals and agentic tooling — from API review through launch and hypercare.',
    highlights: [
      'Took enterprise LLM voice agents from an empty repo to production: state machines, tool calls, auth, fallbacks and hypercare.',
      'Built the platform layer around them: provider routing and fallbacks, knowledge bases and RAG, eval harnesses, guardrails and observability.',
      'Worked across frontier and open-weight providers; treated model and prompt upgrades as releases with regression evals.',
      'Caught launch-blocking auth, wrong-record and first-time-user defects before they reached callers; turned them into acceptance tests and release gates.',
      'Built agentic tooling — AI coding skills, MCP servers, code-enforced reviewer gates — and drove Copilot, Cursor and Claude Code adoption across engineering.',
    ],
    stack: ['LLM systems', 'model routing', 'RAG', 'vector search', 'TypeScript', 'Python', 'GCP', 'MCP', 'Claude Code'],
  },
  {
    company: 'CGI',
    role: 'Software Engineer — Emerging Tech',
    period: '2019 — 2021',
    place: 'Toronto',
    summary:
      'Enterprise AI/ML and MLOps in the pre-LLM era. Built document-intelligence and model-delivery prototypes when both were still bespoke.',
    highlights: [],
    stack: ['Python', 'OCR / NLP', 'MLOps', 'Azure', 'Docker', 'CI/CD'],
  },
  {
    company: 'Avaya',
    role: 'Software Engineering Intern',
    period: '2018',
    place: 'Toronto',
    summary:
      'Enterprise communications infrastructure. Learned to debug real-time systems where a second is a long time.',
    highlights: [],
    stack: ['SIP / VoIP', 'networking', 'test harnesses', 'Linux'],
  },
  {
    company: 'Ryerson University → TMU',
    role: 'BEng, Computer Engineering',
    period: '2015 — 2019',
    place: 'Toronto',
    summary:
      'Computer engineering with a final-year ML project: Twitter data into interaction graphs into community structure.',
    highlights: [],
    stack: ['Python', 'NetworkX', 'NLP', 'graph analysis'],
  },
];

export const careerStats = [
  { value: '2018', label: 'first enterprise system', note: 'Avaya · real-time comms' },
  { value: '2019', label: 'first production ML', note: 'CGI · document intelligence' },
  { value: '2021', label: 'first LLM agent', note: 'voice + tool use' },
  { value: '2026', label: 'agentic tooling', note: 'routers · RAG · evals' },
];

export type EarlyProject = {
  year: string;
  org: string;
  title: string;
  body: string;
  tags: string[];
  why: string;
};

export const earlyProjects: EarlyProject[] = [
  {
    year: '2018',
    org: 'Avaya',
    title: 'Real-time comms test harnesses',
    body: 'Built tooling to trace SIP/VoIP call flows and reproduce state across systems that could not be restarted casually.',
    tags: ['SIP / VoIP', 'Linux', 'test harnesses'],
    why: 'Made latency and state visible.',
  },
  {
    year: '2019',
    org: 'Ryerson / TMU',
    title: 'Graph communities from Twitter',
    body: 'Ingested tweets, built interaction graphs and ran community detection on sparse, noisy data.',
    tags: ['Python', 'NetworkX', 'NLP'],
    why: 'First time a model found structure I hadn’t put there.',
  },
  {
    year: '2019',
    org: 'CGI',
    title: 'Document intelligence before LLMs',
    body: 'OCR + classical NLP + rules to extract structure from messy documents. The model was a small part; the pipeline was the product.',
    tags: ['OCR', 'NLP', 'pipelines'],
    why: 'Taught me to make the boring path reliable.',
  },
  {
    year: '2020',
    org: 'CGI',
    title: 'The MLOps runway',
    body: 'Containerised model serving, CI/CD, monitoring and rollback for models that had lived in notebooks.',
    tags: ['Docker', 'CI/CD', 'monitoring'],
    why: 'Made models deployable, not just demonstrable.',
  },
];

export type PlatformLayer = {
  key: string;
  title: string;
  body: string;
  tags: string[];
};

export const platformLayers: PlatformLayer[] = [
  {
    key: 'providers',
    title: 'Providers',
    body: 'Frontier and open-weight models behind one interface. Model upgrades are releases, not config changes.',
    tags: ['OpenAI', 'Anthropic', 'Google', 'open-weight'],
  },
  {
    key: 'routers',
    title: 'Routers',
    body: 'Fallback, retries, cost/latency policy and per-tenant routing. The model is a dependency; the router is the architecture.',
    tags: ['fallbacks', 'retries', 'budgets', 'policy'],
  },
  {
    key: 'knowledge',
    title: 'Knowledge bases',
    body: 'Ingestion, chunking, embeddings, vector search and citations. Retrieval quality is its own eval problem.',
    tags: ['embeddings', 'pgvector', 'Pinecone', 'Weaviate'],
  },
  {
    key: 'rag',
    title: 'RAG',
    body: 'Retrieval orchestration, context assembly and grounded answers, measured against must-answer and must-not-answer sets.',
    tags: ['retrieval', 'context', 'citations', 'evals'],
  },
  {
    key: 'agents',
    title: 'Agents',
    body: 'State machines, tool calls, MCP and guardrails. Deterministic where correctness matters; generative where judgment helps.',
    tags: ['state machines', 'tool use', 'MCP', 'guardrails'],
  },
  {
    key: 'evals',
    title: 'Evals',
    body: 'Scenario harnesses, must / must-not assertions, replay and production traces — the thing that makes the rest safe to change.',
    tags: ['must / must-not', 'replay', 'silent-green', 'traces'],
  },
];

export type Tool = {
  name: string;
  stage: string;
  changed: string;
  used: string;
};

export type ToolingYear = {
  year: string;
  label: string;
  note: string;
  tools: Tool[];
};

export const toolingStages = ['research', 'design', 'build', 'integrate', 'test', 'review', 'ship', 'operate'];

export const toolingYears: ToolingYear[] = [
  {
    year: '2021',
    label: 'autocomplete',
    note: 'The editor starts suggesting.',
    tools: [
      {
        name: 'GitHub Copilot',
        stage: 'build',
        changed: 'Inline suggestions, right in the editor.',
        used: 'Boilerplate, tests and unfamiliar APIs — every line reviewed.',
      },
      {
        name: 'OpenAI Codex',
        stage: 'build',
        changed: 'Natural language to code before chat felt normal.',
        used: 'Small prototypes and interface sketches; the spec became the prompt.',
      },
      {
        name: 'Hugging Face',
        stage: 'research',
        changed: 'The model shelf: transformers, tokenizers, datasets.',
        used: 'First stop for NLP prototypes and model comparisons.',
      },
    ],
  },
  {
    year: '2022',
    label: 'the generative breakout',
    note: 'Chat, speech and the first chains.',
    tools: [
      {
        name: 'ChatGPT',
        stage: 'research',
        changed: 'A general model behind a dialogue box.',
        used: 'Debugging partner and rubber duck; replaced tab-hoarding, never replaced a repro.',
      },
      {
        name: 'Whisper',
        stage: 'build',
        changed: 'Open speech-to-text that ran locally.',
        used: 'Transcribed calls and audio notes; made voice-agent debugging searchable.',
      },
      {
        name: 'LangChain',
        stage: 'build',
        changed: 'Chains, tools and the first RAG patterns.',
        used: 'Prototyped retrieval and tool flows; learned where the abstraction earns its keep.',
      },
    ],
  },
  {
    year: '2023',
    label: 'editor-native + local',
    note: 'AI moves into the editor and onto my GPU.',
    tools: [
      {
        name: 'Cursor',
        stage: 'build',
        changed: 'An AI-native editor with multi-file context.',
        used: 'Moved from autocomplete to reviewing diffs across a repo.',
      },
      {
        name: 'Ollama',
        stage: 'operate',
        changed: 'Local models on hardware I control.',
        used: 'Private experiments on the RTX A2000; no data left the lab.',
      },
      {
        name: 'AutoGPT',
        stage: 'build',
        changed: 'The first runaway agent loop.',
        used: 'Learned to cap iterations, scope tools narrowly, and verify before acting.',
      },
    ],
  },
  {
    year: '2024',
    label: 'context + protocol',
    note: 'Long context, standard tools, routing + retrieval.',
    tools: [
      {
        name: 'Claude 3.5 Sonnet',
        stage: 'review',
        changed: 'Long-context code reasoning that held a module.',
        used: 'Refactors, reviews and test plans; output still went through a diff.',
      },
      {
        name: 'MCP',
        stage: 'integrate',
        changed: 'A standard way to give models tools and data.',
        used: 'Wrapped APIs and docs as tool servers; least privilege, read-only by default.',
      },
      {
        name: 'LLM routers + RAG',
        stage: 'integrate',
        changed: 'Provider fallback plus retrieval, not just a bigger prompt.',
        used: 'Routed across providers, grounded answers in a knowledge base, and measured retrieval separately from generation.',
      },
    ],
  },
  {
    year: '2025',
    label: 'agentic coding',
    note: 'The terminal becomes the agent surface.',
    tools: [
      {
        name: 'Claude Code',
        stage: 'build',
        changed: 'A terminal agent with repo context.',
        used: 'Skills, subagents and repeatable workflows; the agent works where the code lives.',
      },
      {
        name: 'OpenAI Codex',
        stage: 'build',
        changed: 'Parallel code tasks in the cloud and CLI.',
        used: 'Independent patches and test scaffolding, reviewed like a junior PR.',
      },
      {
        name: 'Gemini CLI',
        stage: 'research',
        changed: 'Large-context repo analysis in the terminal.',
        used: 'Migration sweeps and “where is this used?” questions across big repos.',
      },
    ],
  },
  {
    year: '2026',
    label: 'the protocol layer',
    note: 'The tool protocol settles; workflows get packaged.',
    tools: [
      {
        name: 'MCP servers',
        stage: 'integrate',
        changed: 'Tools, data and internal APIs behind one interface.',
        used: 'Standard tool surface for agents; scoped credentials and audit-friendly boundaries.',
      },
      {
        name: 'Claude Code skills',
        stage: 'build',
        changed: 'Packaged, reusable agent workflows.',
        used: 'API contract generation, test writing, release notes; guardrails in code.',
      },
      {
        name: 'Ollama + Open WebUI',
        stage: 'operate',
        changed: 'Private inference with a usable front end.',
        used: 'Local models for sensitive experiments and offline eval runs.',
      },
    ],
  },
];

export const toolingNotes = [
  {
    key: 'optimize for',
    body: 'short feedback loops · visible evidence · least privilege',
  },
  {
    key: 'do not trust',
    body: 'green tests without counts · agent output without a diff review · benchmarks without my workload',
  },
  {
    key: 'daily stack',
    body: 'Claude Code + MCP · Cursor/Copilot inline · Ollama for private · an eval harness for proof',
  },
];

export type CaseFile = {
  id: string;
  number: string;
  title: string;
  deck: string;
  metrics: string[];
  tags: string[];
  problem: string;
  approach: string;
  hard: string;
  result: string;
  differently: string;
};

export const caseFiles: CaseFile[] = [
  {
    id: 'voice-agent',
    number: '01',
    title: 'The production voice agent',
    deck: 'Empty repo to live, multi-turn agent — and the defects that nearly shipped.',
    metrics: ['empty repo → live', 'auth + booking', '3 launch blockers caught'],
    tags: ['LLM agents', 'state machine', 'OAuth2', 'evals', 'production'],
    problem:
      'An enterprise voice agent had to authenticate callers, validate eligibility and write multi-step transactions against a legacy API — with no room for a wrong-record change.',
    approach:
      'Built the core in a YAML state-machine DSL: atomic multi-step transactions, client-side eligibility checks, OAuth2 integration, and a fallback auth path when a planned endpoint did not ship. Turned a readiness audit into a delivery backlog and ran releases through go-live.',
    hard:
      'Three defects would have reached callers: an authentication bypass, a confirmation path that could act on the wrong record, and a default that blocked first-time users. I proved the last one with a single-variable test against the live API and found the unit test that had encoded the bug.',
    result:
      'Launched and handed over to hypercare. Took the launch-critical auth suite from never-executed to fully passing, cut validation violations to zero across thousands of tests, and reached full measurable component coverage.',
    differently:
      'I would make “did the test actually execute?” a first-class assertion from day one, not something I discover during a launch audit.',
  },
  {
    id: 'migration',
    number: '02',
    title: 'The migration rescue',
    deck: 'A stalled enterprise migration, rebuilt and cut over in five weeks.',
    metrics: ['5-week rebuild', '100% cutover', 'test gate shipped'],
    tags: ['migration', 'routing', 'contact-centre', 'testing'],
    problem:
      'An enterprise migration to LLM agents failed its first launch and had become a churn risk. I took ownership with roughly two days of handover.',
    approach:
      'Reviewed and promoted a stacked rebuild. Rebuilt transfer routing from a read-only production snapshot, shipped a paired agent action and integration resolver with a safe fallback, expanded the hand-off payload with a deterministic intent map and a guarded LLM-generated subject, and made a product-facing test suite a CI merge gate.',
    hard:
      'The routing truth lived in production behind a blocked network dependency. My first finding was wrong; I retracted it the same day. I also called off and fixed a regression within a day.',
    result:
      'Cut over to 100% of traffic with better authentication success than the legacy agent. Kept adversarial asserts as a tracked finding instead of weakening them.',
    differently:
      'I would ask for the routing source of truth before the first design review. Production data could have killed the theory in an hour.',
  },
  {
    id: 'silent-green',
    number: '03',
    title: 'Silent green',
    deck: 'The AI made the change. The tests passed. The bug shipped anyway.',
    metrics: ['6 of 16 failures', '5 lint rules', '1 rule across 5 projects'],
    tags: ['evals', 'LLM QA', 'linting', 'agentic coding', 'test oracles'],
    problem:
      'AI-authored agent configs looked done when they were not. The change was made, the suite reported green, and a real defect still reached users. I collected 16 field failures to find out why.',
    approach:
      'Classified 6 of the 16 as “silent green” and wrote them as harness-ready eval scenarios with must / must-not assertions, so an eval that only checked diffs and test results could no longer score them as successes. Proposed five static lint rules; the first surfaced new issues across five projects. Codified the team rules: “0 collected ≠ 0 failed,” “allow_failure is not a pass,” and “assert absence for stop-doing-X requirements.”',
    hard:
      'The failure mode is absence, and absence is quiet. A suite that never runs exits cleanly. A linter that times out can print “No issues found.” An AI agent can satisfy a requirement by weakening the assertion. Each fix had to make the missing thing loud.',
    result:
      'Six historical failures now run as explicit eval scenarios. Five rules were accepted for the platform linter, and the first one found new issues in five projects.',
    differently:
      'I would wire the eval harness before the first AI-authored config, not after the sixth silent failure.',
  },
  {
    id: 'cloud-run',
    number: '04',
    title: 'The prototype that lost',
    deck: 'A cheaper Cloud Run replacement for a high-volume iPaaS — and why I recommended against it.',
    metrics: ['p95 401 ms', '37–45 ms warm', '~99% lower modelled cost'],
    tags: ['GCP', 'Cloud Run', 'Bun', 'benchmarking', 'technical judgment'],
    problem:
      'A high-volume integration platform was a cost and control risk. The team needed to know whether a per-tenant Cloud Run service could replace it.',
    approach:
      'Ported a six-flow production integration to per-tenant Cloud Run services: a Bun-compiled 107 MB container, preview deploys in about 7 seconds, metadata-only rollback, and verified cross-tenant isolation. Benchmarked cold start at p50/p95/p99 of 291/401/453 ms and warm requests at 37–45 ms.',
    hard:
      'The target was 300 ms p95. The prototype missed it at 401 ms. Keeping an always-warm pool would have cost roughly 5.5× the alternative, which erased the headline savings. The honest answer was that the cheaper platform was the better platform for this workload.',
    result:
      'Modelled hosting cost was about 99% lower, but I reported the trade-off where the prototype lost. That informed the organisation’s choice of the other platform. I also pushed PII redaction, alerting and PCI shared responsibility into the platform requirements.',
    differently:
      'Nothing. The point was to find out before migrating a high-volume platform — and the prototype did its job by losing on evidence.',
  },
];

export const alsoBuilt = [
  'An AI skill that generates every new agent’s API-integration contract from an OpenAPI spec, distributed to every agent repo.',
  'An agentic workbench that turns failing production traces into reviewed draft fixes — with push / merge / deploy refused in code before a model is asked.',
  'An unattended outbound dialer on Cloud Run Jobs with a generation-precondition lease, kill switch and Terraform-managed infrastructure.',
  'An incident postmortem that corrected an outage window by about an hour, because the worst phase ran under an alert mute.',
];

export const toolbox = [
  {
    label: 'models',
    items: ['LLM tool-calling agents', 'prompt & state design', 'model upgrades as releases', 'ASR / TTS pipelines'],
  },
  {
    label: 'routing',
    items: ['provider fallback', 'cost / latency routing', 'retries & limits', 'per-tenant policy'],
  },
  {
    label: 'knowledge',
    items: ['ingestion & chunking', 'embeddings', 'vector search', 'citations'],
  },
  {
    label: 'evals',
    items: ['scenario harnesses', 'must / must-not assertions', 'silent-green corpus', 'replay & trace analysis'],
  },
  {
    label: 'agentic tooling',
    items: ['MCP servers', 'Claude Code skills', 'code-enforced guardrails', 'diff & blast-radius review'],
  },
  {
    label: 'infra',
    items: ['GCP Cloud Run', 'Terraform', 'BigQuery', 'GPU passthrough at home'],
  },
];

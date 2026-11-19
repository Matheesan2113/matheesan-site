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
    'Tamil-Canadian, born in Toronto, raised in Markham. I build marketplace platforms at WayTrade, mix music after hours, and spend the rest of my time in Elden Ring, Wukong, Mario Kart, Valorant and Overwatch. This is the whole map.',
  status: 'Senior Software Engineer at WayTrade',
  personalStatus: 'currently: marketplace · a new mix · Wukong',
  socials: {
    github: 'https://github.com/Matheesan2113',
    linkedin: 'https://www.linkedin.com/in/matheesanm',
    instagram: 'https://www.instagram.com/matheesan_m',
    spotify: 'https://open.spotify.com/user/22rvhmytriuvutsre3m722uzq',
  },
};

export const now = [
  { value: 'bass', label: 'listening', note: 'global · Tamil · gaming OSTs' },
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
    'I DJ — global bass, Latin club, Tamil and Malayalam, gaming OSTs, whatever the room needs. The same part of my brain that likes a clean API likes a clean transition: read the room, set up the next move, don’t over-explain the drop.',
  crate: [
    {
      key: 'global bass',
      title: 'Global bass',
      body: 'Dancehall, afrobeats and Latin club. Kybba, Sean Paul, Bad Bunny, El Alfa — the low end does the talking.',
      tags: ['dancehall', 'afrobeats', 'Latin club'],
    },
    {
      key: 'Tamil / Malayalam',
      title: 'Tamil / Malayalam',
      body: 'Film, indie and unplugged. Aksomaniac, Sai Abhyankkar, A. R. Rahman, Ilaiyaraaja — the first library I ever had.',
      tags: ['Tamil film', 'Malayalam', 'unplugged'],
    },
    {
      key: 'gaming',
      title: 'Gaming OSTs',
      body: 'Squid Game, boss-fight percussion, racing energy. The playlist literally has a “Games” folder with 48 tracks in it.',
      tags: ['OSTs', 'boss fights', 'racing'],
    },
    {
      key: 'lock-in',
      title: 'Lock-in',
      body: 'The focus rotation: Sean Paul, Akon, Billie Eilish, Daddy Yankee. Familiar enough to disappear into, loud enough to keep the cursor moving.',
      tags: ['focus', 'hip-hop', 'pop'],
    },
    {
      key: 'after hours',
      title: 'After hours',
      body: 'Ambient, dub techno and late-night Tamil. For the drive home and the thoughts that arrive with it.',
      tags: ['ambient', 'dub techno', 'late night'],
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
    url: 'https://open.spotify.com/user/22rvhmytriuvutsre3m722uzq',
    profile: 'Matheesan Manokaran',
    publicPlaylists: 47,
    playlists: [
      { title: 'Lock In 2025', note: '8 tracks · focus mode', url: 'https://open.spotify.com/playlist/12V6JHuA6suAygcmkzSVKB' },
      { title: 'Games', note: '48 tracks · boss fights & racing', url: 'https://open.spotify.com/playlist/2spbr821bl0V8wV5k42gx6' },
      { title: 'Mixxx', note: '22 tracks · global bass / dancehall', url: 'https://open.spotify.com/playlist/7jXQ0WwqIc7cj6ErLcYFUX' },
      { title: 'LumiereNew1', note: '101 tracks · the long library', url: 'https://open.spotify.com/playlist/6x9MRizxBcPUCQjgI3GA2g' },
    ],
  },
};

export type Channel = {
  id: string;
  num: string;
  title: string;
  jp: string;
  ta?: string;
  tagline: string;
  href: string;
  accent: string;
  meta: string;
};

export const channels: Channel[] = [
  {
    id: 'music',
    num: '01',
    title: 'music',
    jp: '音',
    tagline: 'global bass · Tamil · gaming OSTs',
    href: '/music/',
    accent: '#ff4fd8',
    meta: '47 public playlists',
  },
  {
    id: 'games',
    num: '02',
    title: 'games',
    jp: '遊',
    tagline: 'Elden Ring · Wukong · Mario Kart',
    href: '/games/',
    accent: '#a8ff60',
    meta: '5 in rotation',
  },
  {
    id: 'lab',
    num: '03',
    title: 'lab',
    jp: '実',
    tagline: 'agent loops · evals · homelab',
    href: '/lab/',
    accent: '#4fffd0',
    meta: 'models / metal',
  },
  {
    id: 'notes',
    num: '04',
    title: 'notes',
    jp: '記',
    tagline: 'field notes from the loop',
    href: '/notes/',
    accent: '#ffb86b',
    meta: '3 transmissions',
  },
  {
    id: 'about',
    num: '05',
    title: 'about',
    jp: '月',
    ta: 'மதி',
    tagline: 'Tamil · moon · dragon · waves',
    href: '/about/',
    accent: '#82a9d6',
    meta: 'the longer version',
  },
  {
    id: 'career',
    num: '06',
    title: 'career',
    jp: '職',
    tagline: 'agentic workbench · WayTrade',
    href: '/career/',
    accent: '#7fb2ff',
    meta: 'marketplace · case files',
  },
];

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
  url?: string;
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
    company: 'WayTrade',
    url: 'https://www.way.trade/',
    role: 'Senior Software Engineer',
    period: 'Nov 2026 — Present',
    place: 'Remote',
    summary:
      'Senior software engineer on a small team building WayTrade’s AI-powered marketplace for biofuels, feedstocks and critical materials — the commercial, operational and compliance work behind a physical trade.',
    highlights: [
      'Building the marketplace platform end to end: trade records, offers, logistics, inventory, documents and finance in one system.',
      'Working across the full trade lifecycle, where a delivery change cascades into inventory, production, cash and compliance.',
      'Applying AI where it removes friction — matching supply and demand, surfacing exceptions and recommending the next action — with the trade record as the source of truth.',
    ],
    stack: ['marketplace platforms', 'product engineering', 'AI workflows', 'trade operations', 'compliance'],
  },
  {
    company: 'Replicant',
    role: 'Senior Software Engineer',
    period: 'Oct 2021 — Oct 2026',
    place: 'Remote · Toronto',
    summary:
      'Forward-deployed AI engineer: enterprise LLM voice agents, model routing, knowledge/RAG layers, evals and agentic tooling — from API review through launch and hypercare.',
    highlights: [
      'Designed and built the org-wide agentic workbench solo: one engine connecting multiple data silos and workstreams through plugins and MCPs, with DeepSeek/Claude-powered overnight planning, scoping, building and JIRA organization behind gates.',
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
  { value: '2026', label: 'marketplace platform', note: 'WayTrade · biofuel' },
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
  featured?: boolean;
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
    id: 'agentic-workbench',
    number: '00',
    featured: true,
    title: 'The agentic workbench',
    deck: 'At Replicant: one engine for the whole org — data silos, plugins, MCPs and gated LLM work, built solo.',
    metrics: ['solo build', 'org-wide', 'overnight loops'],
    tags: ['agentic tooling', 'MCP', 'plugins', 'DeepSeek', 'Claude', 'JIRA', 'gates'],
    problem:
      'Engineers were working across disconnected data silos and separate streams of work. AI was useful per task, but there was no shared operating layer that could plan, scope, build and organize the work across those systems — and nothing could safely run overnight.',
    approach:
      'Designed and built a single agentic engine from scratch: a plugin layer and MCP connections for multiple data silos and workstreams, a common work graph, and LLM adapters for DeepSeek and Claude. Wrapped it in my own harnesses and a gated loop: plan, scope, build, organize JIRA, verify, request approval, then continue. It could run overnight without turning a plausible output into a silent change.',
    hard:
      'Unattended agents are a trust problem, not a prompt problem. Every action needed permissions, durable state, idempotency, an audit trail and a gate that could stop it. The engine had to stay legible when it was moving across systems, and it had to fail closed when a dependency or a model response was wrong.',
    result:
      'Gave engineers across the org one engine to organize multiple data silos and streams of work. Work that used to be scattered across tools — planning, scoping, building and JIRA organization — could be handed to an overnight loop and reviewed in the morning behind gates. It leveled up how the org used AI, not just how one team shipped.',
    differently:
      'I would productize the gate and audit surface first. The engine was only as useful as a person’s ability to see what it did, trust it and stop it.',
  },
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
  'A trace-to-fix workbench that turns failing production traces into reviewed draft fixes — with push / merge / deploy refused in code before a model is asked.',
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

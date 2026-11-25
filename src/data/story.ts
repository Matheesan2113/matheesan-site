// The narrative layer for the homepage and About.
// Short version first, longer version behind a deliberate click. Every quote here is
// attributed with its source; paraphrases are marked as such rather than dressed up as quotes.

export const intro = {
  positioning: 'Engineer by day. DJ by night. Gamer in between.',
  lead:
    'Software engineer in Pickering, Ontario. I build the marketplace layer at WayTrade, mix basshall and South Indian records after dark, and lose to the same boss with great consistency.',
};

export type StoryChapter = {
  id: string;
  num: string;
  label: string;
  title: string;
  lead: string[];
  deeper?: { label: string; body: string[] };
  link?: { label: string; href: string };
  quoteKey?: string;
  image?: { src: string; alt: string; caption?: string };
};

export const chapters: StoryChapter[] = [
  {
    id: 'name',
    num: '01',
    label: 'the name',
    title: 'Moon, dragon, wave.',
    lead: [
      'My name means moon in Tamil — mathee, மதி. I was born in Toronto, grew up in Scarborough, was raised in Markham, and live in Pickering now. My parents came from Sri Lanka; Tamil was my first language, English and French came after.',
    ],
    deeper: {
      label: 'the symbols',
      body: [
        'My son was born in the year of the dragon and named after Varuna, the Hindu lord of storms and waves. I spent my teens as a lifeguard and have stayed close to water ever since.',
        'The symbols chose us as much as we chose them. Moon, dragon, wave — it is a strange inheritance to explain on a website, and it is the truest one I have.',
      ],
    },
    link: { label: 'the longer version', href: '/about/#roots' },
    quoteKey: 'eliot',
  },
  {
    id: 'work',
    num: '02',
    label: 'the work',
    title: 'Making the invisible testable.',
    lead: [
      'I am a senior software engineer at WayTrade, where a small team is building the marketplace layer for biofuels, feedstocks and critical materials — one record for the commercial, operational and compliance work behind a physical trade. A late railcar shows up in inventory, production, cash and paperwork at the same moment.',
    ],
    deeper: {
      label: 'before WayTrade',
      body: [
        'Five years at Replicant, building enterprise voice agents and the platform underneath them: provider routing, retrieval, evals, guardrails. The work I care about is not replacing judgment. It is making judgment legible, testable and safe enough to automate.',
        'My favourite project is the one where the prototype lost. A cheaper platform missed its latency target, and saying so was the answer the team actually needed.',
      ],
    },
    link: { label: 'read the case files', href: '/career/' },
    quoteKey: 'dijkstra',
  },
  {
    id: 'booth',
    num: '03',
    label: 'the booth',
    title: 'Read the room, not the waveform.',
    lead: [
      'I DJ basshall and dancehall, South Indian film and indie, R&B, and whatever the room needs. A clean API and a clean transition scratch the same itch: read the room, set up the next move, do not over-explain the drop.',
    ],
    deeper: {
      label: 'what is in the crate',
      body: [
        'Basshall for the low end, Ilaiyaraaja and A. R. Rahman for melody, a 2000s R&B run for the drive home. Forty-seven public playlists and not one of them autoplays.',
        'The set is never finished. That is the point.',
      ],
    },
    link: { label: 'step into the booth', href: '/music/' },
    quoteKey: 'ellington',
    image: {
      src: '/images/turntable-1600.webp',
      alt: 'A close-up of a turntable needle resting in the grooves of a spinning record, washed in red light.',
      caption: 'the booth / 33⅓ rpm',
    },
  },
  {
    id: 'battlefield',
    num: '04',
    label: 'the battlefield',
    title: 'Still climbing the mountain.',
    lead: [
      'Elden Ring is the benchmark, Wukong is the current wall, Mario Kart is the comfort game. Not ranked — just the rotation. I like games where losing is instructive and the next attempt is compulsory.',
    ],
    deeper: {
      label: 'the rest of the rotation',
      body: [
        'Valorant is aim training and comms practice. Overwatch is the team fight. The first Tree Sentinel humbled me and the world kept me.',
        'I keep coming back for the feeling of finding something that was always there.',
      ],
    },
    link: { label: 'see the rotation', href: '/games/' },
    quoteKey: 'musashi',
  },
  {
    id: 'beliefs',
    num: '05',
    label: 'what I believe',
    title: 'Optimistic about AI. Specific about it.',
    lead: [
      'I am a software engineer first. The tooling is a multiplier, not a substitute for the craft. The interesting part is not the demo — it is the gap between “the tests are green” and “it works on a real call”.',
    ],
    deeper: {
      label: 'the longer argument',
      body: [
        'Deterministic where correctness matters; generative where judgment helps. Model and prompt upgrades are releases with regression evals, not config changes. A suite that never ran looks exactly like a suite that passed.',
        'These are the things I keep re-learning, usually the hard way. I wrote them down so the next version of me has less to rediscover.',
      ],
    },
    link: { label: 'how I think, at length', href: '/about/#thinking' },
    quoteKey: 'feynman',
  },
];

export type Belief = { key: string; body: string };

export const thinking = {
  deck: 'Three paragraphs and four convictions. The longer version is still being written.',
  essay: [
    'I am optimistic about AI in the way I am optimistic about electricity: the interesting question is not whether it works, but what it makes cheap — and what it makes cheap to get wrong.',
    'My instinct is always to make judgment visible. Write the decision down, build the test that could contradict it, and leave a trail for whoever inherits the system. A model that is right for reasons nobody can inspect is not a shortcut. It is a debt.',
    'The rest is a handful of convictions I keep testing, usually by getting them wrong first.',
  ],
  link: { label: 'the evidence, in the notes', href: '/notes/' },
};

export const beliefs: Belief[] = [
  {
    key: 'numbers over adjectives',
    body: 'If it cannot be measured, it is a hypothesis. Every claim worth making has a number or a reproduction behind it.',
  },
  {
    key: 'deterministic where it counts',
    body: 'LLMs where judgment helps. Code, constraints and test oracles where correctness matters.',
  },
  {
    key: 'absence has to be loud',
    body: '“0 collected” is not “0 failed”. A suite that never ran looks exactly like a suite that passed.',
  },
  {
    key: 'be wrong in writing',
    body: 'Retract fast, fix faster, log the correction. The correction log is part of the work.',
  },
];

export type MarginQuote = {
  key: string;
  lines: string[];
  author: string;
  work: string;
  note: string;
};

export const quotes: MarginQuote[] = [
  {
    key: 'saint-exupery',
    lines: [
      'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
    ],
    author: 'Antoine de Saint-Exupéry',
    work: 'Terre des hommes, 1939',
    note: 'I keep this next to every design review I run. The hard version of simple is the one that ships.',
  },
  {
    key: 'feynman',
    lines: ['The first principle is that you must not fool yourself — and you are the easiest person to fool.'],
    author: 'Richard Feynman',
    work: 'Cargo Cult Science, 1974',
    note: 'Why “0 collected” has to be impossible to ignore. The test that never ran is the one that looks most like a pass.',
  },
  {
    key: 'hokusai',
    lines: [
      'At seventy-three I have at last somewhat grasped the structure of birds, animals, insects and fish.',
    ],
    author: 'Katsushika Hokusai',
    work: 'postscript to One Hundred Views of Mount Fuji, 1834 (translation varies)',
    note: 'A reminder that mastery runs longer than ambition. I am early, and that is fine.',
  },
  {
    key: 'musashi',
    lines: ['Do not regret what you have done.'],
    author: 'Miyamoto Musashi',
    work: 'Dokkōdō, 1645',
    note: 'Ship it, write the postmortem, keep the lesson, drop the regret.',
  },
  {
    key: 'cohen',
    lines: ['There is a crack in everything. That’s how the light gets in.'],
    author: 'Leonard Cohen',
    work: 'Anthem, 1992',
    note: 'The failures are the documentation. A correction log is more useful than a highlight reel.',
  },
  {
    key: 'eliot',
    lines: [
      'We shall not cease from exploration',
      'And the end of all our exploring',
      'Will be to arrive where we started',
      'And know the place for the first time.',
    ],
    author: 'T. S. Eliot',
    work: 'Little Gidding, 1942',
    note: 'Scarborough to Pickering, and the same questions waiting at the end.',
  },
  {
    key: 'dijkstra',
    lines: ['Simplicity is prerequisite for reliability.'],
    author: 'Edsger W. Dijkstra',
    work: 'EWD498, 1975',
    note: 'The sentence I hold architecture against. If I cannot explain the failure modes, it is not simple yet.',
  },
  {
    key: 'ellington',
    lines: ['If it sounds good, it is good.'],
    author: 'Duke Ellington',
    work: 'attributed',
    note: 'The booth version of “if it works, it works”. Taste is a test with a longer feedback loop.',
  },
  {
    key: 'heracleitus',
    lines: ['No one steps in the same river twice.'],
    author: 'Heraclitus',
    work: 'after the fragments, c. 500 BCE',
    note: 'The wave motif, and a useful reminder about people — including me.',
  },
  {
    key: 'lee',
    lines: ['Be formless, shapeless, like water. Water can flow, or it can crash.'],
    author: 'Bruce Lee',
    work: 'The Pierre Berton Show, 1971',
    note: 'Adapt to the room. The set, the system, the team — same instruction.',
  },
  {
    key: 'box',
    lines: ['All models are wrong, but some are useful.'],
    author: 'George E. P. Box',
    work: 'attributed',
    note: 'The line that turns evals from a chore into the actual job.',
  },
  {
    key: 'hamming',
    lines: ['The purpose of computing is insight, not numbers.'],
    author: 'Richard Hamming',
    work: 'Numerical Methods for Scientists and Engineers, 1962',
    note: 'A dashboard is not a finding. The number is only useful if it changes what I understand.',
  },
  {
    key: 'baldwin',
    lines: ['Not everything that is faced can be changed; but nothing can be changed until it is faced.'],
    author: 'James Baldwin',
    work: 'As Much Truth As One Can Bear, 1962',
    note: 'Written for a different struggle, and true for the smaller ones too — including the bug you do not want to reproduce.',
  },
];

export type Influence = { name: string; line: string };

export const influences: Influence[] = [
  {
    name: 'Richard Feynman',
    line: 'Curiosity as a working method, and honesty as the price of it. Cargo Cult Science is still the best review checklist I know.',
  },
  {
    name: 'Richard Hamming',
    line: '“You and Your Research” — work on important problems, keep the door open, and expect the answer to take longer than the question.',
  },
  {
    name: 'Katsushika Hokusai',
    line: 'Thirty-six Views of Mount Fuji, and the pleasure of doing the same thing slightly better for forty years.',
  },
  {
    name: 'Miyamoto Musashi',
    line: 'Dokkōdō: twenty-one lines on practice, detachment and the next cut. Short enough to reread when I am avoiding something.',
  },
  {
    name: 'Ilaiyaraaja and A. R. Rahman',
    line: 'Melody as structure. The first music I knew, and still the standard I measure a set against.',
  },
  {
    name: 'Ursula K. Le Guin',
    line: 'The Left Hand of Darkness. The only thing that makes life possible is permanent, intolerable uncertainty: not knowing what comes next.',
  },
  {
    name: 'Annie Duke',
    line: 'Thinking in Bets: separate the quality of the decision from the quality of the outcome. Good days are not evidence.',
  },
  {
    name: 'Toni Morrison',
    line: 'If the book you want to read has not been written, write it. It is the same instruction for software.',
  },
];

// Every piece of text on the site lives here. Components only lay it out.
// To update the site's words, links or numbers, edit this file.
// Anything in [SQUARE BRACKETS] still needs your real value.

export const profile = {
  name: { first: 'BISHAL', last: 'MANDI' },
  handle: 'JIRORAIDEN',
  tagline: 'WELCOME TO THE CITY',
  blurb:
    'I build learning machines and the systems that keep them honest: fraud engines, booking platforms that never double-sell, and retrieval that knows when to call a human.',
  school: 'IIEST SHIBPUR · B.TECH IT',
  links: {
    github: 'https://github.com/JiroRaiden',
    resume: '[RESUME PDF LINK]',
    leetcode: 'https://leetcode.com/u/_Jiro_/',
    linkedin: 'https://www.linkedin.com/in/bishal-mandi-667287393/',
    // Your email, scrambled so bots scanning the site can't read it.
    // Make the code with:  npm run email -- you@example.com   (then paste it here)
    emailCode: 'bW9jLmxpYW1nQDgwMS5pZG5hbS5sYWhzaWI=',
  },
};

export const chapters = [
  { id: 'origin', num: '01', label: 'ORIGIN' },
  { id: 'works', num: '02', label: 'WORKS' },
  { id: 'arsenal', num: '03', label: 'ARSENAL' },
  { id: 'trials', num: '04', label: 'TRIALS' },
  { id: 'contact', num: '05', label: 'CONTACT ME' },
] as const;

export type ChapterId = (typeof chapters)[number]['id'];

export type Project = {
  num: string;
  title: string;
  tag: string;           // one-word category shown on cards
  kind: string;          // longer category line
  tagline: string;
  summary: string;       // one line for the landing page cards
  problem: string;
  built: string;
  hard: string;
  stack: string[];
  accent: string;
  link: { href: string; label: string };
  featured: boolean;     // shown on the landing page
};

export const projects: Project[] = [
  {
    num: '01',
    title: 'Fraud Review Dashboard',
    tag: 'RISK',
    kind: 'FULL-STACK · ML',
    tagline: 'Hunting anomalies in data',
    summary: 'Rule signals + Isolation Forest, scored into approve, review or block',
    problem: 'Rule-only checks miss odd behaviour, and a pure ML score is hard for a reviewer to trust.',
    built: 'A scoring engine that blends five rule signals, a per-user anomaly score and an Isolation Forest model into approve, review or block.',
    hard: 'Keeping every verdict auditable: assessments live apart from transactions, so old decisions survive rule changes.',
    stack: ['NODE', 'EXPRESS', 'POSTGRES', 'PRISMA', 'REACT', 'FLASK', 'DOCKER'],
    accent: '#ff4fa0',
    link: { href: 'https://github.com/JiroRaiden/Distributed-Payment-Authorization-and-Risk-Detection', label: 'GITHUB' },
    featured: true,
  },
  {
    num: '02',
    title: 'SeatLock',
    tag: 'CONCURRENCY',
    kind: 'BACKEND · CONCURRENCY',
    tagline: 'No seat sold twice',
    summary: 'Redis holds, optimistic locks and a unique index: no seat sold twice',
    problem: 'When two people grab the same seat at the same moment, naive booking code sells it twice.',
    built: 'A ticketing backend in Spring Boot, PostgreSQL and Redis with a React seat map, built so one seat can never be sold twice.',
    hard: 'Three independent guards: an atomic Redis hold with a timeout, an optimistic lock on the seat row, and a database unique index as the last line. A test fires 50 simultaneous requests at one seat; exactly one wins.',
    stack: ['SPRING BOOT', 'POSTGRES', 'REDIS', 'REACT', 'TYPESCRIPT', 'TESTCONTAINERS'],
    accent: '#3ee6d8',
    link: { href: 'https://github.com/JiroRaiden/SeatLock-Concurrent-Seat-Booking-System', label: 'GITHUB' },
    featured: true,
  },
  {
    num: '03',
    title: 'TriageDesk',
    tag: 'RETRIEVAL',
    kind: 'ML · RETRIEVAL',
    tagline: 'Knows when to ask a human',
    summary: 'Ticket triage with embeddings, escalates when unsure',
    problem: 'Support queues fill up with tickets that have already been solved before.',
    built: 'Sorts tickets into 10 queues with a priority, finds similar solved tickets with embeddings, then suggests a fix or escalates.',
    hard: 'A confidence-gated decision engine: separate thresholds for the classifier and retrieval, each decision stored with its reason.',
    stack: ['REACT', 'NODE', 'PRISMA', 'FASTAPI', 'SCIKIT-LEARN', 'PGVECTOR', 'DOCKER'],
    accent: '#ffd9b0',
    link: { href: '[TRIAGEDESK REPO]', label: 'GITHUB' },
    featured: true,
  },
  {
    num: '04',
    title: '8085 Lab',
    tag: 'EMULATOR',
    kind: 'SYSTEMS · EMULATION',
    tagline: 'A microprocessor in the browser',
    summary: 'Lab-bench simulator and trainer-kit emulator for the 8085',
    problem: 'Practising 8085 programs meant waiting for a turn on the lab trainer kit.',
    built: 'An 8085 assembler, CPU emulator and trainer-kit simulator that run entirely in the browser, with 15 lab assignments graded automatically against the expected registers and memory.',
    hard: 'Emulating the trainer-kit workflow closely enough that practice here carries over to the real kit.',
    stack: ['LIVE ON VERCEL', 'OPEN SOURCE'],
    accent: '#7ee0b0',
    link: { href: 'https://8085-microprocessor-iiest.vercel.app/', label: 'TRY IT LIVE' },
    featured: false,
  },
  {
    num: '05',
    title: 'GoQueue',
    tag: 'QUEUES',
    kind: 'BACKEND · DISTRIBUTED',
    tagline: 'Jobs that never go missing',
    summary: 'Celery-style task queue in Go + Redis with retries and a dead-letter queue',
    problem: 'A naive job queue loses work when a worker crashes mid-job, and a repeated request enqueues the same job twice.',
    built: 'A Redis-backed task queue in Go: named queues, a concurrent worker pool, retries with jittered backoff, a dead-letter queue, idempotent enqueues and a live React dashboard.',
    hard: 'Making every job move atomic: Lua scripts shift a job between lists and update its record in one step, so a crash can never drop it, and a recovery loop requeues jobs left behind by dead workers.',
    stack: ['GO', 'REDIS', 'LUA', 'REACT', 'TYPESCRIPT', 'DOCKER', 'PROMETHEUS'],
    accent: '#b69cff',
    link: { href: 'https://github.com/JiroRaiden/GoQueue', label: 'GITHUB' },
    featured: false,
  },
  {
    num: '06',
    title: 'PQ-DNSSEC Lab',
    tag: 'SECURITY',
    kind: 'SECURITY · CRYPTOGRAPHY',
    tagline: 'DNS ready for quantum computers',
    summary: 'Hybrid classical + post-quantum DNSSEC chain of trust, all in Docker',
    problem: 'DNSSEC signatures rely on RSA and elliptic curves, which a large enough quantum computer could break.',
    built: 'A full DNS hierarchy (root → lab. → example.lab.) in Docker with BIND9 and a validating resolver, plus a sidecar that adds a second chain of ML-DSA-65 post-quantum signatures.',
    hard: 'A hybrid verdict: an answer only counts if both the classical and the post-quantum chains validate, with tamper tests proving forged signatures are rejected.',
    stack: ['DOCKER', 'BIND9', 'PYTHON', 'LIBOQS', 'ML-DSA-65'],
    accent: '#ff9a62',
    link: { href: 'https://github.com/JiroRaiden/PQ-DNSSEC-Architecture', label: 'GITHUB' },
    featured: false,
  },
];

// ---------- Arsenal (skills) ----------
// Each skill lists the projects that prove it, by project number.
// `icon` / `icon2` are file names in src/assets/icons (without .svg); leave empty for no logo.

export const skillCategories = {
  LANGUAGES: '#ff4fa0',
  BACKEND: '#3ee6d8',
  DATA: '#ffd9b0',
  ML: '#7ee0b0',
  FRONTEND: '#b69cff',
  CLOUD: '#ff9a62',
  TESTING: '#c9c7c3',
} as const;

export type SkillCategory = keyof typeof skillCategories;

export type Skill = {
  name: string;
  short: string;          // shown when there's no logo
  category: SkillCategory;
  usedFor: string;
  provenIn: string[];     // project numbers, e.g. ['01', '03']
  icon?: string;
  icon2?: string;
};

export const skills: Skill[] = [
  { name: 'Python', short: 'PY', category: 'LANGUAGES', usedFor: 'ML services, model training, and the post-quantum signer.', provenIn: ['01', '03', '06'], icon: 'python' },
  { name: 'TypeScript', short: 'TS', category: 'LANGUAGES', usedFor: 'Typed APIs and React front ends.', provenIn: ['02', '03', '05'], icon: 'typescript' },
  { name: 'JavaScript', short: 'JS', category: 'LANGUAGES', usedFor: 'Node APIs and the review dashboard.', provenIn: ['01'], icon: 'javascript' },
  { name: 'Go', short: 'GO', category: 'LANGUAGES', usedFor: 'A task queue with a concurrent worker pool and middleware chain.', provenIn: ['05'], icon: 'go' },
  { name: 'Java', short: 'JV', category: 'LANGUAGES', usedFor: 'The Spring Boot booking service.', provenIn: ['02'], icon: 'java' },
  { name: 'SQL', short: 'SQL', category: 'DATA', usedFor: 'Normalised schemas, queries and audit trails.', provenIn: ['01', '02', '03'] },
  { name: 'Node + Express', short: 'NX', category: 'BACKEND', usedFor: 'REST APIs with schema validation, API-key auth and rate limits.', provenIn: ['01', '03'], icon: 'nodejs', icon2: 'express' },
  { name: 'Spring Boot', short: 'SB', category: 'BACKEND', usedFor: 'A booking service built to stay correct under concurrent requests.', provenIn: ['02'], icon: 'springboot' },
  { name: 'FastAPI', short: 'FA', category: 'BACKEND', usedFor: 'The ML inference service behind ticket triage.', provenIn: ['03'], icon: 'fastapi' },
  { name: 'Flask', short: 'FL', category: 'BACKEND', usedFor: 'The ML scoring microservice for fraud signals.', provenIn: ['01'], icon: 'flask' },
  { name: 'Prisma', short: 'PR', category: 'DATA', usedFor: 'ORM, migrations and an in-memory fake for tests.', provenIn: ['01', '03'], icon: 'prisma' },
  { name: 'PostgreSQL', short: 'PG', category: 'DATA', usedFor: 'The main database in every full-stack build.', provenIn: ['01', '02', '03'], icon: 'postgresql' },
  { name: 'pgvector', short: 'VEC', category: 'DATA', usedFor: 'Similarity search over ticket embeddings with an HNSW index.', provenIn: ['03'] },
  { name: 'Redis', short: 'RD', category: 'DATA', usedFor: 'Atomic Lua scripts: seat holds that expire on their own, and job moves that can never drop a job.', provenIn: ['02', '05'], icon: 'redis' },
  { name: 'scikit-learn', short: 'SK', category: 'ML', usedFor: 'Isolation Forest for anomalies; TF-IDF with a calibrated LinearSVC for classification.', provenIn: ['01', '03'], icon: 'scikitlearn' },
  { name: 'Embeddings', short: 'EMB', category: 'ML', usedFor: 'sentence-transformers for finding similar solved tickets.', provenIn: ['03'], icon: 'huggingface' },
  { name: 'React', short: 'RE', category: 'FRONTEND', usedFor: 'Dashboards, booking screens and the triage UI.', provenIn: ['01', '02', '03', '05'], icon: 'react' },
  { name: 'Docker', short: 'DK', category: 'CLOUD', usedFor: 'Multi-service stacks that start with one command, up to a five-server DNS lab.', provenIn: ['01', '02', '03', '05', '06'], icon: 'docker' },
  { name: 'GitHub Actions', short: 'CI', category: 'CLOUD', usedFor: 'Tests and image builds run automatically on every push.', provenIn: ['02', '03', '05'], icon: 'githubactions' },
  { name: 'Vitest + pytest', short: 'TST', category: 'TESTING', usedFor: 'Test suites that run with no database, model files or network.', provenIn: ['01', '03'], icon: 'vitest', icon2: 'pytest' },
];

export const badges = [
  { title: 'Intro to AI & ML with Python', issuer: 'CDAC Kolkata', year: '2025' },
];

// ---------- Trials ----------
// LeetCode numbers are typed in by hand (update `asOf` when you change them).
// The free LeetCode APIs are unofficial and often down, so the site doesn't fetch live.

export const leetcode = {
  asOf: 'SEP 2026',
  solved: { easy: 100, medium: 185, hard: 52 },
  rating: 1645,
  topPercent: 19,
  contests: 8,
};

export type Trial = {
  when: string;
  title: string;
  detail: string;
  state: 'locked' | 'now' | 'done';
  projects?: string[];    // project numbers; shown as buttons that open them in Works
};

// Newest first.
export const trials: Trial[] = [
  { when: 'NEXT', title: 'Software engineering internship', detail: 'Summer 2027. Not unlocked yet.', state: 'locked' },
  { when: 'NOW', title: 'B.Tech in Information Technology', detail: 'Year 2 at IIEST Shibpur.', state: 'now' },
  { when: '2026', title: 'Six builds shipped', detail: 'Fraud scoring, race-proof booking, ticket triage, an 8085 emulator, a Go task queue and a post-quantum DNS lab.', state: 'done', projects: ['01', '02', '03', '04', '05', '06'] },
  { when: '2025', title: 'Intro to AI & ML with Python', detail: '72-hour certificate course at CDAC Kolkata.', state: 'done' },
];

// ---------- Contact Me ----------
export const contact = {
  blurb: 'Open to software engineering internships and good problems to solve. Building something interesting? Say hello.',
  // How the message form sends:
  //  - formspreeId set ('xyzabcd' from https://formspree.io/f/xyzabcd): posts straight to Formspree.
  //  - otherwise, if profile.links.emailCode is set: opens the visitor's email app with the message filled in.
  //  - neither: the form is shown but switched off.
  formspreeId: '',
};

// The intro: "Welcome" in these languages, then English.
export const welcomes: [word: string, language: string][] = [
  ['স্বাগতম', 'BENGALI'],
  ['स्वागत है', 'HINDI'],
  ['ようこそ', 'JAPANESE'],
  ['환영합니다', 'KOREAN'],
  ['欢迎', 'CHINESE'],
  ['Bienvenue', 'FRENCH'],
  ['Willkommen', 'GERMAN'],
  ['Bienvenido', 'SPANISH'],
  ['WELCOME', 'ENGLISH'],
];

// True if a link is still a placeholder like "[YOUR EMAIL]".
export const isPlaceholder = (href: string) => href.startsWith('[');

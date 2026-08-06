export interface ProjectMetric {
  /** The number itself. Keep it short: it is set in a large display face. */
  value: string;
  /** What the number counts. */
  label: string;
}

export interface Project {
  slug: string;
  no: string;
  title: string;
  tags: string[];
  /** Short one-liner shown on the home Projects list. */
  desc: string;
  /** Longer narrative shown on the demo page. */
  overview: string[];
  /** Why the project matters / the problem it solves. */
  importance: string[];
  /** Path to a demo video in /public. Omit until recorded. */
  video?: string;
  /** Poster frame shown before playback and as the home-card thumbnail. */
  poster?: string;
  /** Human-readable demo length, e.g. "24s demo". */
  videoLength?: string;
  /** Build window, e.g. "Jul 2026". Taken from real repo history. */
  date: string;
  /** Maintenance status shown next to the date. */
  status: string;
  /**
   * Scope and role, answering "did he actually build this". Describes what was
   * owned, not how fast it was done: a duration invites "rushed" and the depth
   * metrics answer the authorship question better than a stopwatch does.
   */
  scope: string;
  /**
   * Hard numbers. Every value must be checkable in the repo (test counts,
   * coverage, rule counts, LOC) — never estimated or aspirational.
   */
  metrics: ProjectMetric[];
  /**
   * In-flight work, dated. Signals the project is a live line of work rather
   * than a finished artifact, and names the skills being added before a
   * reviewer notices they are missing from the stack list.
   */
  building?: { since: string; body: string };
  /** Skimmable pipeline: what flows through the system, in order. */
  architecture: { caption: string; nodes: { label: string; sub: string }[] };
  stack: string;
  /** Public repo URL. Omit until the repo is published — never link a 404. */
  github?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'finops-sentinel',
    no: '✦',
    title: 'FinOps Sentinel',
    tags: ['Python', 'AWS', 'Hexagonal Architecture', 'Slack'],
    desc: 'An autonomous AWS cost agent that scans for wasted spend, prices it, explains it, and deletes it, but only after a human approves in Slack.',
    date: 'Jul 2026',
    status: 'Actively maintained',
    scope: 'Solo build, domain design through deployment',
    metrics: [
      { value: '9', label: 'detection rules' },
      { value: '8', label: 'scanners per region' },
      { value: '96%', label: 'test coverage' },
      { value: '294', label: 'tests' },
      { value: '6.4k', label: 'lines of source' },
      { value: '0', label: 'deletions without approval' },
    ],
    building: {
      since: 'August 2026',
      body: 'Currently packaging the agent for real deployment: Terraform modules for the IAM roles, scan schedule, and Slack webhook secrets, and a Kubernetes deployment splitting the scanner into a CronJob and the approval API into a long-running Deployment. The goal is an account owner running one apply instead of following a setup document.',
    },
    architecture: {
      caption: 'Detection is automatic. Deletion requires a named human.',
      nodes: [
        { label: 'Scan', sub: 'boto3, per region' },
        { label: 'Price', sub: 'monthly USD' },
        { label: 'Explain', sub: 'local LLM' },
        { label: 'Approve', sub: 'Slack Block Kit' },
        { label: 'Snapshot', sub: 'recovery path' },
        { label: 'Delete', sub: 'audited' },
      ],
    },
    overview: [
      'FinOps Sentinel is an event-driven AWS cost optimization agent. It scans accounts across regions for wasted spend, prices each finding in real monthly dollars, explains it in plain language, and remediates it, with a human approval step standing between detection and deletion.',
      'Nine detection rules cover the waste that accumulates quietly: unattached EBS volumes, orphaned Elastic IPs, long-stopped EC2 instances, expired snapshots, abandoned multipart uploads, plus advisory-only rules for idle instances, idle and stopped RDS databases, and S3 buckets with no lifecycle policy. Rules that can act do; rules that rely on inference stay advisory and never render an approve button.',
      'Every finding is posted to Slack as an interactive Block Kit message with the evidence, the estimated monthly saving, and the exact action proposed. Approve triggers the remediation playbook, which snapshots an EBS volume before deleting it and records the snapshot ID as the recovery path. Requests are verified against Slack\'s signing secret with a 5-minute replay window, and the domain re-checks every guardrail at click time rather than trusting the state the button was rendered with.',
      'Safety is layered rather than assumed: a `finops:protected=true` tag excludes a resource from notification and remediation entirely, dry-run mode is the default, a state machine makes each finding decidable exactly once regardless of click timing, and undecided findings expire themselves after 72 hours. A local Ollama model writes the human-readable summary but never gates a decision, so an unreachable or misbehaving LLM degrades to a deterministic template instead of blocking the pipeline.',
      'The codebase is built on hexagonal architecture: the domain layer holds the rules, guardrails, and state machine as pure Python with no boto3, no SQLAlchemy, and no Slack SDK, while AWS, SQLite, Slack, and Ollama sit behind ports as interchangeable adapters. The whole approve-and-remediate flow runs end to end in tests against in-memory fakes, which is what keeps 96% coverage meaningful rather than decorative.',
    ],
    importance: [
      'Cloud waste is not an event, it is accumulation. A terminated instance leaves its boot volume behind, still billing. An Elastic IP outlives the migration it was reserved for. A staging database gets stopped rather than deleted, and keeps billing for allocated storage. Each item is individually too small to chase, and together they are the line on the bill nobody can account for.',
      'Detection is the easy half. An unattached volume is one API call from obvious. The hard part is acting on it, because deleting infrastructure in a live account means the cost of one wrong deletion dwarfs months of savings. So tooling splits into dashboards that report waste and leave the work to a human, and automation that acts confidently enough to cause an incident.',
      'FinOps Sentinel takes the third path: automate the tedious 95%, and put a named human on the irreversible 5%. Every deletion is approved by a person, attributed to their Slack handle, preceded by a snapshot, and recorded with the evidence that justified it. That audit trail is a compliance artifact as much as an engineering one.',
    ],
    video: '/gallery/demo-videos/finops-sentinel.mp4',
    poster: '/gallery/demo-posters/finops-sentinel.jpg',
    videoLength: '24s demo',
    stack: 'Python 3.11+ · boto3 · SQLAlchemy · Alembic · FastAPI · Typer · Slack Block Kit · Ollama · pytest (96% coverage) · mypy strict · Ruff',
    github: 'https://github.com/boazleleina/finops-sentinel',
  },
  {
    slug: 'llm-resume-agent',
    no: '✧',
    title: 'LLM Resume Agent',
    tags: ['Python', 'FastAPI', 'Ollama', 'LLM'],
    desc: 'A privacy-preserving resume review agent running fully locally on Ollama. It grades resume-to-job fit and proposes traceable edits, and is structurally prevented from inventing experience.',
    date: 'Apr – Jul 2026',
    status: 'Feature complete, v2 planned',
    scope: 'Solo build, alongside coursework',
    metrics: [
      { value: '40', label: 'tests' },
      { value: '3', label: 'matching layers' },
      { value: '5', label: 'traceability tags' },
      { value: '4', label: 'JD extraction layers' },
      { value: '0', label: 'bytes leaving the machine' },
      { value: '3.5k', label: 'lines of source' },
    ],
    architecture: {
      caption: 'The model reads, judges, and reasons. Everything else is deterministic code that can overrule it.',
      nodes: [
        { label: 'Parse', sub: 'PDF / DOCX' },
        { label: 'Extract', sub: 'canonical JSON' },
        { label: 'Verify', sub: 'verbatim guard' },
        { label: 'Match', sub: 'exact→fuzzy→LLM' },
        { label: 'Grade', sub: 'local Qwen3' },
        { label: 'Trace', sub: 'tagged edits' },
      ],
    },
    overview: [
      'The LLM Resume Agent ingests a resume and a target job description, grades the fit, and proposes phrasing-level edits. It runs entirely locally on Ollama, so a document containing a full name, phone number, home city, employment history, and sometimes visa status never leaves the machine.',
      'The defining constraint is that the agent may reorganize and rephrase what is there, and may not add anything that is not. That is enforced structurally rather than by prompt instruction: the resume is parsed into a canonical Pydantic model where fields are marked VERBATIM or MUTABLE, and a model validator checks every VERBATIM field against the immutable source text after the model has spoken. A hallucinated skill is stripped and logged before any later stage can see it.',
      'Skill matching runs in three layers, cheapest first: exact matching after alias normalization, fuzzy matching with rapidfuzz, then LLM semantic adjudication on only the terms that survived both. The semantic layer must return a verdict for every unmatched term, and each verdict is validated against the input lists, so a match naming a skill the candidate does not have is discarded rather than reported. The layer degrades to fuzzy-only if the model is unavailable, so matching never fails a request.',
      'Grading receives the pre-computed match results with the matched sets explicitly labeled, which narrows the model\'s job to the part that genuinely needs judgment: which gaps matter for this role. Every proposed edit carries one of five traceability tags, and a post-processor overrules the model\'s self-tagging in the direction that fails safe. If you have no quantified outcome for a bullet, the agent is forbidden from inventing one and must ask you to supply it.',
      'A FastAPI backend serves a Streamlit frontend that streams pipeline progress over server-sent events. Job descriptions can be pasted or fetched from a URL, behind an SSRF guard and a streaming 5MB payload cap, with a four-layer HTML extraction pipeline that reconciles JSON-LD, Trafilatura, and a heading walker. A 40-test pytest suite covers the domain heuristics, parser flows, SSRF protections, schema integrity, and the matching guardrails, and most of it runs without a model loaded.',
    ],
    importance: [
      'Applicant tracking systems filter the majority of resumes before a human reads them, so tailoring each application is both necessary and repetitive. It is exactly the kind of task worth automating, and exactly the kind that most automation makes worse.',
      'Ask a capable model to improve a resume and it will hand back a stronger candidate than the one who uploaded it: an invented metric here, a framework never touched there, all fluent and all a liability in an interview that can no longer be passed. A tool that quietly inflates your resume is not saving you work, it is creating a problem you will discover in the room.',
      'Keeping the model local solves the privacy half, and confining it to three narrow jobs solves the honesty half. Everything else, whether a file is safe, whether a term matches, whether a claim has evidence, is deterministic code that runs before or after the model and can overrule it.',
    ],
    video: '/gallery/demo-videos/llm-resume-agent-demo.mp4',
    poster: '/gallery/demo-posters/llm-resume-agent.jpg',
    videoLength: '40s demo',
    stack: 'Python · FastAPI · Streamlit · Pydantic v2 · Ollama (Qwen3 30B-A3B) · pdfplumber · python-docx · trafilatura · BeautifulSoup · rapidfuzz · pytest',
    github: 'https://github.com/boazleleina/resume_agent',
  },
  {
    slug: 'token-usage-tracker',
    no: '✷',
    title: 'Token Usage Tracker',
    tags: ['Python', 'OTLP', 'Observability', 'LLM'],
    desc: 'A local observability tool tracking LLM API spend across Claude Code, Gemini/Antigravity, and custom scripts, with a live dashboard and zero external dependencies.',
    date: 'Jun 2026',
    status: 'Stable, in daily use',
    scope: 'Solo build, standard library only',
    metrics: [
      { value: '0', label: 'external dependencies' },
      { value: '~5s', label: 'capture latency' },
      { value: '3', label: 'telemetry sources' },
      { value: '4', label: 'independent processes' },
      { value: '1.2k', label: 'lines of source' },
      { value: '3', label: 'token buckets priced' },
    ],
    architecture: {
      caption: 'Four processes, one append-only file, no broker between them.',
      nodes: [
        { label: 'Claude Code', sub: 'OTLP push' },
        { label: 'Antigravity', sub: 'local RPC' },
        { label: 'Any script', sub: 'log_usage()' },
        { label: 'JSON-lines log', sub: 'the contract' },
        { label: 'Aggregate', sub: 'sessions, cache split' },
        { label: 'Dashboard', sub: 'vanilla JS' },
      ],
    },
    overview: [
      'Token Usage Tracker answers a question that is surprisingly hard to answer otherwise: where did the tokens go? It captures spend in real time across Claude Code, Gemini via Antigravity, and any custom script, using nothing but the Python standard library.',
      'Claude Code usage arrives by push rather than poll. A local OTLP/HTTP receiver ingests the editor\'s native OpenTelemetry export, logging every prompt within about five seconds with no polling loop and no transcript scraping. The receiver always answers 200, deliberately, because an OTLP exporter treats a non-2xx as failure and starts backing off, and a telemetry sink should never apply backpressure to the workload it is measuring.',
      'Gemini usage is harder, and estimating it from character counts is guesswork dressed as data. Instead the tracker discovers Antigravity\'s local language server by scanning for its process and CSRF token, confirms the pairing with a heartbeat RPC, and pulls exact per-call backend usage: what was actually billed, deduplicated by response ID so a restart never double-counts. Anything else can report through a generic adapter that duck-types Anthropic, OpenAI, and Gemini response shapes and degrades to zeros rather than raising, because a meter must never break the thing it measures.',
      'Cache accounting is where naive trackers go wrong. With prompt caching, a 30,000 token request can be 29,562 tokens of cache reads, billed at roughly a tenth of the fresh input rate. Cache reads and cache writes are kept separate from fresh input on every record, so the difference between a nine-cent estimate and a 1.3-cent reality is visible rather than averaged away.',
      'Everything lands in one append-only JSON-lines file, which is the entire integration contract between four independent processes. A second standard-library server aggregates it into per-model totals, an hourly timeline, and sessions inferred from ten-minute gaps in activity, then serves a single-page vanilla JS dashboard with no build step, no framework, and no bundler.',
    ],
    importance: [
      'LLM spend is opaque and easy to overshoot, especially across several tools and providers with different pricing models and different caching rules. By the time a bill arrives, the sessions that caused it are weeks in the past.',
      'Local telemetry gives immediate visibility into cost per session and per model without shipping prompt contents to a third-party service, which is the trade most observability vendors ask you to make silently.',
      'It is also a demonstration that good observability does not require a heavyweight stack. A push receiver, a cost model that respects caching, an append-only log, and a parser that degrades instead of raising add up to trustworthy visibility in about 1,200 lines with nothing installed.',
    ],
    video: '/gallery/demo-videos/token-tracker-demo.mp4',
    poster: '/gallery/demo-posters/token-tracker.jpg',
    videoLength: '15s demo',
    stack: 'Python 3.10+ · stdlib HTTP servers · OTLP/JSON · local RPC · vanilla JS · zero dependencies',
    github: 'https://github.com/boazleleina/token-tracker',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

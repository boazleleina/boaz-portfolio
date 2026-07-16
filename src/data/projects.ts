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
  /** Path to a demo video in /public (e.g. /demos/resume-agent.mp4). Omit until recorded. */
  video?: string;
  stack: string;
  /** Public repo URL. Omit until the repo is published — never link a 404. */
  github?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'token-usage-tracker',
    no: '✷',
    title: 'Token Usage Tracker',
    tags: ['Python', 'OTLP', 'Observability', 'LLM'],
    desc: 'A local observability tool monitoring LLM API spend across Claude Code, Gemini, and custom integrations — live dashboard, per-model stats, burn-rate ticker, zero external dependencies.',
    overview: [
      'Token Usage Tracker is a local observability tool for LLM API spend across Claude Code, Gemini, and custom integrations.',
      'A lightweight OTLP/HTTP receiver ingests Claude Code\'s native telemetry (api_request events) live — every prompt logged within 5 seconds, no polling. RPC-based ingestion from Antigravity\'s local language server captures exact Gemini token counts, while a generic log_usage() adapter supports Anthropic/OpenAI/Gemini response shapes.',
      'A zero-dependency Python HTTP server serves a single-page dashboard with auto-refreshing charts: per-model totals, gap-based session grouping, an hourly timeline, and USD cost tracking. It separates cache_read/cache_creation tokens from fresh input, so cost estimates reflect Anthropic\'s prompt-caching discounts accurately.',
    ],
    importance: [
      'LLM API spend is opaque and easy to overshoot — especially across multiple tools and providers with different pricing and caching rules.',
      'Real-time, accurate local telemetry gives developers immediate visibility into cost per session and per model, without shipping sensitive prompt data to a third-party service. Built on the standard library alone, it runs anywhere with zero install friction.',
    ],
    video: '/gallery/demo-videos/dashboard_tour.mp4',
    stack: 'Python 3 · stdlib HTTP servers · OTLP/JSON · vanilla JS',
    github: 'https://github.com/boazleleina/token-tracker',
  },
  {
    slug: 'llm-resume-agent',
    no: '✧',
    title: 'LLM Resume Agent',
    tags: ['Python', 'FastAPI', 'Ollama', 'LLM'],
    desc: 'A privacy-preserving resume review agent that runs fully locally with Ollama — grades resume-to-job fit and proposes traceable edits without inventing experience.',
    overview: [
      'The LLM Resume Agent is a privacy-preserving resume review tool that runs entirely locally with Ollama — no resume data ever leaves the machine. It ingests a resume and a target job description, grades the fit, and proposes traceable, phrasing-level edits without fabricating experience.',
      'Under the hood it is an 8-stage agent pipeline with model routing: Qwen3 4B handles structured extraction, while Qwen3 8B handles reasoning-heavy fit analysis. A Streamlit frontend streams results via Server-Sent Events, backed by a 25-test pytest suite covering parsing, SSRF protections, and schema integrity.',
    ],
    importance: [
      'Modern Applicant Tracking Systems (ATS) filter the majority of resumes before a human ever reads them — and resumes are sensitive documents people shouldn\'t have to upload to third-party services to get help with.',
      'By running the full pipeline locally and keeping every suggested edit traceable to real experience, the agent gives candidates structured, honest feedback while keeping their data private.',
    ],
    video: '/gallery/demo-videos/linkedin-video.mp4',
    stack: 'Python · FastAPI · Streamlit · Ollama (Qwen3 4B/8B) · pdfplumber · Pydantic · pytest',
    github: 'https://github.com/boazleleina/resume_agent',
  },
  {
    slug: 'gemma-rag-agent',
    no: '✱',
    title: 'Gemma RAG Agent',
    tags: ['Python', 'RAG', 'Gemma', 'LLM'],
    desc: 'A retrieval-augmented generation pipeline grounding a Gemma LLM on a custom document corpus, combining vector search with prompt construction for source-cited answers.',
    overview: [
      'The Gemma RAG Agent is a retrieval-augmented generation pipeline that grounds a Gemma language model on a custom document corpus. Incoming questions are embedded, matched against a vector index, and the most relevant passages are injected into the prompt context.',
      'This produces answers that are accurate, current, and source-cited — rather than relying on the model\'s parametric memory alone.',
    ],
    importance: [
      'Raw LLMs hallucinate and cannot answer questions about private or recent data they were never trained on.',
      'RAG bridges that gap: by retrieving authoritative passages at query time, the system delivers grounded, verifiable answers — the backbone of trustworthy enterprise AI assistants.',
    ],
    stack: 'Python · Gemma · Vector Search · RAG',
    github: 'https://github.com/boazleleina/gemma-rag-pipeline',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

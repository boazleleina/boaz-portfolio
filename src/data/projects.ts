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
  github: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'llm-resume-agent',
    no: '✧',
    title: 'LLM Resume Agent',
    tags: ['Python', 'NLP', 'LLM', 'API'],
    desc: 'An autonomous agent that reads resumes, compares them against job descriptions, outputs compatibility scores, and suggests semantic updates.',
    overview: [
      'The LLM Resume Agent is an autonomous assistant that ingests a resume, parses a target job description, and produces a structured compatibility report. Rather than naive keyword matching, it reasons over the semantic alignment between a candidate\'s experience and the role\'s requirements.',
      'The agent returns a numerical compatibility score alongside concrete, phrasing-level suggestions — highlighting relevant competencies without fabricating experience.',
    ],
    importance: [
      'Modern Applicant Tracking Systems (ATS) filter the majority of resumes before a human ever reads them. Tailoring a resume per application is tedious and error-prone.',
      'By automating semantic comparison and structured feedback, the agent helps candidates emphasize the exact skills recruiters search for — saving hours per application and improving callback rates.',
    ],
    video: '/gallery/demo-videos/linkedin-video.mp4',
    stack: 'Python · NLP · OpenAI API · Semantic Similarity',
    github: 'https://github.com/boazleleina/resume_agent',
  },
  {
    slug: 'gemma-rag-agent',
    no: '✱',
    title: 'Gemma RAG Agent',
    tags: ['Python', 'RAG', 'Gemma', 'LLM'],
    desc: 'A retrieval-augmented generation pipeline grounding a Gemma LLM on a custom document corpus, combining vector search with prompt construction for accurate, source-cited answers.',
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
  {
    slug: 'token-usage-tracker',
    no: '✷',
    title: 'Token Usage Tracker',
    tags: ['Python', 'OTLP', 'Observability', 'LLM'],
    desc: 'A local observability tool tracking LLM API spend across Claude Code, Gemini/Antigravity, and custom integrations.',
    overview: [
      'Token Usage Tracker is a local observability tool for LLM API spend across Claude Code, Gemini/Antigravity, and custom integrations.',
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
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

import Link from 'next/link';
import { Download, Github, Mail, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { PROJECTS } from '@/data/projects';
import {
  AVAILABILITY,
  EMAIL,
  FOCUS,
  LOCATION,
  NAME,
  PRIMARY_ROLES,
  SITE_URL,
  SOCIALS,
  TARGET_TEAMS,
  TITLE,
} from '@/data/profile';

export const metadata = {
  title: 'Resume',
  description: `Resume of ${NAME}, ${TITLE.toLowerCase()}: Python, FastAPI, Django, PostgreSQL, and AWS. ${AVAILABILITY.full}.`,
  alternates: { canonical: '/resume' },
};

const SKILLS: [string, string][] = [
  ['Languages', 'Python · SQL · TypeScript'],
  ['Backend', 'Django (DRF) · FastAPI · REST APIs · OpenAPI'],
  ['Databases', 'PostgreSQL · pgvector · SQLite · SQLAlchemy · Alembic'],
  ['Cloud & DevOps', 'AWS (EC2, S3, Lambda) · Docker · GitHub Actions'],
  ['AI / LLM', 'OpenAI API · Ollama · agentic pipelines · structured extraction'],
  ['Practices', 'Hexagonal architecture · pytest · mypy strict · observability'],
  ['Certifications', 'AWS Certified Cloud Practitioner'],
];

const EXPERIENCE = [
  {
    role: 'Graduate Researcher (Systems & AI)',
    company: 'William Jessup University',
    location: 'Remote',
    period: '2024 – Present',
    bullets: [
      'Built an MCP server integrating AutoML with Google Gemini and Telegram for automated CSV analysis, classification, and metric reporting.',
      'Research focus on intelligent software agents and service architecture.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Appstec America',
    location: 'Remote',
    period: 'Jan 2024 – Sep 2024',
    bullets: [
      'Reduced p95 API latency from 520ms to 310ms (40%) by optimizing PostgreSQL schema, adding indexes, and resolving N+1 query patterns.',
      'Improved Stripe payment success rate by 20% with idempotent retry logic and PCI-DSS-aligned webhook handling.',
      'Shipped React frontend and Django backend improvements for an EdTech platform serving thousands of users.',
      'Implemented SSO integration with Udemy Business, reducing login-related support volume.',
    ],
  },
  {
    role: 'Backend Engineer (Contract)',
    company: 'Gre8 Intelligence',
    location: 'Remote',
    period: 'Jan 2023 – Dec 2023',
    bullets: [
      'Built an LLM-powered onboarding system in Django using the OpenAI API to classify businesses and recommend service packages, removing manual sales triage across pilot deployments serving 100+ end users.',
      'Implemented a document-grounded Q&A assistant that ingested company documents to answer employee questions in natural language.',
      'Shipped a browser-based video conferencing service over WebSockets with live transcription, retry logic, health checks, and structured logging.',
    ],
  },
];

const EDUCATION = [
  {
    degree: 'M.S., Computer Science',
    school: 'William Jessup University',
    period: 'Sep 2024 – Aug 2026',
    detail: 'GPA 4.0. Systems programming, machine learning, and software architecture.',
  },
  {
    degree: 'B.S., Software Development',
    school: 'KCA University',
    period: 'Apr 2018 – Dec 2022',
    detail: 'GPA 3.6. Software engineering, database design, and algorithmic problem solving.',
  },
];

/** Section shell so every block shares one rhythm. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-12">
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">{NAME}</h1>
          <p className="mt-2 text-lg font-semibold text-slate-700">{TITLE}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{FOCUS}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-black">
              <Mail className="h-3.5 w-3.5" /> {EMAIL}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {LOCATION.label}
            </span>
            {SOCIALS.filter((s) => s.url && (s.name === 'GitHub' || s.name === 'LinkedIn')).map((s) => (
              <a
                key={s.name}
                href={s.url as string}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-black"
              >
                <Github className="h-3.5 w-3.5" /> {s.name}
              </a>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {AVAILABILITY.full}
            </span>
            <a
              href="/Leleina_Boaz_Resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold text-blue-600 transition-all hover:bg-blue-100"
            >
              Download PDF <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* ── SUMMARY ────────────────────────────────────────────────────── */}
        <Section title="Summary">
          <p className="text-base leading-relaxed text-slate-700">
            Backend engineer with production experience building Python, Django, FastAPI, PostgreSQL,
            and AWS systems across EdTech and AI startups. I build backend systems that automate
            irreversible operations safely: cloud cost remediation, agentic pipelines, and local-first
            observability tooling. MS Computer Science, {AVAILABILITY.graduation}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Looking for {PRIMARY_ROLES}, with particular strength in {TARGET_TEAMS.slice(0, -1).join(', ')},
            and {TARGET_TEAMS[TARGET_TEAMS.length - 1]}. {LOCATION.note}
          </p>
        </Section>

        {/* ── SKILLS ─────────────────────────────────────────────────────── */}
        <Section title="Technical Skills">
          <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {SKILLS.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* ── EXPERIENCE ─────────────────────────────────────────────────── */}
        <Section title="Experience">
          <div className="space-y-7">
            {EXPERIENCE.map((job) => (
              <article key={job.role + job.company}>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <h3 className="text-base font-black tracking-tight">{job.role}</h3>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400">{job.period}</span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {job.company} · {job.location}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* ── PROJECTS ───────────────────────────────────────────────────── */}
        <Section title="Projects">
          <div className="space-y-6">
            {PROJECTS.map((p) => (
              <article key={p.slug}>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <h3 className="text-base font-black tracking-tight">
                    <Link href={`/projects/${p.slug}`} className="hover:text-blue-600">
                      {p.title}
                    </Link>
                  </h3>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400">{p.date}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{p.desc}</p>
                <p className="mt-1.5 font-mono text-[11px] text-slate-500">
                  {p.metrics.slice(0, 3).map((m) => `${m.value} ${m.label}`).join(' · ')}
                </p>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Github className="h-3 w-3" /> {p.github.replace('https://', '')}
                  </a>
                )}
              </article>
            ))}
          </div>
        </Section>

        {/* ── EDUCATION ──────────────────────────────────────────────────── */}
        <Section title="Education">
          <div className="space-y-5">
            {EDUCATION.map((e) => (
              <article key={e.degree}>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <h3 className="text-base font-black tracking-tight">{e.degree}</h3>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400">{e.period}</span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{e.school}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{e.detail}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* ── IMPACT ─────────────────────────────────────────────────────── */}
        <Section title="Speaking & Community">
          <article>
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
              <h3 className="text-base font-black tracking-tight">Keynote Speaker</h3>
              <span className="shrink-0 font-mono text-[11px] text-slate-400">2020 – 2025</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">The Samburu Project</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              Delivered keynotes to donor audiences in Los Angeles supporting over $340,000 raised for
              clean water and education programs in Samburu, Kenya. Also mentored high school students
              in mathematics, science, and computer studies.
            </p>
          </article>
        </Section>

        <p className="text-xs text-slate-400">
          Full project write-ups at{' '}
          <Link href="/" className="font-semibold text-blue-600 hover:text-blue-700">
            {SITE_URL.replace('https://', '')}
          </Link>
        </p>
      </main>

      <footer className="mx-auto max-w-3xl px-6 py-8 md:px-12">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          © {new Date().getFullYear()} {NAME}
        </span>
      </footer>
    </div>
  );
}

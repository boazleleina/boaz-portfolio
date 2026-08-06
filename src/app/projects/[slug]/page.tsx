import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, PlayCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DemoVideo from '@/components/DemoVideo';
import ArchitectureFlow from '@/components/ArchitectureFlow';
import { PROJECTS, getProject } from '@/data/projects';
import { NAME } from '@/data/profile';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) return { title: 'Project' };
  return {
    title: project.title,
    description: project.desc,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — ${NAME}`,
      description: project.desc,
      images: project.poster ? [{ url: project.poster, alt: `${project.title} demo` }] : undefined,
    },
  };
}

export default function ProjectDemoPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Back link */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-lg font-bold text-blue-400">{project.no}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Demo</span>
        </div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {project.title}
          </h1>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 mt-1.5 inline-flex items-center gap-2 text-[11px] md:text-xs font-bold tracking-wider uppercase px-4 md:px-5 py-2.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all duration-200 shadow-md"
            >
              <Github className="w-4 h-4" /> <span className="hidden sm:inline">GitHub</span>
            </a>
          )}
        </div>

        {/* Date, status, scope — answers "is this alive" and "did he build it" */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-500 mb-5">
          <span className="font-mono">{project.date}</span>
          <span aria-hidden className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {project.status}
          </span>
          <span aria-hidden className="text-slate-300">·</span>
          <span>{project.scope}</span>
        </div>

        <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
          {project.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded"
            >
              {t}
            </span>
          ))}
        </div>

        {/* ── DEMO VIDEO ─────────────────────────────────────────────────── */}
        {project.video ? (
          <DemoVideo
            src={project.video}
            poster={project.poster}
            label={`${project.title} demo`}
            length={project.videoLength}
            className="mb-12 aspect-video"
          />
        ) : (
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 mb-12 aspect-video">
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <PlayCircle className="w-12 h-12" />
              <span className="text-xs font-bold tracking-widest uppercase">Demo video coming soon</span>
            </div>
          </div>
        )}

        {/* ── BY THE NUMBERS ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-5">By the numbers</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {project.metrics.map((m) => (
              <div key={m.label} className="bg-white px-4 py-5">
                <dd className="text-2xl font-black tracking-tight text-slate-900">{m.value}</dd>
                <dt className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">{m.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ── CURRENTLY BUILDING ─────────────────────────────────────────── */}
        {project.building && (
          <section className="mb-12">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-5">
              Currently building
            </h2>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                In progress · {project.building.since}
              </p>
              <p className="text-sm leading-relaxed text-slate-700">{project.building.body}</p>
            </div>
          </section>
        )}

        {/* ── ARCHITECTURE ───────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-5">Architecture</h2>
          <ArchitectureFlow architecture={project.architecture} />
        </section>

        {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-5">Overview</h2>
          <div className="space-y-5">
            {project.overview.map((p, i) => (
              <p key={i} className="text-base text-slate-700 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* ── WHY IT MATTERS ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-5">Why It Matters</h2>
          <div className="space-y-5">
            {project.importance.map((p, i) => (
              <p key={i} className="text-base text-slate-700 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* ── STACK ──────────────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mb-3">Stack</h2>
          <p className="font-mono text-sm text-slate-600">{project.stack}</p>
        </section>

        {/* ── GITHUB CTA ─────────────────────────────────────────────────── */}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all shadow-md"
          >
            <Github className="w-4 h-4" /> View on GitHub
          </a>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-3xl mx-auto">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} {NAME}
        </span>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, PlayCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { PROJECTS, getProject } from '@/data/projects';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  return {
    title: project ? `${project.title} — Boaz Leleina` : 'Project — Boaz Leleina',
    description: project?.desc,
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
        <div className="flex items-start justify-between gap-4 mb-5">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {project.title}
          </h1>
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 mt-1.5 inline-flex items-center gap-2 text-[11px] md:text-xs font-bold tracking-wider uppercase px-4 md:px-5 py-2.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all duration-200 shadow-md"
          >
            <Github className="w-4 h-4" /> <span className="hidden sm:inline">GitHub</span>
          </a>
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
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 mb-12 aspect-video">
          {project.video ? (
            <video
              src={project.video}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <PlayCircle className="w-12 h-12" />
              <span className="text-xs font-bold tracking-widest uppercase">Demo video coming soon</span>
            </div>
          )}
        </div>

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
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all shadow-md"
        >
          <Github className="w-4 h-4" /> View on GitHub
        </a>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-3xl mx-auto flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Boaz Leleina
        </span>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          Built from systems.
        </span>
      </footer>
    </div>
  );
}

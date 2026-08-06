import Navbar from '@/components/Navbar';
import BlogList from '@/components/BlogList';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog',
  description:
    'Deep dives on backend and platform engineering: hexagonal architecture, Alembic migrations, Slack approval workflows, resilient API ingestion, and LLM system design.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  // Strip the markdown body: the list only needs metadata, and shipping every
  // post's full text to the client component would bloat the page payload.
  const posts = getAllPosts().map(({ content, ...meta }) => meta);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="grid md:grid-cols-[180px_1fr] gap-16 items-start">
          <div>
            <h1 className="text-[clamp(32px,4vw,56px)] font-black leading-none tracking-tighter text-slate-900 mb-6">
              Blog
            </h1>
            <p className="text-xs text-slate-500 max-w-[150px] leading-relaxed">
              Thoughts, deep dives, and notes on systems engineering.
            </p>
          </div>

          <BlogList posts={posts} />
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Boaz Leleina
        </span>
      </footer>
    </div>
  );
}

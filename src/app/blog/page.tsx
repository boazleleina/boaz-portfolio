import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog — Boaz Leleina',
  description: 'Thoughts, deep dives, and notes on systems engineering.',
};

export default function BlogPage() {
  const posts = getAllPosts();

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

          <div className="space-y-2">
            {posts.length === 0 && (
              <p className="text-sm text-slate-500 py-10">No posts yet. Check back soon.</p>
            )}
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group py-10 px-6 -mx-6 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-3">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:opacity-85 transition-opacity mb-3">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {post.description}
                  </p>
                </div>

                <div className="flex items-start md:items-center">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2
                    bg-slate-100 text-slate-600 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                    Read Post <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto flex items-center justify-between">
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

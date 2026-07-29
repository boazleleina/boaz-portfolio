'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

/**
 * Preferred tab order. Categories not listed here still render, appended
 * alphabetically, so a new frontmatter category never silently disappears.
 * Empty categories are dropped entirely.
 */
const CATEGORY_ORDER = ['Design', 'Databases', 'APIs', 'AI', 'Personal'];

const ALL = 'All';

export default function BlogList({ posts }: { posts: BlogMeta[] }) {
  const [active, setActive] = useState(ALL);

  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }

    const known = CATEGORY_ORDER.filter((c) => counts.has(c));
    const extra = [...counts.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();

    return [ALL, ...known, ...extra].map((name) => ({
      name,
      count: name === ALL ? posts.length : (counts.get(name) ?? 0),
    }));
  }, [posts]);

  const visible = active === ALL ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter posts by topic"
        className="flex flex-wrap gap-2 mb-4"
      >
        {tabs.map((tab) => {
          const selected = tab.name === active;
          return (
            <button
              key={tab.name}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.name)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                selected
                  ? 'bg-black text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.name}
              <span className={selected ? 'text-white/50' : 'text-slate-400'}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="py-10 text-sm text-slate-500">No posts yet. Check back soon.</p>
        )}

        {visible.map((post) => (
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
                <span>·</span>
                <span>{post.category}</span>
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
  );
}

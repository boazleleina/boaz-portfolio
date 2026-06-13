import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getAllPosts, getPost } from '@/lib/blog';
import 'highlight.js/styles/github-dark.css';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  return {
    title: post ? `${post.title} — Boaz Leleina` : 'Post — Boaz Leleina',
    description: post?.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {post.category}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-xs font-mono text-slate-400 mb-10">{post.date}</p>

        <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h3:text-xl prose-a:text-blue-600 prose-pre:bg-slate-900 prose-pre:rounded-xl prose-code:font-mono prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </main>

      <footer className="px-6 md:px-12 py-8 max-w-2xl mx-auto flex items-center justify-between">
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

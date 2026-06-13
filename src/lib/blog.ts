import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;        // raw frontmatter date string
  category: string;
  readTime: string;    // e.g. "6 min read" (auto-computed unless overridden)
}

export interface BlogPost extends BlogMeta {
  content: string;     // raw markdown body
}

// ~200 words/min reading speed.
function computeReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function readPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx?$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    date: data.date ?? '',
    category: data.category ?? 'General',
    readTime: data.readTime ?? computeReadTime(content),
    content,
  };
}

/** All posts, newest first. Returns [] if the content dir is missing. */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(readPost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | undefined {
  const md = path.join(BLOG_DIR, `${slug}.md`);
  const mdx = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(md)) return readPost(`${slug}.md`);
  if (fs.existsSync(mdx)) return readPost(`${slug}.mdx`);
  return undefined;
}

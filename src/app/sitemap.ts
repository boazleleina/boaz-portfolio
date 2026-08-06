import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/data/projects';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/data/profile';

// Required by `output: export`; without it the dev server 500s on this route.
export const dynamic = 'force-static';

/** Static export writes this to /sitemap.xml at build time. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['', '/resume', '/blog', '/gallery'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const projectRoutes = PROJECTS.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    // Frontmatter dates are human-readable ("July 12, 2026"); fall back to now
    // if one ever fails to parse rather than emitting an invalid lastmod.
    lastModified: Number.isNaN(Date.parse(post.date)) ? now : new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

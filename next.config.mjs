/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // Emit a fully static site to ./out — Cloudflare Pages serves this directly.
  // Pushing to GitHub triggers a Cloudflare build that re-reads content/blog/*.md.
  output: 'export',
  images: { unoptimized: true },
  // Export each route as a folder with index.html (clean URLs on Cloudflare).
  trailingSlash: true,
};

export default nextConfig;

import Overlay from '@/components/Overlay';

/**
 * Overlay is a client component but is deliberately NOT loaded with
 * `ssr: false`. That flag kept the entire homepage body out of the static
 * HTML, so crawlers saw an empty page and none of the headings, about copy,
 * or project list were indexable. The WebGL canvas is the only piece that
 * genuinely needs the browser, and it opts out on its own inside Overlay.
 */
export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <Overlay />
    </main>
  );
}

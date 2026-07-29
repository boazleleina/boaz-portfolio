'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * A post image that expands to a full-screen lightbox on click.
 * Only this leaf is client-side — the markdown itself still renders on the server.
 */
export default function ZoomableImage({ src, alt }: { src?: string; alt?: string }) {
  const [open, setOpen] = useState(false);
  const source = typeof src === 'string' ? src : '';
  const caption = alt ?? '';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    // Stop the page scrolling behind the overlay.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <img
        src={source}
        alt={caption}
        onClick={() => setOpen(true)}
        className="w-full cursor-zoom-in rounded-xl border border-slate-200 transition-shadow hover:shadow-lg"
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={caption || 'Expanded image'}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4 md:p-10"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close image"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={source}
            alt={caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />

          {caption && (
            <p className="absolute bottom-5 left-0 right-0 px-6 text-center font-mono text-xs text-white/60">
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

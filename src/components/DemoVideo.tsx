'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Demo player. Controls stay hidden until the pointer is over the video, so the
 * default Chrome control bar (with its three-dot overflow menu) is not the first
 * thing a recruiter sees on the flagship demo.
 *
 * Keyboard and touch users still get controls: focus reveals them, and coarse
 * pointers get them permanently since there is no hover state to rely on.
 */
export default function DemoVideo({
  src,
  poster,
  label,
  length,
  className = '',
}: {
  src: string;
  poster?: string;
  label: string;
  length?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [engaged, setEngaged] = useState(false);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    videoRef.current?.play();
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 ${className}`}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={engaged}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setStarted(true)}
        className="h-full w-full bg-black object-contain"
      />

      {/* Fallback affordance when autoplay is blocked (common on mobile). */}
      {!started && (
        <button
          onClick={play}
          aria-label={`Play ${label}`}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:opacity-0"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="ml-0.5 h-6 w-6 fill-slate-900 text-slate-900" />
          </span>
        </button>
      )}

      {length && (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
          {length}
        </span>
      )}
    </div>
  );
}

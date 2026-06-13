'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50 font-sans px-6 text-center">

      {/* keyframes for the scratch + floating bits */}
      <style>{`
        @keyframes moran-scratch {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-9deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-6deg); }
        }
        @keyframes q-float {
          0%, 100% { transform: translateY(0) rotate(var(--r)); opacity: 0.85; }
          50% { transform: translateY(-10px) rotate(var(--r)); opacity: 1; }
        }
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }
        .scratch-arm { transform-box: fill-box; transform-origin: 18px 6px; animation: moran-scratch 1.6s ease-in-out infinite; }
        .q { animation: q-float 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .blink { transform-box: fill-box; transform-origin: center; animation: blink 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scratch-arm, .q, .blink { animation: none; }
        }
      `}</style>

      {/* faint giant 404 behind the character */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-black tracking-tighter text-slate-900/[0.04] leading-none"
        style={{ fontSize: 'clamp(180px, 42vw, 460px)' }}
      >
        404
      </span>

      {/* ── Moran avatar ─────────────────────────────────────────────── */}
      <svg
        width="240"
        height="260"
        viewBox="0 0 240 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-[200px] sm:w-[240px] h-auto drop-shadow-sm"
        role="img"
        aria-label="A confused Samburu moran scratching his head"
      >
        {/* floating question marks */}
        <text className="q" style={{ ['--r' as string]: '-12deg', animationDelay: '0s' }} x="40" y="40" fontSize="26" fontWeight="900" fill="#3b82f6">?</text>
        <text className="q" style={{ ['--r' as string]: '8deg', animationDelay: '0.5s' }} x="186" y="56" fontSize="20" fontWeight="900" fill="#6366f1">?</text>
        <text className="q" style={{ ['--r' as string]: '-4deg', animationDelay: '1s' }} x="200" y="100" fontSize="15" fontWeight="900" fill="#a855f7">?</text>

        {/* spear, leaning in his lowered hand */}
        <line x1="58" y1="70" x2="58" y2="250" stroke="#7c4a21" strokeWidth="4" strokeLinecap="round" />
        <path d="M58 60 L52 76 L64 76 Z" fill="#94a3b8" />
        <path d="M58 250 L53 240 L63 240 Z" fill="#94a3b8" />

        {/* shuka (draped red cloth body) */}
        <path d="M86 168 Q120 150 154 168 L168 248 Q120 262 72 248 Z" fill="#c0392b" />
        {/* shuka check pattern */}
        <g stroke="#7e1f17" strokeWidth="2" opacity="0.55">
          <line x1="86" y1="192" x2="166" y2="192" />
          <line x1="84" y1="216" x2="168" y2="216" />
          <line x1="104" y1="166" x2="104" y2="252" />
          <line x1="136" y1="166" x2="136" y2="252" />
        </g>

        {/* beaded collar (iconic flat Samburu necklace) */}
        <ellipse cx="120" cy="158" rx="46" ry="20" fill="#ef4444" />
        <ellipse cx="120" cy="156" rx="38" ry="16" fill="#facc15" />
        <ellipse cx="120" cy="154" rx="30" ry="12" fill="#fff" />
        <ellipse cx="120" cy="152" rx="22" ry="9" fill="#3b82f6" />
        <ellipse cx="120" cy="151" rx="13" ry="6" fill="#ef4444" />

        {/* neck */}
        <rect x="110" y="132" width="20" height="22" rx="8" fill="#6b4423" />

        {/* head */}
        <circle cx="120" cy="104" r="34" fill="#7a5230" />
        {/* ochre hair cap + fringe */}
        <path d="M88 100 Q90 66 120 64 Q150 66 152 100 Q150 86 120 84 Q90 86 88 100 Z" fill="#9a3b1f" />
        <path d="M86 98 Q120 90 154 98 L150 90 Q120 80 90 90 Z" fill="#b8551f" />

        {/* face — confused: one raised brow, dot eyes, small mouth */}
        <path d="M101 96 Q107 90 114 95" stroke="#3b2410" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M127 92 Q134 88 140 93" stroke="#3b2410" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle className="blink" cx="108" cy="106" r="3.4" fill="#1e120a" />
        <circle className="blink" cx="133" cy="104" r="3.4" fill="#1e120a" />
        <path d="M112 122 Q120 117 129 121" stroke="#3b2410" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* lowered arm holding spear */}
        <path d="M92 162 Q72 150 60 78" stroke="#6b4423" strokeWidth="11" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="74" r="7" fill="#6b4423" />

        {/* raised scratching arm — animated */}
        <g className="scratch-arm">
          <path d="M150 160 Q176 140 156 96" stroke="#6b4423" strokeWidth="11" strokeLinecap="round" fill="none" />
          {/* hand at temple */}
          <circle cx="152" cy="92" r="8" fill="#6b4423" />
          <path d="M147 88 l-3 -6 M152 86 l0 -7 M157 88 l3 -6" stroke="#6b4423" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>

      {/* ── Copy ─────────────────────────────────────────────────────── */}
      <h1 className="relative z-10 mt-6 text-5xl sm:text-6xl font-black tracking-tighter text-slate-900">
        404
      </h1>
      <p className="relative z-10 mt-3 text-sm sm:text-base text-slate-600 max-w-sm leading-relaxed">
        This moran wandered off the trail. The page you&apos;re looking for isn&apos;t
        in this part of the savannah.
      </p>

      {/* Go Home */}
      <Link
        href="/"
        className="relative z-10 mt-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase px-6 py-3.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all duration-200 shadow-md"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Go Home
      </Link>
    </main>
  );
}

'use client';

import Link from 'next/link';

const BG = '#e9e9e9';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {/* Wrapper: image + edge-bleed overlays */}
      <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/404 error.jpg"
          alt="404 — Boaz Leleina"
          draggable={false}
          style={{
            width: 'clamp(260px, 68vmin, 580px)',
            height: 'auto',
            display: 'block',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          } as React.CSSProperties}
        />

        {/*
          Four gradient overlays — each bleeds the exact background colour
          inward from one edge, covering any JPEG compression artefacts.
          Corners are doubly covered so they're fully opaque.
        */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              linear-gradient(to right,  ${BG} 0%, transparent 14%),
              linear-gradient(to left,   ${BG} 0%, transparent 14%),
              linear-gradient(to bottom, ${BG} 0%, transparent 14%),
              linear-gradient(to top,    ${BG} 0%, transparent 14%)
            `,
          }}
        />
      </div>

      {/* Go Home */}
      <Link
        href="/"
        id="go-home-btn"
        style={{
          marginTop: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#0f172a',
          textDecoration: 'none',
          opacity: 0.55,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Go Home
      </Link>
    </main>
  );
}

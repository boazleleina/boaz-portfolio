'use client';

import React from 'react';

export default function Logo() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-105"
    >
      <defs>
        {/* Maasai Shúkà plaid pattern */}
        <pattern id="shukaPattern" width="12" height="12" patternUnits="userSpaceOnUse">
          {/* Base Red */}
          <rect width="12" height="12" fill="#dc2626" />
          {/* Thin Black Stripes */}
          <rect x="0" y="4" width="12" height="1.5" fill="#171717" />
          <rect x="4" y="0" width="1.5" height="12" fill="#171717" />
          {/* Thin White Stripes */}
          <rect x="0" y="9" width="12" height="0.8" fill="#ffffff" opacity="0.9" />
          <rect x="9" y="0" width="0.8" height="12" fill="#ffffff" opacity="0.9" />
        </pattern>

        {/* Radial background aura to fuse with the white page */}
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#dc2626" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="50" cy="50" r="48" fill="url(#auraGlow)" />

      {/* 
        INTERTWINING WEAVE RENDER ORDER:
        1. B Top Loop - White Halo (Background)
        2. B Top Loop - Shuka Pattern
        3. L Path - White Halo (Middle)
        4. L Path - Shuka Pattern
        5. B Stem & Bottom Loop - White Halo (Foreground)
        6. B Stem & Bottom Loop - Shuka Pattern
      */}

      {/* Layer 1: B Top Loop - White Halo */}
      <path
        d="M 28 16 C 48 16 64 16 64 34 C 64 52 48 52 28 52"
        stroke="#ffffff"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Layer 2: B Top Loop - Pattern */}
      <path
        d="M 28 16 C 48 16 64 16 64 34 C 64 52 48 52 28 52"
        stroke="url(#shukaPattern)"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Layer 3: L Path - White Halo */}
      <path
        d="M 48 16 L 48 84 L 80 84"
        stroke="#ffffff"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Layer 4: L Path - Pattern */}
      <path
        d="M 48 16 L 48 84 L 80 84"
        stroke="url(#shukaPattern)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Layer 5: B Stem & Bottom Loop - White Halo */}
      <path
        d="M 28 16 L 28 84 M 28 52 C 50 52 68 52 68 68 C 68 84 50 84 28 84"
        stroke="#ffffff"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Layer 6: B Stem & Bottom Loop - Pattern */}
      <path
        d="M 28 16 L 28 84 M 28 52 C 50 52 68 52 68 68 C 68 84 50 84 28 84"
        stroke="url(#shukaPattern)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Connective Accent Node (System highlight) */}
      <circle cx="48" cy="52" r="3" fill="#ffffff" />
      <circle cx="48" cy="52" r="1.5" fill="#171717" />
    </svg>
  );
}

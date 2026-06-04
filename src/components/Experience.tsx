// @ts-nocheck
'use client';

import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { Suspense, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function Experience() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return (
    <Canvas
      camera={{ position: [0, 0, 700], fov: 50, near: 1, far: 4000 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ParticleSystem isDark={isDark} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

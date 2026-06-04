'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Overlay = dynamic(() => import('@/components/Overlay'), { ssr: false });

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Overlay />
      </Suspense>
    </main>
  );
}

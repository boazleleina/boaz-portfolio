'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Droplets } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

// TODO: customize per-image title + description as needed.
const GALLERY_ITEMS: GalleryItem[] = [
  // ── Community — Splash Bash ──────────────────────────────────────────
  { id: 3,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/IMG_3339.JPG', description: '' },
  { id: 1,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/IMG_3334.JPG', description: '' },
  { id: 4,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/IMG_3340.JPG', description: '' },
  { id: 5,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/IMG_3341.JPG', description: '' },
  { id: 6,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/img1.jpeg',     description: '' },
  { id: 7,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/img10.jpeg',    description: '' },
  { id: 8,  title: 'Splash Bash',  category: 'Community',    imageUrl: '/gallery/community/img11.jpeg',    description: '' },

  // ── Water Access — Run for Water, Runnymede CA ───────────────────────
  { id: 9,  title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3982.JPG', description: '' },
  { id: 10, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3986.JPG', description: '' },
  { id: 11, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3987.JPG', description: '' },
  { id: 13, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3989.JPG', description: '' },
  { id: 14, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3994.JPG', description: '' },
  { id: 15, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img4.jpeg',     description: '' },
  { id: 16, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img5.jpeg',     description: '' },
  { id: 17, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img6.jpeg',     description: '' },
  { id: 18, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img7.jpeg',     description: '' },
  { id: 19, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img8.jpeg',     description: '' },
  { id: 20, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img9.jpeg',     description: '' },
  { id: 21, title: 'Run for Water', category: 'Water Access', imageUrl: '/gallery/water-access/img12.jpeg',    description: '' },

  // ── Education ────────────────────────────────────────────────────────
  { id: 22, title: 'Education for All', category: 'Education', imageUrl: '/gallery/education/edu-1000044320.jpg',  description: '' },
  { id: 23, title: 'Education for All', category: 'Education', imageUrl: '/gallery/education/edu-pxl-20260421.jpg', description: '' },
  { id: 24, title: 'Education for All', category: 'Education', imageUrl: '/gallery/education/edu-screenshot.png',   description: '' },
];

const CATEGORIES = ['All', 'Community', 'Water Access', 'Education'];

// Heading + paragraph shown under the tabs for each category.
const CATEGORY_INFO: Record<string, { title: string; body: string }> = {
  'Community': {
    title: 'Splash Bash',
    body: 'I delivered the keynote at the Splash Bash, where over $300,000 was raised to bring lasting impact to the Samburu community.',
  },
  'Water Access': {
    title: 'Run for Water',
    body: 'Held at Runnymede in California, this run raised over $25,000 USD to fund clean water access for women and children.',
  },
  'Education': {
    title: 'Education for All',
    body: 'I am heavily involved in educating young people on the importance of education — building spaces where everyone can access learning equally.',
  },
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeIdx === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveIdx(null);
      if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, filteredItems]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-blue-500 selection:text-white">

      <Navbar />

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Intro */}
        <div className="max-w-3xl mb-16 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase">
            <Droplets className="w-3.5 h-3.5" /> Impact & Advocacy
          </div>
          <h1 className="text-[clamp(32px,4vw,56px)] font-black leading-none tracking-tighter text-slate-900">
            Gallery
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            I am passionate about community impact, education, and access to clean water for women and children. Through keynotes, fundraisers, and on-the-ground work, I help build a world where every community can thrive and every child can learn. These photos capture moments from that work.
          </p>
        </div>

        {/* Category Filters */}
        <div 
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none mb-10 border-b border-slate-100 pb-6 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth shrink-0 w-full"
          style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setActiveIdx(null);
              }}
              className={`text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-full transition-all shrink-0 ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Category banner */}
        {CATEGORY_INFO[selectedCategory] && (
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-blue-50/60 border border-blue-100">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2.5">
              {CATEGORY_INFO[selectedCategory].title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {CATEGORY_INFO[selectedCategory].body}
            </p>
          </div>
        )}

        {/* Photo Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveIdx(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-blue-400 mb-1.5">
                    <ZoomIn className="w-3.5 h-3.5" /> View Photo
                  </span>
                  <h3 className="text-white text-base font-bold leading-tight">{item.title}</h3>
                  <p className="text-white/80 text-[11px] font-mono mt-1.5 uppercase tracking-wider">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No photos found in this category.</p>
          </div>
        )}
      </main>

      {/* ── LIGHTBOX MODAL ───────────────────────────────────────────────── */}
      {activeIdx !== null && filteredItems[activeIdx] && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/98 backdrop-blur-md p-6">
          {/* Close button */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-900 z-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation controls */}
          <button
            onClick={() => setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))}
            className="absolute left-6 p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-900 z-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveIdx((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))}
            className="absolute right-6 p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-900 z-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Lightbox content */}
          <div className="max-w-4xl w-full flex flex-col items-center gap-6">
            <div className="relative max-h-[70vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-slate-50">
              <img
                src={filteredItems[activeIdx].imageUrl}
                alt={filteredItems[activeIdx].title}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>

            <div className="text-center max-w-xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 mb-1.5 block">
                {filteredItems[activeIdx].category}
              </span>
              <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                {filteredItems[activeIdx].title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {filteredItems[activeIdx].description || CATEGORY_INFO[filteredItems[activeIdx].category]?.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto flex items-center justify-between border-t border-slate-100">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Boaz Leleina
        </span>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          Empowering Communities.
        </span>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Droplets, ExternalLink } from 'lucide-react';
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
  { id: 3,  title: 'Delivering the keynote',  category: 'Community',    imageUrl: '/gallery/community/IMG_3339.JPG', description: 'Delivering the Splash Bash keynote to a donor audience in Los Angeles.' },
  { id: 1,  title: 'Talking with donors',  category: 'Community',    imageUrl: '/gallery/community/IMG_3334.JPG', description: 'Explaining the water program to supporters before the evening program.' },
  { id: 4,  title: 'Why clean water matters',  category: 'Community',    imageUrl: '/gallery/community/IMG_3340.JPG', description: 'Explaining what access to clean water changes day to day for women and children in my village.' },
  { id: 5,  title: 'Education and health',  category: 'Community',    imageUrl: '/gallery/community/IMG_3341.JPG', description: 'Making the case that quality education and health outcomes rise together, and that neither moves far without the other.' },
  { id: 6,  title: 'Before the keynote',  category: 'Community',    imageUrl: '/gallery/community/img1.jpeg',     description: 'On the Splash Bash press wall ahead of the keynote.' },
  { id: 7,  title: 'With the director',  category: 'Community',    imageUrl: '/gallery/community/img10.jpeg',    description: 'With Linda Hopper, director of The Samburu Project.' },
  { id: 8,  title: 'With the board chair',  category: 'Community',    imageUrl: '/gallery/community/img11.jpeg',    description: 'With the board chair of The Samburu Project at the Splash Bash press wall.' },

  // ── Water Access — Run for Water, Runnymede CA ───────────────────────
  { id: 9,  title: 'Greeting supporters', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3982.JPG', description: 'Meeting long-time supporters at the Run for Water in Runnymede, California.' },
  { id: 10, title: 'Networking with donors', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3986.JPG', description: 'Talking through the program with a donor over lunch at Runnymede.' },
  { id: 11, title: 'Speaking on water access', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3987.JPG', description: 'Opening remarks at the Run for Water on why clean water access comes before almost everything else.' },
  { id: 13, title: 'What no water costs a day', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3989.JPG', description: 'Describing what daily life looks like when the nearest clean water is hours away on foot.' },
  { id: 14, title: 'Games with donors', category: 'Water Access', imageUrl: '/gallery/water-access/IMG_3994.JPG', description: 'Cornhole with supporters between the run and the program.' },
  { id: 15, title: 'The Samburu Project staff', category: 'Water Access', imageUrl: '/gallery/water-access/img4.jpeg',     description: 'Group photo with the staff of The Samburu Project.' },
  { id: 16, title: 'With Mamen Saura', category: 'Water Access', imageUrl: '/gallery/water-access/img5.jpeg',     description: 'With Mamen Saura, photographer for The Samburu Project.' },
  { id: 17, title: 'Water comes first', category: 'Water Access', imageUrl: '/gallery/water-access/img6.jpeg',     description: 'Making the case for water access as the starting point for education and health outcomes.' },
  { id: 18, title: 'Addressing the tables', category: 'Water Access', imageUrl: '/gallery/water-access/img7.jpeg',     description: 'Speaking to supporters seated across the lawn at Runnymede.' },
  { id: 19, title: 'Welcoming a supporter', category: 'Water Access', imageUrl: '/gallery/water-access/img8.jpeg',     description: 'Welcoming a long-time supporter as guests arrive for the run.' },
  { id: 20, title: 'Everyone who showed up', category: 'Water Access', imageUrl: '/gallery/water-access/img9.jpeg',     description: 'Group photo of everyone who turned out for the Run for Water.' },
  { id: 21, title: 'Volunteers prepping', category: 'Water Access', imageUrl: '/gallery/water-access/img12.jpeg',    description: 'Volunteers setting up before the gates open.' },

  // ── Education ────────────────────────────────────────────────────────
  { id: 22, title: 'Elementary school visit', category: 'Education', imageUrl: '/gallery/education/edu-1000044320.jpg',  description: 'Talking with students at an elementary school in Washington about how life-changing education is, and what the road from a village in Samburu to the US actually looked like.' },
  { id: 23, title: 'Questions from the class', category: 'Education', imageUrl: '/gallery/education/edu-pxl-20260421.jpg', description: 'Hands up across the room during questions, same visit.' },
  { id: 24, title: 'Back at my high school', category: 'Education', imageUrl: '/gallery/education/edu-screenshot.png',   description: 'Back at my old high school in Kenya, talking to students about hard work and persistence.' },
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
                  alt={item.description || `${item.title} — ${item.category} work with The Samburu Project`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-blue-400 mb-1.5">
                    <ZoomIn className="w-3.5 h-3.5" /> View Photo
                  </span>
                  {item.description ? (
                    <>
                      <h3 className="text-white text-base font-bold leading-tight">{item.title}</h3>
                      <p className="text-white/80 text-xs leading-snug mt-1.5">{item.description}</p>
                    </>
                  ) : (
                    <p className="text-white/80 text-[11px] font-mono uppercase tracking-wider">{item.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No photos found in this category.</p>
          </div>
        )}

        {/* Samburu Project link */}
        <div className="mt-16 p-8 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mb-1.5">
              The Samburu Project
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Learn more about the organization bringing clean water and lasting impact to the Samburu community.
            </p>
          </div>
          <a
            href="https://thesamburuproject.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 px-5 py-3 rounded-full bg-black text-white text-[11px] font-bold tracking-wider uppercase hover:bg-slate-800 transition-all"
          >
            Visit Site <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
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
                alt={filteredItems[activeIdx].description || `${filteredItems[activeIdx].title} — ${filteredItems[activeIdx].category} work with The Samburu Project`}
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

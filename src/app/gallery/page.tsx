'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart, Droplets } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'Clean Water Source Delivery',
    category: 'Water Access',
    imageUrl: '/gallery/img1.jpeg',
    description: 'A newly installed community clean water pump providing immediate access to surrounding villages, replacing hours of walking.'
  },
  {
    id: 2,
    title: 'Community Gathering & Action',
    category: 'Community',
    imageUrl: '/gallery/img2.jpeg',
    description: 'Local community members meeting to plan water distribution, maintenance schedules, and sustainable village management.'
  },
  {
    id: 3,
    title: 'Generational Health Impact',
    category: 'Impact',
    imageUrl: '/gallery/img3.jpeg',
    description: 'Empowering children and youth with safe, reliable water systems, reducing waterborne illness and improving daily health.'
  },
  {
    id: 4,
    title: 'Well Drilling Operations',
    category: 'Infrastructure',
    imageUrl: '/gallery/img4.jpeg',
    description: 'The physical implementation of high-depth water wells, drilling deep to reach stable, clean underground aquifers.'
  },
  {
    id: 5,
    title: 'Women Empowerment and Freedom',
    category: 'Community',
    imageUrl: '/gallery/img5.jpeg',
    description: 'Relieving women and girls from walking miles daily for muddy water, giving them time for education, family, and micro-enterprise.'
  },
  {
    id: 6,
    title: 'Water Commission Planning',
    category: 'Infrastructure',
    imageUrl: '/gallery/img6.jpeg',
    description: 'Training local leaders and water committees to maintain well hardware and manage water resources independently.'
  },
  {
    id: 7,
    title: 'The First Flow of Clean Water',
    category: 'Impact',
    imageUrl: '/gallery/img7.jpeg',
    description: 'Celebrating the first flow of safe, drinkable water in a remote, water-scarce village location in Samburu.'
  },
  {
    id: 8,
    title: 'Sustainable Infrastructure Foundations',
    category: 'Infrastructure',
    imageUrl: '/gallery/img8.jpeg',
    description: 'Constructing robust concrete foundations and drainage systems designed to withstand weather and serve communities for decades.'
  },
  {
    id: 9,
    title: 'Community Health & Sanitation Training',
    category: 'Impact',
    imageUrl: '/gallery/img9.jpeg',
    description: 'Education programs in hygiene and sanitation running hand-in-hand with physical well deployments to optimize health outcomes.'
  },
  {
    id: 10,
    title: 'Empowering School Enrollment',
    category: 'Community',
    imageUrl: '/gallery/img10.jpeg',
    description: 'School enrollment increases dramatically when safe, clean water is available directly at local community schools.'
  },
  {
    id: 11,
    title: 'Preserving Long-term Access',
    category: 'Water Access',
    imageUrl: '/gallery/img11.jpeg',
    description: 'Regular testing, clean water quality checks, and community auditing to preserve safe drinking standards over time.'
  },
  {
    id: 12,
    title: 'Clean Water Celebrations',
    category: 'Impact',
    imageUrl: '/gallery/img12.jpeg',
    description: 'Villagers celebrate the opening of their clean water well, marking the start of a healthier era.'
  },
  {
    id: 13,
    title: 'Well Maintenance Demonstration',
    category: 'Infrastructure',
    imageUrl: '/gallery/img13.jpeg',
    description: 'Volunteers and local technicians explaining the mechanical functions of the well pump.'
  },
  {
    id: 14,
    title: 'Empowered Local Youth',
    category: 'Impact',
    imageUrl: '/gallery/img14.jpeg',
    description: 'Empowering children with easy access to water, keeping them in school and improving literacy rates.'
  },
  {
    id: 16,
    title: 'Clean Storage Solutions',
    category: 'Water Access',
    imageUrl: '/gallery/img16.jpeg',
    description: 'Installing clean storage tanks to harvest and preserve water safely for dry seasons.'
  },
  {
    id: 17,
    title: 'Community Outreach Campaign',
    category: 'Community',
    imageUrl: '/gallery/img17.jpeg',
    description: 'Raising awareness for water rights and sustainable resources during regional community workshops.'
  }
];

const CATEGORIES = ['All', 'Water Access', 'Infrastructure', 'Community', 'Impact'];

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
        
        {/* Intro Grid */}
        <div className="grid md:grid-cols-[280px_1fr] gap-16 items-start mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase">
              <Droplets className="w-3.5 h-3.5" /> NGO Initiative
            </div>
            <h1 className="text-[clamp(32px,3.5vw,52px)] font-black leading-none tracking-tighter text-slate-900">
              Samburu Water Project
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              Documenting clean water installations, sanitation education, and community empowerment initiatives across Samburu, Kenya.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> My Involvement & Mission
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clean water is the foundation of health, education, and economic stability. As a keynote speaker and active advocate for <strong>The Samburu Project</strong>, I have helped present clean water programs at major campaigns, contributing to over <strong>$340,000</strong> raised to drill high-depth wells, train local leaders, and secure sustainable resources for villages in rural Kenya. These photos represent the physical wells, community committees, and children whose futures are transformed by clean water.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
              <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 text-center flex flex-col justify-center items-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600">$340K+</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Funds Raised</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 text-center flex flex-col justify-center items-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600">11+</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Village Wells</div>
              </div>
            </div>
          </div>
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
                {filteredItems[activeIdx].description}
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

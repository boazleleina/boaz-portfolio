'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import Logo from './Logo';

// Single source of truth for nav links — used by desktop + mobile menus everywhere.
export const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#education', label: 'Education' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#work', label: 'Projects' },
  { href: '/#impact', label: 'Impact' },
  { href: '/blog', label: 'Blog' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Highlight the link matching the current route (only for real pages, not hash anchors).
  const isActive = (href: string) => !href.includes('#') && pathname === href;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/60 backdrop-blur-md border-b border-slate-200/20 shadow-sm' : 'bg-white/95'
      }`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between bg-transparent">
        <Link href="/" className="group flex items-center gap-2.5 text-sm font-bold tracking-tight text-slate-900">
          <Logo />
          <span>Boaz Leleina</span>
        </Link>

        {/* Desktop nav — only visible at lg (1024px+) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={`transition-colors ${isActive(href) ? 'text-black' : 'hover:text-black'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Hire me — desktop only */}
          <a href="mailto:boazleleina3@gmail.com"
            className="hidden lg:inline-flex text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full
              bg-slate-100 hover:bg-black hover:text-white transition-all duration-200">
            Hire me
          </a>

          {/* Hamburger — mobile & tablet (< lg) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
            className="lg:hidden relative z-50 flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            {mobileMenuOpen
              ? <X className="w-4 h-4 text-slate-700" />
              : <Menu className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* ── Slide-down menu — mobile & tablet (< lg) ──────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="mx-4 mb-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
          {/* Nav links — 2 cols on phones, 4 cols on tablets */}
          <nav className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100/80 border-b border-slate-100">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={closeMobileMenu}
                className={`flex items-center justify-center py-4 px-4 text-[10px] font-bold tracking-[0.15em] uppercase bg-white hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 ${isActive(href) ? 'text-slate-900' : 'text-slate-500'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          {/* Hire me CTA */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">Available for work</span>
            <a
              href="mailto:boazleleina3@gmail.com"
              onClick={closeMobileMenu}
              className="text-[10px] font-bold tracking-wider uppercase px-5 py-2 rounded-full bg-black text-white hover:bg-slate-800 transition-all duration-200"
            >
              Hire me
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

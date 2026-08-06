'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu, Github, Linkedin, Instagram, Twitter, Mail } from 'lucide-react';
import Logo from './Logo';
import { AVAILABILITY, EMAIL, SOCIALS } from '@/data/profile';

const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Role opportunity')}`;

/**
 * Socials shown in the nav. X and Instagram are deliberately excluded: next to
 * GitHub and LinkedIn they read as noise to a recruiter and spend a click that
 * helps less. They remain in SOCIALS for JSON-LD `sameAs`.
 */
const NAV_SOCIALS = ['GitHub', 'LinkedIn'];

// Icon per social name. Keeps the navbar to glyphs so it never crowds the links.
const SOCIAL_ICONS: Record<string, typeof Github> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  X: Twitter,
  Instagram: Instagram,
};

function SocialLinks({ onNavigate, className = '' }: { onNavigate?: () => void; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {SOCIALS.filter((s) => s.url && NAV_SOCIALS.includes(s.name)).map(({ name, url, label }) => {
        const Icon = SOCIAL_ICONS[name];
        return (
          <a
            key={name}
            href={url as string}
            target="_blank"
            rel="noreferrer me"
            aria-label={label}
            title={label}
            onClick={onNavigate}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <Icon className="h-[15px] w-[15px]" />
          </a>
        );
      })}
    </div>
  );
}

// Single source of truth for nav links — used by desktop + mobile menus everywhere.
export const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#education', label: 'Education' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#work', label: 'Projects' },
  { href: '/#impact', label: 'Impact' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
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
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
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

        <div className="flex items-center gap-2 xl:gap-3">
          <SocialLinks className="hidden xl:flex" />

          {/* Hire me — desktop only */}
          <a
            href={MAILTO}
            aria-label={`Email ${EMAIL}`}
            title={`Email ${EMAIL}`}
            className="hidden xl:flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <Mail className="h-[15px] w-[15px]" />
          </a>

          {/* Hamburger — mobile & tablet (< lg) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
            className="xl:hidden relative z-50 flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            {mobileMenuOpen
              ? <X className="w-4 h-4 text-slate-700" />
              : <Menu className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* ── Slide-down menu — mobile & tablet (< lg) ──────────────────────── */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
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
          {/* Availability + socials + CTA */}
          <div className="px-4 pt-3 text-[9px] font-bold tracking-widest uppercase text-emerald-600">
            {AVAILABILITY.short} · MS CS, {AVAILABILITY.graduation}
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <SocialLinks onNavigate={closeMobileMenu} />
            <a
              href={MAILTO}
              onClick={closeMobileMenu}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-5 py-2 rounded-full bg-black text-white hover:bg-slate-800 transition-all duration-200"
            >
              <Mail className="h-3.5 w-3.5" /> Email me
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Download, PlayCircle } from 'lucide-react';
import Navbar from './Navbar';
import { PROJECTS } from '@/data/projects';
import {
  AVAILABILITY,
  CAPABILITY,
  HERO_BIO,
  EMAIL,
  HUMAN_LINE,
  LOCATION,
  PRIMARY_ROLES,
  SOCIALS,
  TARGET_TEAMS,
  TITLE,
} from '@/data/profile';

const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Role opportunity')}`;

// Three.js particle canvas — client only (uses WebGL/window).
const Experience = dynamic(() => import('./Experience'), { ssr: false });

// Registered on the client only: this component is server-rendered now, and
// ScrollTrigger touches window/document at registration time.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Typewriter hook (loops forever) ─────────────────────────────────────────
function useTypewriter(lines: string[], speed = 14, linePause = 60) {
  // Seeded with the finished text so the h1 is fully rendered in the static
  // HTML, and so the first paint is never an empty headline with a cursor.
  const [display, setDisplay] = useState<string[]>(lines);
  const [currentLine, setCurrentLine] = useState(lines.length - 1);
  const [done, setDone] = useState(true);

  useEffect(() => {
    // Anyone who asked for less motion keeps the finished text, no animation.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let lineIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    function reset() {
      if (!active) return;
      lineIdx = 0;
      charIdx = 0;
      setDisplay(Array(lines.length).fill(''));
      setDone(false);
      setCurrentLine(0);
      timer = setTimeout(type, linePause * 2);
    }

    function type() {
      if (!active) return;
      if (lineIdx >= lines.length) {
        setDone(true);
        return;
      }
      setCurrentLine(lineIdx);
      const line = lines[lineIdx];

      if (charIdx <= line.length) {
        setDisplay(prev => {
          const next = [...prev];
          next[lineIdx] = line.slice(0, charIdx);
          return next;
        });
        charIdx++;
        timer = setTimeout(type, charIdx === 1 ? linePause : speed);
      } else {
        lineIdx++;
        charIdx = 0;
        timer = setTimeout(type, linePause);
      }
    }

    // Whole run is well under a second: ~40 characters at 18ms plus three
    // short line pauses. The previous 60ms/400ms pacing left the largest
    // block on the page empty for seconds on a cold load, which read as a
    // broken page rather than as an effect.
    setDisplay(Array(lines.length).fill(''));
    setDone(false);
    setCurrentLine(0);
    const start = setTimeout(type, 40);

    return () => {
      active = false;
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, []);

  return { display, currentLine, done };
}

// ── Timeline Components ────────────────────────────────────────────────────────
function TimelineLine() {
  const lineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current || !progressRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: lineRef.current,
      start: 'top 55%',
      end: 'bottom 55%',
      scrub: true,
      // Without this the line keeps the offsets it measured before the demo
      // thumbnails loaded, so the progress fill (and its glowing dot) stops
      // partway down instead of tracking the scroll.
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progressRef.current) {
          progressRef.current.style.height = `${self.progress * 100}%`;
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div 
      ref={lineRef}
      className="absolute left-[31px] md:left-[232px] lg:left-[303px] top-[120px] bottom-[120px] w-[2px] bg-slate-100 dark:bg-slate-800/40 z-10 pointer-events-none origin-top"
    >
      <div 
        ref={progressRef}
        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 origin-top"
        style={{ height: '0%' }}
      >
        {/* Flowing glowing tip that moves along the line with the scroll! */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6,0_0_20px_#6366f1] translate-y-1/2" />
      </div>
    </div>
  );
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!itemRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: itemRef.current,
      start: 'top 55%',
      end: 'bottom 55%',
      invalidateOnRefresh: true,
      onToggle: (self) => {
        setIsActive(self.isActive);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div ref={itemRef} className="r relative pl-6 sm:pl-12 py-10 cursor-default group">
      {/* Timeline Dot positioned exactly on the line, preventing squish by eliminating wrapper */}
      <div 
        className={`absolute left-[1px] md:left-[3px] lg:left-[5px] top-[48px] w-3 h-3 rounded-full transition-all duration-500 border-2 z-20 shrink-0 ${
          isActive 
            ? 'bg-blue-500 scale-110 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
            : 'bg-slate-200 dark:bg-slate-800 border-white dark:border-slate-900 shadow-sm'
        }`}
      />
      {children}
    </div>
  );
}

export default function Overlay() {
  const [mounted, setMounted] = useState(false);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroCanvasRef = useRef<HTMLDivElement>(null);

  const { display, currentLine, done } = useTypewriter(['Clean APIs.', 'Safe automation.', 'Solid systems.']);

  useEffect(() => {
    setMounted(true);

    gsap.utils.toArray<HTMLElement>('.r').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
          opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        }
      );
    });

    // Crossfade the crisp photo out and the particle canvas in over the first
    // slice of hero scroll — so the portrait stays pixel-sharp until the snap.
    const fade = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate(self) {
        const f = Math.min(1, self.progress * 8); // fully swapped by ~12% scroll
        if (heroImgRef.current) heroImgRef.current.style.opacity = String(1 - f);
        if (heroCanvasRef.current) heroCanvasRef.current.style.opacity = String(f);
      },
    });

    // Thumbnails and the portrait decode after triggers are first measured,
    // which shifts everything below them and would otherwise freeze the
    // timeline progress line partway down. One re-measure once loading settles.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const settle = setTimeout(refresh, 600);

    // The markup is server-rendered now, so these elements are on screen
    // before GSAP hides them to animate them in. If a trigger never fires,
    // the old client-only build simply showed nothing yet — this one would
    // leave real content permanently invisible. Force anything still at
    // opacity 0 back into view.
    const failsafe = setTimeout(() => {
      gsap.utils.toArray<HTMLElement>('.r').forEach((el) => {
        if (window.getComputedStyle(el).opacity === '0') {
          gsap.set(el, { opacity: 1, y: 0 });
        }
      });
    }, 2500);

    return () => {
      window.removeEventListener('load', refresh);
      clearTimeout(settle);
      clearTimeout(failsafe);
      fade.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="w-full font-sans text-slate-900 selection:bg-blue-500 selection:text-white">

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative xl:min-h-screen">

        {/* ── Phone only: stacked portrait above text (hidden sm+) ── */}
        <div className="sm:hidden relative w-full overflow-hidden" style={{ marginTop: '56px', height: '320px' }}>
          <img
            src="/boaz-portrait-light.png"
            alt="Portrait of Boaz Leleina, backend and platform engineer"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 18%', filter: 'brightness(1.24) contrast(1.22)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 97%)' }}
          />
        </div>

        {/* ── Tablet + Desktop: portrait pinned to right (sm+) ── */}
        {/* Crisp photo at rest; crossfades into the particle canvas, which
            disintegrates on scroll (Thanos snap) and reacts to the mouse. */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-[55%] md:w-[52%] lg:w-[54%] sm:top-14 lg:top-0 pointer-events-none z-0">
          <img
            ref={heroImgRef}
            src="/boaz-portrait-light.png"
            alt="Portrait of Boaz Leleina, backend and platform engineer"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: 'center 10%',
              filter: 'brightness(1.24) contrast(1.22)',
              WebkitMaskImage: 'radial-gradient(ellipse at 90% 25%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 68%)',
              maskImage: 'radial-gradient(ellipse at 90% 25%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 68%)',
            }}
          />
          <div ref={heroCanvasRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <Experience />
          </div>
        </div>

        {/* ── Hero text ── */}
        <div className="relative z-10 px-6 sm:px-8 md:px-10 lg:px-12 max-w-full sm:max-w-[58%] md:max-w-[55%] lg:max-w-[54%] pt-4 sm:pt-24 md:pt-28 lg:pt-36 pb-16">

          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase mb-4 md:mb-8
            text-slate-500 leading-relaxed">
            <span className="text-slate-800 sm:text-slate-500">{TITLE} · Python · AWS · LLM systems</span>
          </p>

          {/* Typewriter title */}
          <h1 className="text-[clamp(30px,7vw,52px)] sm:text-[clamp(26px,4vw,42px)] md:text-[clamp(28px,3.8vw,44px)] lg:text-[clamp(36px,4vw,56px)] font-black leading-[1.05] tracking-tight
            text-slate-900 mb-6 md:mb-8 lg:mb-10 font-mono">
            {display.map((line, i) => (
              <span key={i} className="block">
                {line}
                {i === currentLine && !done && (
                  <span className="inline-block w-[3px] h-[1em] bg-blue-500 ml-1 align-middle animate-pulse" />
                )}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-5 w-full sm:w-auto sm:pt-2 md:pt-4 lg:pt-8">
            <p className="text-xs md:text-sm text-slate-600 max-w-xs leading-relaxed">
              {HERO_BIO}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="#work"
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-black text-white hover:bg-slate-800 transition-all text-center w-full sm:w-auto shadow-md">
                View work
              </a>
              <a href="/Leleina_Boaz_Resume.pdf" download
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm">
                Resume <Download className="w-3.5 h-3.5" />
              </a>
              <a href={MAILTO}
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-slate-100 hover:bg-slate-200 transition-all text-center w-full sm:w-auto">
                Email
              </a>
            </div>

            {/* AI-Generated Recruiter Console */}
            <div className="mt-4 lg:mt-6 p-4 rounded-2xl bg-[#090D16] text-slate-300 border border-slate-800 w-full max-w-xs lg:max-w-sm font-mono shadow-xl relative overflow-hidden hidden lg:block">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AI Query: Availability
                </span>
                <span className="text-slate-600">Active</span>
              </div>
              
              <div className="text-[11px] space-y-1.5 leading-relaxed">
                <div className="text-slate-500 text-[10px]">// Parsing Leleina_Boaz_Resume.pdf</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">status</span> = <span className="text-emerald-300">&quot;{AVAILABILITY.short}&quot;</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">graduates</span> = <span className="text-emerald-300">&quot;MS CS, {AVAILABILITY.graduation}&quot;</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">teams</span> = [<span className="text-emerald-300">&quot;Backend&quot;</span>, <span className="text-emerald-300">&quot;API&quot;</span>, <span className="text-emerald-300">&quot;Platform&quot;</span>, <span className="text-emerald-300">&quot;DevTools&quot;</span>, <span className="text-emerald-300">&quot;FinOps&quot;</span>, <span className="text-emerald-300">&quot;AI Infra&quot;</span>];
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">base</span> = <span className="text-emerald-300">&quot;United States&quot;</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">workAuth</span> = <span className="text-emerald-300">&quot;{AVAILABILITY.workAuth}&quot;</span>;
                  <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1.5 align-middle animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-12 md:py-24 lg:py-40 px-6 md:px-10 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-6 md:gap-10 lg:gap-16 items-start">
          <div className="r">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400
              md:sticky md:top-24">01 — About</h2>
          </div>
          <div>
            <p className="r text-2xl md:text-3xl font-light leading-relaxed text-slate-800 mb-4 md:mb-6 tracking-tight">
              {CAPABILITY}
            </p>
            <p className="r text-base md:text-lg font-light leading-relaxed text-slate-500 mb-7 md:mb-14">
              {HUMAN_LINE}
            </p>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-7">
              {[
                ['Languages', 'Python · SQL · TypeScript · JavaScript'],
                ['Backend & APIs', 'Django (DRF) · FastAPI · REST APIs · OpenAPI'],
                ['Databases & Search', 'PostgreSQL · pgvector · SQLite'],
                ['AI / LLM', 'OpenAI API · Ollama · Agentic Pipelines · Prompt Engineering'],
                ['Cloud & DevOps', 'AWS (EC2, S3, Lambda) · Docker · GitHub Actions'],
                ['Certifications', 'AWS Certified Cloud Practitioner'],
              ].map(([label, val]) => (
                <div key={label} className="r pt-5">
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase
                    text-slate-400 mb-1.5">{label}</div>
                  <div className="text-sm font-semibold text-slate-900">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE CONTAINER ───────────────────────────────────────────── */}
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12">
        {/* Continuous Scroll Progress Timeline Line */}
        <TimelineLine />

        {/* ── EDUCATION ────────────────────────────────────────────────────── */}
        <section id="education" className="py-10 md:py-14 lg:py-20 relative z-10">
          <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-6 md:gap-10 lg:gap-16">
            <div className="r pl-8 md:pl-0">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                02 — Education
              </h2>
            </div>
            <div className="space-y-0">
              <TimelineItem>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">
                      Master of Science, Computer Science
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <span>William Jessup University</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-0 shrink-0">Sep 2024 – Aug 2026</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Systems programming, machine learning, and software architecture. GPA: 4.0.
                </p>
              </TimelineItem>

              <TimelineItem>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">
                      B.S., Software Development
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <span>KCA University</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-0 shrink-0">Apr 2018 – Dec 2022</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Software engineering, database design, and algorithmic problem solving. GPA: 3.6.
                </p>
              </TimelineItem>
            </div>
          </div>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
        <section id="experience" className="py-10 md:py-14 lg:py-20 relative z-10">
          <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-6 md:gap-10 lg:gap-16">
            <div className="r pl-8 md:pl-0">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                03 — Experience
              </h2>
            </div>
            <div className="space-y-0">
              {[
                {
                  role: 'Graduate Researcher (Systems & AI)',
                  company: 'William Jessup University',
                  period: '2024 – Present',
                  desc: 'Designed and built an MCP server integrating AutoML with Google Gemini and Telegram for automated CSV analysis, classification, and metric reporting. Research focus on intelligent software agents and distributed architectures.',
                },
                {
                  role: 'Software Engineer',
                  company: 'Appstec America (Remote)',
                  period: 'Jan 2024 – Sep 2024',
                  desc: 'Optimized Django APIs and React components for an EdTech platform. Cut p95 latency by 40% (520ms → 310ms) through PostgreSQL index tuning and query optimization. Improved Stripe webhook reliability and error handling.',
                },
                {
                  role: 'Backend Engineer (Contract)',
                  company: 'Gre8 Intelligence (Remote)',
                  period: 'Jan 2023 – Dec 2023',
                  desc: 'Built an LLM-powered onboarding and recommendation system serving ~100 users across pilot clients. Developed a document-grounded Q&A assistant using Django and the OpenAI API. Shipped a browser-based real-time video conferencing service over WebSockets.',
                },
              ].map(({ role, company, period, desc }, i) => (
                <TimelineItem key={i}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">{role}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <span>{company}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-0 shrink-0">{period}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">{desc}</p>
                </TimelineItem>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORK ─────────────────────────────────────────────────────────── */}
        <section id="work" className="py-10 md:py-14 lg:py-20 relative z-10">
          <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-6 md:gap-10 lg:gap-16 mb-0">
            <div className="r pl-8 md:pl-0">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                04 — Projects
              </h2>
            </div>
            <div className="space-y-0">
              {PROJECTS.map(({ slug, no, title, tags, desc, poster, videoLength, date, status }) => (
                <TimelineItem key={slug}>
                  <Link href={`/projects/${slug}`} className="group flex gap-4 sm:gap-8 transition-colors" aria-label={`View ${title} demo`}>
                    <span className="font-mono text-[11px] font-bold text-blue-400 mt-1 shrink-0 tracking-widest">{no}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">{title}</h3>
                        <ArrowUpRight className="w-4 h-4 shrink-0 mt-0.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        {/* Poster thumbnail: signals that a demo exists at all. */}
                        {poster && (
                          <div className="relative shrink-0 w-full sm:w-44 aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                            <img
                              src={poster}
                              alt={`Still frame from the ${title} demo`}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-md transition-transform group-hover:scale-110">
                                <PlayCircle className="h-4 w-4 text-slate-900" />
                              </span>
                            </span>
                            {videoLength && (
                              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                                {videoLength}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">{desc}</p>
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                            {date} · {status}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                          <span key={t} className="font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-100 text-slate-600 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </TimelineItem>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY & IMPACT ───────────────────────────────────────────── */}
        <section id="impact" className="py-10 md:py-14 lg:py-20 relative z-10">
          <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-6 md:gap-10 lg:gap-16">
            <div className="r pl-8 md:pl-0">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                05 — Community & Impact
              </h2>
            </div>
            <div className="space-y-0">
              {[
                {
                  role: 'Keynote Speaker',
                  company: 'The Samburu Project',
                  period: '2020 – 2025',
                  desc: 'Delivered keynotes in Los Angeles, contributing to over $340k raised for clean water and education in Samburu, Kenya.',
                },
                {
                  role: 'STEM Mentor',
                  company: 'Samburu High School, Kenya',
                  period: '2020 – 2022',
                  desc: 'Mentored high school students in Mathematics, Sciences, and Computer Studies.',
                },
              ].map(({ role, company, period, desc }, i) => (
                <TimelineItem key={i}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">{role}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <span>{company}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-0 shrink-0">{period}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">{desc}</p>
                </TimelineItem>
              ))}
              <Link href="/gallery" className="group inline-flex items-center gap-1.5 text-[11px] md:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mt-6 ml-8 md:ml-0">
                View impact gallery <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-12 md:py-24 lg:py-40 px-6 md:px-10 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr] gap-5 md:gap-10 lg:gap-16 items-start md:items-end">
          <div className="r mb-2 md:mb-0">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400">
              06 — Contact
            </h2>
          </div>
          <div className="r">
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1] md:leading-[0.9] text-slate-900 mb-6 md:mb-10">
              Let's build<br className="hidden md:block" /> something real.
            </h3>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed mb-3">
              {AVAILABILITY.full}. Based in {LOCATION.label}, open to relocation.
            </p>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed mb-8 md:mb-10">
              Open to {PRIMARY_ROLES}. Also a strong fit for {TARGET_TEAMS.slice(0, -1).join(', ')},
              and {TARGET_TEAMS[TARGET_TEAMS.length - 1]} teams.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <a href={MAILTO}
                className="flex items-center justify-center gap-2 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all w-full sm:w-auto text-center shadow-md">
                {EMAIL} <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="/Leleina_Boaz_Resume.pdf" download
                className="flex items-center justify-center gap-2 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all w-full sm:w-auto text-center shadow-sm">
                Download Resume <Download className="w-4 h-4" />
              </a>
              <div className="flex gap-3 w-full sm:w-auto">
                <a href={SOCIALS.find((s) => s.name === 'GitHub')?.url ?? '#'} target="_blank" rel="noreferrer"
                  className="flex-1 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-slate-100 hover:bg-black hover:text-white transition-all text-center">
                  GitHub
                </a>
                <a href={SOCIALS.find((s) => s.name === 'LinkedIn')?.url ?? '#'} target="_blank" rel="noreferrer"
                  className="flex-1 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-slate-100 hover:bg-black hover:text-white transition-all text-center">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 lg:px-12 py-8 max-w-[1400px] mx-auto flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Boaz Leleina
        </span>
      </footer>

    </div>
  );
}

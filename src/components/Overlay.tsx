'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Download } from 'lucide-react';
import Logo from './Logo';

gsap.registerPlugin(ScrollTrigger);

// ── Typewriter hook (loops forever) ─────────────────────────────────────────
function useTypewriter(lines: string[], speed = 60, linePause = 400) {
  const [display, setDisplay] = useState<string[]>(Array(lines.length).fill(''));
  const [currentLine, setCurrentLine] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
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

    const start = setTimeout(type, 600);
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
      className="absolute left-[31px] md:left-[303px] top-[120px] bottom-[120px] w-[2px] bg-slate-100 dark:bg-slate-800/40 z-10 pointer-events-none origin-top"
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
        className={`absolute left-[1px] md:left-[5px] top-[48px] w-3 h-3 rounded-full transition-all duration-500 border-2 z-20 shrink-0 ${
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
  const [scrolled, setScrolled] = useState(false);

  const { display, currentLine, done } = useTypewriter(['Clean APIs.', 'ML Pipelines.', 'Solid Systems.']);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    gsap.utils.toArray<HTMLElement>('.r').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
          opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
        }
      );
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="w-full font-sans text-slate-900 selection:bg-blue-500 selection:text-white">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/40 backdrop-blur-md border-b border-slate-200/20 shadow-sm' : 'bg-white/95'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between bg-transparent">
          <Link href="/" className="group flex items-center gap-2.5 text-sm font-bold tracking-tight text-slate-900">
            <Logo />
            <span>Boaz Leleina</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.18em] uppercase
            text-slate-500">
            <Link href="/#about" className="hover:text-black transition-colors">About</Link>
            <Link href="/#education" className="hover:text-black transition-colors">Education</Link>
            <Link href="/#experience" className="hover:text-black transition-colors">Experience</Link>
            <Link href="/#work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/gallery" className="hover:text-black transition-colors">Gallery</Link>
            <Link href="/#contact" className="hover:text-black transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <a href="mailto:boazleleina3@gmail.com"
              className="text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full
                bg-slate-100
                hover:bg-black hover:text-white transition-all duration-200">
              Hire me
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative md:min-h-screen">

        {/* ── Mobile portrait: stacks above text (hidden md+) ── */}
        <div className="md:hidden relative w-full overflow-hidden" style={{ marginTop: '56px', height: '300px' }}>
          <img
            src="/boaz-portrait-light.png"
            alt="Boaz Leleina"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 8%', filter: 'brightness(1.24) contrast(1.22)' }}
          />
          {/* Fades portrait into white at the bottom */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 25%, rgba(255,255,255,1) 96%)' }}
          />
        </div>

        {/* ── Desktop portrait: absolute right half (hidden below md) ── */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[48%] pointer-events-none z-0">
          <img
            src="/boaz-portrait-light.png"
            alt="Boaz Leleina"
            className="w-full h-full object-cover object-right-top"
            style={{
              filter: 'brightness(1.24) contrast(1.22)',
              WebkitMaskImage: 'radial-gradient(ellipse at 100% 30%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 70%)',
              maskImage: 'radial-gradient(ellipse at 100% 30%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 70%)',
            }}
          />
        </div>

        {/* ── Hero text ── */}
        <div className="relative z-10 px-6 md:px-12 max-w-full md:max-w-[54%] pt-5 pb-16 md:pt-36">

          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase mb-4 md:mb-8
            text-slate-500 leading-relaxed">
            <span className="text-slate-800 md:text-slate-500">Backend Engineer</span>
            <span className="hidden md:inline"> — </span>
            <span className="text-slate-500"> Seattle, WA</span>
          </p>

          {/* Typewriter title */}
          <h1 className="text-[clamp(32px,8vw,56px)] font-black leading-[1.05] tracking-tight
            text-slate-900 mb-6 md:mb-10 font-mono">
            {display.map((line, i) => (
              <span key={i} className="block">
                {line}
                {i === currentLine && !done && (
                  <span className="inline-block w-[3px] h-[1em] bg-blue-500 ml-1 align-middle animate-pulse" />
                )}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-5 w-full md:w-auto md:pt-8">
            <p className="text-xs md:text-sm text-slate-600 max-w-xs leading-relaxed">
              I leverage distributed systems, machine learning, and clean API architectures to solve real-world data and infrastructure challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="#work"
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-black text-white hover:bg-slate-800 transition-all text-center w-full sm:w-auto shadow-md">
                View work
              </a>
              <a href="/boaz-leleina-resume.pdf" download
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm">
                Resume <Download className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:boazleleina3@gmail.com"
                className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-5 py-3 md:py-2.5 rounded-full
                  bg-slate-100 hover:bg-slate-200 transition-all text-center w-full sm:w-auto">
                Email
              </a>
            </div>

            {/* AI-Generated Recruiter Console */}
            <div className="mt-4 md:mt-6 p-4 sm:p-5 rounded-2xl bg-[#090D16] text-slate-300 border border-slate-800 w-full max-w-sm font-mono shadow-xl relative overflow-hidden hidden md:block">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AI Query: Availability
                </span>
                <span className="text-slate-600">Active</span>
              </div>
              
              <div className="text-[11px] space-y-1.5 leading-relaxed">
                <div className="text-slate-500 text-[10px]">// Parsing boaz-leleina-cv.pdf</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">status</span> = <span className="text-emerald-300">&quot;Open to Work&quot;</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">roles</span> = [<span className="text-emerald-300">&quot;Backend&quot;</span>, <span className="text-emerald-300">&quot;Systems&quot;</span>, <span className="text-emerald-300">&quot;AI&quot;</span>];
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">location</span> = <span className="text-emerald-300">&quot;Seattle, WA&quot;</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">remote</span> = <span className="text-emerald-300">true</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">workAuth</span> = <span className="text-emerald-300">&quot;US Authorized&quot;</span>;
                  <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1.5 align-middle animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-12 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-16 items-start">
          <div className="r">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400
              md:sticky md:top-24">01 — About</p>
          </div>
          <div>
            <p className="r text-2xl md:text-3xl font-light leading-relaxed text-slate-800 mb-7 md:mb-14 tracking-tight">
              From Samburu, Kenya to Silicon Valley. I build data pipelines,
              intelligent software agents, and machine learning models
              engineered to solve environmental and resource challenges at scale.
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
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Continuous Scroll Progress Timeline Line */}
        <TimelineLine />

        {/* ── EDUCATION ────────────────────────────────────────────────────── */}
        <section id="education" className="py-10 md:py-20 relative z-10">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-16">
            <div className="r pl-8 md:pl-0">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                02 — Education
              </p>
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
                  Advanced studies in systems programming, machine learning, and distributed systems. Academic GPA: 4.0.
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
                  Focus on software engineering methodologies, database design, and algorithmic problem solving. Academic GPA: 3.6.
                </p>
              </TimelineItem>
            </div>
          </div>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
        <section id="experience" className="py-10 md:py-20 relative z-10">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-16">
            <div className="r pl-8 md:pl-0">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                03 — Experience
              </p>
            </div>
            <div className="space-y-0">
              {[
                {
                  role: 'Graduate Researcher (Systems & AI)',
                  company: 'William Jessup University, California',
                  period: '2024 – Present',
                  desc: 'Relocated to California for MS in Computer Science (GPA 4.0). Building intelligent software agents, machine learning pipelines, and robust distributed architectures.',
                },
                {
                  role: 'Software Engineer',
                  company: 'Appstec America (Remote)',
                  period: 'Jan 2024 – Sep 2024',
                  desc: 'Optimized Django backend APIs and React frontend components for an EdTech platform. Reduced p95 latency by 40% (520ms to 310ms) via PostgreSQL index tuning and query optimization. Improved Stripe webhook handling.',
                },
                {
                  role: 'Backend Engineer (Contract)',
                  company: 'Gre8 Intelligence (Remote)',
                  period: 'Jan 2023 – Dec 2023',
                  desc: 'Built an LLM-powered business recommendation system and a document-grounded Q&A assistant using Django and the OpenAI API. Developed a browser-based real-time video conferencing service using WebSockets.',
                },
                {
                  role: 'Keynote Speaker & STEM Mentor',
                  company: 'The Samburu Project & STEM Programs',
                  period: '2020 – 2025',
                  desc: 'Delivered keynotes in Los Angeles, contributing to over $340k raised for clean water and education in Samburu, Kenya. Mentored high school students in Mathematics, Chemistry, and Computer Studies.',
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
        <section id="work" className="py-10 md:py-20 relative z-10">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-16 mb-0">
            <div className="r pl-8 md:pl-0">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 md:sticky md:top-24">
                04 — Work
              </p>
            </div>
            <div className="space-y-0">
              {[
                {
                  no: '✦',
                  title: 'Pastoralist Migration ML Model',
                  tags: ['Python', 'Jupyter', 'Scikit-Learn', 'Pandas'],
                  desc: 'A machine learning model mapping pastoralist herd migration patterns in Samburu, Kenya, using climate, rainfall, and NDVI vegetation datasets to optimize grazing resources.',
                },
                {
                  no: '✧',
                  title: 'LLM Resume Agent',
                  tags: ['Python', 'NLP', 'LLM', 'API'],
                  desc: 'An autonomous agent that reads resumes, compares them against job descriptions, outputs compatibility scores, and suggests semantic updates.',
                },
                {
                  no: '✶',
                  title: 'Movies Data Science Pipeline',
                  tags: ['Python', 'Pandas', 'Matplotlib', 'Seaborn'],
                  desc: 'A complete data science pipeline ingesting raw movie databases, performing data cleaning, parsing structural outliers, and rendering descriptive trend visualizations.',
                },
                {
                  no: '✱',
                  title: 'Yelp API Ingestion Pipeline',
                  tags: ['Python', 'Yelp API', 'REST', 'JSON'],
                  desc: 'An API client handling REST pagination, rate limiting, and complex JSON data serialization to build localized geographic datasets.',
                },
              ].map(({ no, title, tags, desc }) => (
                <TimelineItem key={no}>
                  <div className="group flex gap-4 sm:gap-8 transition-colors">
                    <span className="font-mono text-[11px] font-bold text-blue-400 mt-1 shrink-0 tracking-widest">{no}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">{title}</h3>
                        <ArrowUpRight className="w-4 h-4 shrink-0 mt-0.5 text-slate-300 group-hover:text-black transition-colors" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-lg">{desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                          <span key={t} className="font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-100 text-slate-600 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TimelineItem>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-12 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-[180px_1fr] gap-5 md:gap-16 items-start md:items-end">
          <div className="r mb-2 md:mb-0">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400">
              05 — Contact
            </p>
          </div>
          <div className="r">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1] md:leading-[0.9] text-slate-900 mb-6 md:mb-10">
              Let's build<br className="hidden md:block" /> something real.
            </h2>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed mb-8 md:mb-10">
              Open to senior systems engineering, backend developer, and remote backend software roles.
              Based in Seattle, WA — available for remote and hybrid positions.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <a href="mailto:boazleleina3@gmail.com"
                className="flex items-center justify-center gap-2 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all w-full sm:w-auto text-center shadow-md">
                boazleleina3@gmail.com <ArrowUpRight className="w-4 h-4" />
              </a>
              <a href="/boaz-leleina-resume.pdf" download
                className="flex items-center justify-center gap-2 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all w-full sm:w-auto text-center shadow-sm">
                Download Resume <Download className="w-4 h-4" />
              </a>
              <div className="flex gap-3 w-full sm:w-auto">
                <a href="https://github.com/boazleleina" target="_blank" rel="noreferrer"
                  className="flex-1 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-slate-100 hover:bg-black hover:text-white transition-all text-center">
                  GitHub
                </a>
                <a href="https://linkedin.com/in/boaz-leleina" target="_blank" rel="noreferrer"
                  className="flex-1 text-[11px] md:text-sm font-bold px-6 py-4 md:py-3.5 rounded-full bg-slate-100 hover:bg-black hover:text-white transition-all text-center">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Boaz Leleina
        </span>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          Built from systems.
        </span>
      </footer>

    </div>
  );
}

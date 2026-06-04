'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Clock, Tag } from 'lucide-react';
import Logo from '@/components/Logo';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
  codeSnippet?: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'pastoralist-migration-ml',
    title: 'Modeling Pastoralist Migration in Samburu with Machine Learning',
    description: 'Using Remote Sensing, NDVI Vegetation Indexes, and climate/rainfall datasets to map herd routes and predict drought impact in Northern Kenya.',
    date: 'June 2, 2026',
    readTime: '6 min read',
    category: 'Data Science',
    codeSnippet: `# Python code calculating rolling NDVI (Normalized Difference Vegetation Index) anomaly scores
import pandas as pd
import numpy as np

def calculate_ndvi_anomaly(df, baseline_years=5):
    # Calculate baseline historical mean for each calendar month
    historical_mean = df[df['year'] < (df['year'].max() - baseline_years)] \
        .groupby('month')['ndvi'].mean().to_dict()
    
    # Calculate anomaly: current NDVI minus historical baseline mean
    df['ndvi_baseline'] = df['month'].map(historical_mean)
    df['ndvi_anomaly'] = df['ndvi'] - df['ndvi_baseline']
    
    # Flag regions showing acute drought risk (anomaly < -1.5 std dev)
    threshold = df['ndvi_anomaly'].std() * -1.5
    df['drought_warning'] = df['ndvi_anomaly'] < threshold
    return df`,
    content: `
Pastoralist communities in Samburu, Kenya, depend heavily on herd migration to locate grazing lands and water resources. Historically, these migration routes were planned using traditional knowledge. However, escalating climate variability and prolonged droughts have made traditional patterns less predictable, risking herd starvation and resource conflict.

By leveraging remote sensing data, we can model vegetation density and rainfall patterns to assist in predicting optimal migration pathways.

### Ingesting remote sensing datasets
We utilize Normalized Difference Vegetation Index (NDVI) satellite imagery alongside local meteorological rainfall indexes. The NDVI values measure the "greenness" of the ground canopy, which is directly correlated to available pasture:
1. **NDVI Ingestion**: Parse MODIS satellite datasets to extract regional NDVI profiles at a 250m resolution.
2. **Rainfall Indexes**: Standardized Precipitation Index (SPI) values derived from weather stations map historical water table shifts.

### Machine learning route prediction
Using Pandas and Scikit-Learn, we build a rolling anomaly classification model. By calculating deviations from historical NDVI baselines, the model predicts when key grazing zones will dry out up to 30 days in advance, allowing communities to map migration routes to areas with resilient pasture.
`
  },
  {
    id: 'resume-tailoring-agent',
    title: 'Building an Autonomous LLM Agent for Resume Tailoring',
    description: 'How to use Python, semantic similarity metrics, and LLMs to construct an assistant that grades and optimizes resume alignment.',
    date: 'May 25, 2026',
    readTime: '7 min read',
    category: 'Artificial Intelligence',
    codeSnippet: `# LLM-powered resume evaluator chunk parsing prompt
import openai

def evaluate_resume_alignment(resume_text, job_description):
    system_prompt = "You are a professional technical recruiter grading resume alignment."
    user_prompt = f\"\"\"
    Compare the following resume text to the job description.
    Provide a compatibility score (0-100) and three bullet points of specific improvements.
    
    Resume: {resume_text}
    Job Description: {job_description}
    Format output strictly as JSON: {{"score": 85, "improvements": ["...", "..."]}}
    \"\"\"
    
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content`,
    content: `
Tailoring resumes for modern Applicant Tracking Systems (ATS) is a highly repetitive task. To streamline this process, we can build an autonomous agent that reads a resume, compares it semantically to a job description, and recommends structural updates.

### Semantic comparison
Instead of simple word-matching (which is easily bypassed), the agent uses embedding models to calculate cosine similarity between resume project descriptions and the required skills of a job posting. 

### LLM grading loop
Once gaps are identified, the agent formats a structured request to an LLM (like GPT-4o). The prompt instructs the model to act as an expert technical recruiter, outputting:
1. A numerical score indicating current semantic alignment.
2. Actionable phrasing updates to highlight relevant engineering competencies without fabricating experience.

By implementing this pipeline, developers can quickly analyze and tailor their profiles to emphasize the exact skills sought by recruiters.
`
  },
  {
    id: 'api-data-ingestion-pipelines',
    title: 'Designing Resilient Third-Party API Ingestion Pipelines',
    description: 'Tackling rate limiting, pagination, and JSON serialization in Python when consuming external REST services.',
    date: 'May 10, 2026',
    readTime: '5 min read',
    category: 'Systems',
    codeSnippet: `# Python wrapper handling pagination and rate limiting with backoff
import time
import requests

def fetch_paginated_api(url, params, max_retries=5):
    all_results = []
    backoff = 1.0
    
    while url:
        response = requests.get(url, params=params)
        
        # Handle Rate Limiting (HTTP 429)
        if response.status_code == 429:
            time.sleep(backoff)
            backoff *= 2  # Exponential backoff
            continue
            
        response.raise_for_status()
        data = response.json()
        all_results.extend(data.get('results', []))
        
        # Traverse Next Link
        url = data.get('next_page_url')
        backoff = 1.0  # Reset backoff on success
    return all_results`,
    content: `
Consuming third-party APIs (such as Yelp, Google Maps, or meteorological endpoints) is a staple of data engineering. However, public APIs impose strict constraints on rate limits and response formatting. 

A production-grade ingestion client must build defensive wrappers around network calls to guarantee complete and consistent data capture.

### 1. Robust Rate Limiting with Exponential Backoff
When api keys are throttled, they return HTTP 429 (Too Many Requests). A robust client shouldn't crash; instead, it should pause execution and retry after an exponentially increasing delay (e.g. 1s, 2s, 4s, 8s).

### 2. Stream Ingestion and Serialization
For large datasets, loading everything into memory is memory-intensive. Ingestion pipelines should write chunks immediately to disk or database tables, serializing incoming JSON payloads and handling missing fields gracefully to ensure clean pipelines.
`
  }
];

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
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
            <Link href="/#work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/blog" className="text-black transition-colors">Blog</Link>
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-24">
        {selectedPost ? (
          // ── SINGLE POST VIEW ───────────────────────────────────────────
          <article className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {selectedPost.category}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              {selectedPost.title}
            </h1>

            <p className="text-xs font-mono text-slate-400 mb-10">{selectedPost.date}</p>

            <div className="text-base text-slate-700 leading-relaxed space-y-6 whitespace-pre-line pt-8">
              {selectedPost.content}
            </div>

            {selectedPost.codeSnippet && (
              <div className="mt-10 rounded-xl overflow-hidden bg-slate-900 p-6 font-mono text-xs text-slate-300">
                <pre><code>{selectedPost.codeSnippet}</code></pre>
              </div>
            )}
          </article>
        ) : (
          // ── INDEX BLOG VIEW ────────────────────────────────────────────
          <div className="grid md:grid-cols-[180px_1fr] gap-16 items-start">
            <div>
              <h1 className="text-[clamp(32px,4vw,56px)] font-black leading-none tracking-tighter text-slate-900 mb-6">
                Blog
              </h1>
              <p className="text-xs text-slate-500 max-w-[150px] leading-relaxed">
                Thoughts, deep dives, and notes on systems engineering.
              </p>
            </div>

            <div className="space-y-2">
              {BLOG_POSTS.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group py-10 px-6 -mx-6 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-3">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:opacity-85 transition-opacity mb-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex items-start md:items-center">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2
                      bg-slate-100 text-slate-600 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                      Read Post <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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

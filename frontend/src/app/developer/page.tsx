'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mail, Cpu, Sparkles, 
  Terminal, ShieldCheck, Globe, Star, ChevronRight 
} from 'lucide-react';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function DeveloperPage() {
  const skills = [
    { name: 'Android / Kotlin', level: 'Expert', icon: <Cpu size={14} /> },
    { name: 'Java Ecosystem', level: 'Expert', icon: <Cpu size={14} /> },
    { name: 'Next.js / TypeScript', level: 'Advanced', icon: <Terminal size={14} /> },
    { name: 'Node.js / SQL / Prisma', level: 'Advanced', icon: <Terminal size={14} /> },
    { name: 'On-Device AI / Ollama', level: 'Intermediate', icon: <Sparkles size={14} /> },
  ];

  const highlights = [
    {
      title: 'Material 3 First',
      desc: 'Committed to Android Material You specifications, offering dynamic user-centric layouts and rich interactions.',
    },
    {
      title: 'Privacy By Design',
      desc: 'Developing tools that store data locally with zero analytics, cookies, or hidden cloud sync tracking logs.',
    },
    {
      title: 'AI Optimization',
      desc: 'Integrating lightweight models (LLMs, vision) locally to build smart mobile apps without heavy server bills.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 md:space-y-5">
      {/* Back button */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-primary transition-colors gap-1 group bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-soft"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>
      {/* 1. Profile introduction */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-soft flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Mock avatar */}
        <div className="w-32 h-32 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-primary font-black text-4xl shadow-soft">
          MD
        </div>

        <div className="space-y-4 text-center md:text-left flex-grow">
          <div className="space-y-1">
            <span className="text-[10px] bg-primary/10 text-primary font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Lead Software Engineer
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight pt-1">Manav Dutt</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Founder, ManavsTech Ecosystem</p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed max-w-lg font-medium">
            Building fast, beautiful, offline-first, and AI-powered mobile experiences. Dedicated to creating software that is intuitive, secure, and built to run locally on your device.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2.5 sm:gap-4">
            <a 
              href="https://github.com/manavdutt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 hover:text-primary rounded-xl transition-all shadow-soft flex items-center gap-1.5 text-xs font-bold"
            >
              <GithubIcon size={16} /> GitHub Profile
            </a>
            <a 
              href="https://linkedin.com/in/manavdutt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 hover:text-primary rounded-xl transition-all shadow-soft flex items-center gap-1.5 text-xs font-bold"
            >
              <LinkedinIcon size={16} /> LinkedIn
            </a>
            <a 
              href="mailto:manav@manavstech.com" 
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 hover:text-primary rounded-xl transition-all shadow-soft flex items-center gap-1.5 text-xs font-bold"
            >
              <Mail size={16} /> Email Contact
            </a>
          </div>
        </div>
      </div>

      {/* 2. Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((h, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
              <ShieldCheck size={16} />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">{h.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">{h.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. Engineering Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left stack card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-5">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-2">Technical Skills Stack</h3>
          <div className="space-y-3">
            {skills.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl bg-muted-custom/30 text-xs font-semibold">
                <div className="flex items-center space-x-2.5 text-gray-700">
                  {s.icon}
                  <span>{s.name}</span>
                </div>
                <span className="text-primary text-[10px] font-black uppercase tracking-wider">{s.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right timeline card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-5">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-2">Software Philosophy</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-semibold">
            "A modern application should not compromise user security for visual delight, nor sacrifice responsiveness for feature complexity. The perfect app works instantly, runs offline, adapts to dynamic OS themes, and respects database limits."
          </p>
          <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800">
            <Globe size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ecosystem Expansion</p>
              <p className="text-emerald-600 mt-0.5">My upcoming projects focus on compiling local vector repositories on Android to serve local AI bots without external latency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

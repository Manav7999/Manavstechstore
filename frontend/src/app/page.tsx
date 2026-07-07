'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, Download, Users, 
  ArrowRight, Search, Cpu, ArrowUpRight, Flame, Award
} from 'lucide-react';
import { appsApi, categoriesApi, AppData, Category } from '../lib/api';
import AppCard from '../components/AppCard';
import { GridSkeleton } from '../components/SkeletonLoader';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomePage() {
  const [featuredApps, setFeaturedApps] = useState<AppData[]>([]);
  const [trendingApps, setTrendingApps] = useState<AppData[]>([]);
  const [editorsChoice, setEditorsChoice] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Smart Search states
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<{ app: AppData; score: number }[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [hasSearchedAi, setHasSearchedAi] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [allApps, cats] = await Promise.all([
          appsApi.getAll(),
          categoriesApi.getAll()
        ]);
        
        // Filter groups
        setFeaturedApps(allApps.filter(a => a.isFeatured));
        setTrendingApps(allApps.filter(a => a.isTrending));
        setEditorsChoice(allApps.filter(a => a.isEditorsChoice));
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load landing page datasets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    setHasSearchedAi(true);
    try {
      const results = await appsApi.aiSearch(aiQuery);
      setAiResults(results);
    } catch (err) {
      console.error('AI query process failed:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleTryExample = (prompt: string) => {
    setAiQuery(prompt);
    // Submit query automatically
    setIsAiSearching(true);
    setHasSearchedAi(true);
    appsApi.aiSearch(prompt)
      .then(results => setAiResults(results))
      .catch(err => console.error(err))
      .finally(() => setIsAiSearching(false));
  };

  // Stats Counters
  const stats = [
    { label: 'Apps Published', value: '12+', icon: <Cpu size={16} /> },
    { label: 'Total Downloads', value: '15k+', icon: <Download size={16} /> },
    { label: 'Active Users', value: '8k+', icon: <Users size={16} /> },
    { label: 'Monthly Updates', value: 'Weekly', icon: <Flame size={16} /> },
  ];

  const samplePrompts = [
    "I need an offline music player",
    "I want to chat securely",
    "A secure markdown note app",
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-8 md:pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/20 via-transparent to-transparent py-10 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-full px-4.5 py-1.5 text-xs text-emerald-800 font-bold"
              >
                <Sparkles size={12} className="fill-emerald-200" />
                <span>Next-Gen App Ecosystem</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight"
              >
                Discover Premium Apps Built by <span className="text-primary">ManavsTech</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Download modern Android applications powered by AI, productivity, communication, utilities and more. Zero bloated trackers. Made with precision.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-primary rounded-full transition-all shadow-soft group"
                >
                  Explore Apps
                  <ArrowRight size={16} className="ml-2 transition-transform" />
                </Link>
                <a
                  href="https://manavstech.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full transition-all shadow-soft"
                >
                  Developer Portfolio
                </a>
              </motion.div>
            </div>

            {/* Right Showcase: Premium Vector Illustration Mockup */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-[400px] bg-white border border-gray-100 rounded-3xl p-4 shadow-soft relative overflow-hidden flex items-center justify-center"
              >
                {/* Visual grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                {/* SVG Vector Graphic */}
                <svg width="100%" height="100%" viewBox="0 0 450 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18AC58" />
                      <stop offset="100%" stopColor="#0f6e38" />
                    </linearGradient>
                    <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#f9fafb" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18AC58" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#18AC58" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18AC58" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.06" />
                    </filter>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="15" result="blur" />
                    </filter>
                  </defs>

                  {/* Background Blur Glow */}
                  <circle cx="225" cy="200" r="120" fill="url(#glowGrad)" filter="url(#glow)" />

                  {/* Dotted Connection Networks */}
                  <path d="M 50 150 C 150 100, 200 250, 350 200" stroke="#18AC58" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.4" />
                  <path d="M 100 280 C 200 220, 250 350, 400 250" stroke="#18AC58" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.3" />

                  {/* Floating Vector Nodes (Pills) */}
                  <circle cx="90" cy="120" r="6" fill="#18AC58" opacity="0.6" className="animate-pulse" />
                  <circle cx="360" cy="220" r="8" fill="#10B981" opacity="0.7" />
                  <circle cx="280" cy="100" r="5" fill="#3B82F6" opacity="0.5" />
                  <circle cx="120" cy="320" r="7" fill="#F59E0B" opacity="0.5" />

                  {/* Isometric Mobile App Showcase Mockup */}
                  {/* Back Screen Frame */}
                  <g transform="translate(140, 80)" filter="url(#shadow)">
                    {/* Device Body */}
                    <rect width="170" height="260" rx="24" fill="#0c1d12" stroke="#18AC58" strokeWidth="3" />
                    {/* Inner screen viewport */}
                    <rect x="6" y="6" width="158" height="248" rx="18" fill="#040b07" />
                    
                    {/* Screen Mockup UI Elements */}
                    {/* Notch / Camera */}
                    <rect x="60" y="12" width="50" height="12" rx="6" fill="#0d1d12" />
                    <circle cx="100" cy="18" r="3" fill="#18AC58" />
                    
                    {/* App Mockup Header Cards */}
                    <rect x="16" y="38" width="138" height="50" rx="10" fill="url(#cardGrad2)" stroke="#18AC58" strokeWidth="0.5" strokeOpacity="0.3" />
                    <circle cx="36" cy="63" r="14" fill="#18AC58" fillOpacity="0.2" />
                    <rect x="58" y="52" width="80" height="6" rx="3" fill="#18AC58" fillOpacity="0.4" />
                    <rect x="58" y="66" width="50" height="5" rx="2.5" fill="#18AC58" fillOpacity="0.25" />

                    {/* Mockup Grid Cards */}
                    <rect x="16" y="98" width="64" height="64" rx="10" fill="url(#cardGrad2)" stroke="#18AC58" strokeWidth="0.5" strokeOpacity="0.2" />
                    <rect x="26" y="108" width="20" height="20" rx="5" fill="#10B981" fillOpacity="0.3" />
                    <rect x="26" y="136" width="44" height="5" rx="2.5" fill="#18AC58" fillOpacity="0.3" />
                    <rect x="26" y="146" width="30" height="4" rx="2" fill="#18AC58" fillOpacity="0.15" />

                    <rect x="90" y="98" width="64" height="64" rx="10" fill="url(#cardGrad2)" stroke="#18AC58" strokeWidth="0.5" strokeOpacity="0.2" />
                    <rect x="100" y="108" width="20" height="20" rx="5" fill="#3B82F6" fillOpacity="0.3" />
                    <rect x="100" y="136" width="44" height="5" rx="2.5" fill="#18AC58" fillOpacity="0.3" />
                    <rect x="100" y="146" width="30" height="4" rx="2" fill="#18AC58" fillOpacity="0.15" />

                    {/* Mockup Bottom Bar */}
                    <rect x="16" y="172" width="138" height="36" rx="10" fill="#18AC58" fillOpacity="0.1" />
                    <rect x="28" y="187" width="114" height="6" rx="3" fill="#18AC58" fillOpacity="0.5" />
                    
                    {/* Install Action Button */}
                    <rect x="16" y="218" width="138" height="22" rx="11" fill="#18AC58" />
                    <rect x="65" y="227" width="40" height="4" rx="2" fill="#ffffff" />
                  </g>

                  {/* Front Floating Glassmorphic App Detail Card */}
                  <g transform="translate(60, 180)" filter="url(#shadow)">
                    <rect width="130" height="110" rx="16" fill="url(#cardGrad1)" stroke="#ffffff" strokeWidth="1" />
                    
                    {/* App icon visual */}
                    <rect x="14" y="14" width="28" height="28" rx="8" fill="#18AC58" />
                    <path d="M 23 20 L 28 25 L 25 28 L 20 23 Z" fill="#ffffff" opacity="0.3" />
                    {/* Sparkle shape */}
                    <path d="M 28 20 L 29.5 22.5 L 32 23 L 29.5 23.5 L 28 26 L 26.5 23.5 L 24 23 L 26.5 22.5 Z" fill="#ffffff" />

                    {/* App Name and Category lines */}
                    <rect x="50" y="16" width="66" height="7" rx="3.5" fill="#1f2937" />
                    <rect x="50" y="29" width="40" height="5" rx="2.5" fill="#9ca3af" />
                    
                    {/* Download Rating details inside floating card */}
                    <circle cx="20" cy="62" r="6" fill="#f59e0b" />
                    <rect x="32" y="60" width="30" height="5" rx="2.5" fill="#f59e0b" fillOpacity="0.4" />
                    
                    {/* Progress Indicator Bar */}
                    <rect x="14" y="82" width="102" height="6" rx="3" fill="#e5e7eb" />
                    <rect x="14" y="82" width="75" height="6" rx="3" fill="#18AC58" />
                  </g>

                  {/* Floating Stats Card (Top Right) */}
                  <g transform="translate(260, 40)" filter="url(#shadow)">
                    <rect width="120" height="65" rx="16" fill="url(#cardGrad1)" stroke="#ffffff" strokeWidth="1" />
                    
                    {/* Small spark line chart */}
                    <path d="M 16 45 Q 36 30, 56 40 T 96 25 T 106 35" stroke="#18AC58" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="14" y="12" width="55" height="6" rx="3" fill="#1f2937" />
                    <rect x="14" y="24" width="35" height="5" rx="2.5" fill="#9ca3af" />
                  </g>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI Smart Search Prompt Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-[#117c3e] rounded-3xl p-6 sm:p-10 text-white shadow-md3 relative overflow-hidden">
          {/* Background visuals */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute left-10 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/3" />

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center space-x-1 bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles size={12} className="fill-white" />
              <span>Smart Search Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ask AI to Find Your Next App
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Describe what tasks you need help with in natural language, and our scoring engine will recommend the perfect utility instantly.
            </p>

            <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl pt-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="e.g. 'I want an offline tool to write down diary notes securely'"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 border-0 rounded-2xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-semibold"
                />
                <Search size={18} className="absolute right-3.5 top-3.5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={isAiSearching}
                className="bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all flex items-center justify-center shrink-0"
              >
                {isAiSearching ? 'Analyzing...' : 'Query AI'}
              </button>
            </form>

            <div className="pt-2">
              <span className="text-xs text-emerald-100 font-bold mr-2 block sm:inline mb-1.5 sm:mb-0">Try typing:</span>
              <div className="inline-flex flex-wrap gap-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTryExample(p)}
                    className="bg-white/10 text-xs text-white px-3 py-1 rounded-full border border-white/10 transition-colors"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Results panel */}
        <AnimatePresence>
          {hasSearchedAi && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border border-primary/20 rounded-3xl p-6 bg-primary/5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4.5">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
                  <Sparkles size={16} className="text-primary" />
                  AI Suggested Applications
                </h3>
                <button
                  onClick={() => {
                    setHasSearchedAi(false);
                    setAiQuery('');
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  Clear Results
                </button>
              </div>

              {isAiSearching ? (
                <div className="py-6 text-center text-sm text-gray-500 font-medium">
                  Calculating keyword semantic vectors...
                </div>
              ) : aiResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiResults.map(({ app, score }) => (
                    <div key={app.id} className="relative">
                      <AppCard app={app} />
                      <span className="absolute -top-2 -right-2 bg-primary text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-soft flex items-center gap-0.5">
                        {Math.min(99, Math.round(score + 30))}% Match
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-500 font-medium">
                  No direct matching application found. Try querying "dialer", "music", "markdown note", or "chat".
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Featured Apps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Editor's Pick</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">Featured Releases</h2>
          </div>
          <Link href="/search" className="text-sm font-bold text-primary flex items-center gap-1">
            See All Apps
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <GridSkeleton />
        ) : featuredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredApps.slice(0, 6).map(app => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="py-12 border border-dashed border-gray-200 rounded-3xl text-center text-sm text-gray-500">
            No featured apps seeded. Go to Dashboard console to create.
          </div>
        )}
      </section>

      {/* 4. Trending & Editor's Choice Carousel */}
      <section className="bg-muted-custom py-10 md:py-16 border-y border-border-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
            {/* Left: Trending */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Flame className="text-red-500" size={20} />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trending Applications</h2>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-20 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                  ))
                ) : trendingApps.length > 0 ? (
                  trendingApps.slice(0, 3).map(app => (
                    <Link
                      href={`/apps/${app.id}`}
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-soft transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img
                          src={app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl}
                          alt={app.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">{app.name}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{app.category?.name}</span>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-gray-400 transition-colors flex-shrink-0 ml-4" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No trending apps found.</p>
                )}
              </div>
            </div>

            {/* Right: Editor's Choice */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Award className="text-amber-500" size={20} />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Editor's Choice</h2>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-20 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                  ))
                ) : editorsChoice.length > 0 ? (
                  editorsChoice.slice(0, 3).map(app => (
                    <Link
                      href={`/apps/${app.id}`}
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-soft transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img
                          src={app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl}
                          alt={app.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">{app.name}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{app.category?.name}</span>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-gray-400 transition-colors flex-shrink-0 ml-4" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No Editor's Choice apps found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download the Store App Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12 shadow-md3">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img
                src={`${BACKEND_URL}/uploads/manavstech-store-icon.png`}
                alt="ManavsTech Store App"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-lg border-2 border-white/10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Text Content */}
            <div className="flex-grow text-center md:text-left space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold mb-1">
                <Download size={11} />
                <span>Native Android App</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Get ManavsTech Store on your Phone
              </h2>
              <p className="text-gray-400 text-sm font-medium max-w-lg">
                Download the official ManavsTech Store Android app and access all apps, updates, and downloads directly from your device — no browser required.
              </p>
            </div>

            {/* Download Button */}
            <div className="flex-shrink-0">
              <a
                href="/ManavsTech-Store.apk"
                download="ManavsTech-Store.apk"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl text-sm whitespace-nowrap"
              >
                <Download size={18} />
                Download APK
              </a>
              <p className="text-gray-500 text-[11px] font-medium text-center mt-2">Android 7.0+ required</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Cpu, Sparkles, LayoutGrid } from 'lucide-react';
import { appsApi, categoriesApi, AppData, Category } from '../../lib/api';
import AppCard from '../../components/AppCard';
import { GridSkeleton } from '../../components/SkeletonLoader';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters from URL
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const offlineParam = searchParams.get('offline') === 'true';
  const aiParam = searchParams.get('aiPowered') === 'true';

  // Component States
  const [apps, setApps] = useState<AppData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State (initialized from URL params)
  const [search, setSearch] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [offline, setOffline] = useState(offlineParam);
  const [aiPowered, setAiPowered] = useState(aiParam);
  const [sort, setSort] = useState('newest');

  // Trigger search updates
  useEffect(() => {
    setSearch(queryParam);
    setCategory(categoryParam);
    setOffline(offlineParam);
    setAiPowered(aiParam);
  }, [queryParam, categoryParam, offlineParam, aiParam]);

  // Load apps based on parameters
  useEffect(() => {
    async function fetchFilteredApps() {
      setIsLoading(true);
      try {
        const data = await appsApi.getAll({
          search,
          category,
          offline,
          aiPowered,
          sort,
        });
        setApps(data);
      } catch (err) {
        console.error('Failed to load apps directory:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFilteredApps();
  }, [search, category, offline, aiPowered, sort]);

  // Load categories list
  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(err => console.error(err));
  }, []);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setOffline(false);
    setAiPowered(false);
    setSort('newest');
    router.push('/search');
  };

  const updateUrlParam = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 md:space-y-6">
      {/* 1. Header Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Application Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Discover utilities, AI productivity solutions, and tools for Android.</p>
        </div>

        {/* Big Search Input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Type app name, pack name, details..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateUrlParam('q', e.target.value);
            }}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Mobile Filters Toggle Button */}
      <button 
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 shadow-soft hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal size={14} />
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* 2. Left Filters Panel (Desktop) */}
        <div className={`${showMobileFilters ? 'block' : 'hidden lg:block'} space-y-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-soft lg:sticky lg:top-24`}>
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary-hover font-bold"
            >
              Reset All
            </button>
          </div>

          {/* Category List Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setCategory('');
                  updateUrlParam('category', '');
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  category === '' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.slug);
                    updateUrlParam('category', c.slug);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    category === c.slug ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-400 py-0.5 px-1.5 rounded-full font-bold">
                    {c._count?.apps || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick filter checkboxes */}
          <div className="space-y-3 pt-3 border-t border-gray-50">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Features</label>
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <input
                type="checkbox"
                checked={offline}
                onChange={(e) => {
                  setOffline(e.target.checked);
                  updateUrlParam('offline', e.target.checked);
                }}
                className="rounded border-gray-200 text-primary focus:ring-primary w-4.5 h-4.5"
              />
              <Cpu size={14} className="text-emerald-500" />
              <span>Offline Apps</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <input
                type="checkbox"
                checked={aiPowered}
                onChange={(e) => {
                  setAiPowered(e.target.checked);
                  updateUrlParam('aiPowered', e.target.checked);
                }}
                className="rounded border-gray-200 text-primary focus:ring-primary w-4.5 h-4.5"
              />
              <Sparkles size={14} className="text-emerald-500" />
              <span>AI Powered</span>
            </label>
          </div>

          {/* Sorting list */}
          <div className="space-y-2 pt-3 border-t border-gray-50">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">Recently Added</option>
              <option value="popular">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 3. Right Apps Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <GridSkeleton />
          ) : apps.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold px-1">
                <span>Showing {apps.length} applications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-soft">
              <LayoutGrid size={48} className="text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-lg">No applications found</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  We couldn't find any applications matching your selection parameters. Try clearing filters.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-soft"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">Loading Catalog...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

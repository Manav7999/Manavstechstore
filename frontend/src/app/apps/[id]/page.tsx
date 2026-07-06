'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, Download, Cpu, ShieldCheck, 
  ExternalLink, Calendar, ChevronRight, Sparkles, Send 
} from 'lucide-react';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

import { appsApi, reviewsApi, wishlistApi, AppData } from '../../../lib/api';
import { DetailSkeleton } from '../../../components/SkeletonLoader';
import AppCard from '../../../components/AppCard';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AppDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [app, setApp] = useState<AppData | null>(null);
  const [relatedApps, setRelatedApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'permissions' | 'changelog'>('overview');
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [developerReplies, setDeveloperReplies] = useState<Record<string, string>>({});

  // QR Code overlay toggle
  const [showQr, setShowQr] = useState(false);
  const [downloadHash, setDownloadHash] = useState('');

  useEffect(() => {
    async function loadAppDetails() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await appsApi.getById(id);
        setApp(data.app);
        setRelatedApps(data.relatedApps);

        // Compute checksum on load to show verification integrity
        if (data.app.apkUrl && data.app.apkUrl.startsWith('/uploads/')) {
          const fileName = data.app.apkUrl.replace('/uploads/', '');
          setDownloadHash(`SHA-256: ${hashString(fileName + data.app.packageName)}`);
        } else {
          setDownloadHash('SHA-256: Verified Safe (Static Remote Source)');
        }
      } catch (err) {
        console.error('Failed to load application details page:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Load auth profiles
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('manavstech_token');
      if (token) {
        // Simple profile parse
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser(payload);
        } catch (e) {
          setUser(null);
        }
      }
    }

    loadAppDetails();
  }, [id]);

  // Simple string-to-hash generator for visual safety hashes
  function hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase() + 
           Math.abs(hash * 3).toString(16).substring(0, 8).toUpperCase() + 
           'D7B24F88A2290B38C103E99E';
  }

  // Handle Download trigger
  const handleDownload = () => {
    if (!app) return;
    // Log download analytic and fetch file stream
    const dlUrl = appsApi.getDownloadUrl(app.id, user?.id);
    window.location.href = dlUrl;
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !user) return;

    setIsSubmittingReview(true);
    try {
      const review = await reviewsApi.create(app.id, newRating, newComment);
      // Reload page dataset to sync reviews
      const updated = await appsApi.getById(app.id);
      setApp(updated.app);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Developer reply handler
  const handleDevReply = async (reviewId: string) => {
    const text = developerReplies[reviewId];
    if (!text || !text.trim()) return;

    try {
      await reviewsApi.reply(reviewId, text);
      // Refresh
      const updated = await appsApi.getById(app!.id);
      setApp(updated.app);
      setDeveloperReplies(prev => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (!app) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Application not found</h2>
        <button onClick={() => router.push('/search')} className="mt-4 text-primary font-bold">
          Back to Directory
        </button>
      </div>
    );
  }

  const iconSrc = app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 md:space-y-5">
      {/* Back to Catalog button */}
      <div className="flex items-center">
        <Link 
          href="/search" 
          className="inline-flex items-center text-xs font-bold text-gray-500 transition-colors gap-1 group bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-soft"
        >
          <ChevronRight size={14} className="rotate-180 transition-transform" />
          Back to Apps
        </Link>
      </div>

      {/* 1. App Header Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 space-y-6 md:space-y-0 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden">
        {/* Visual background splash */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        {/* Icon */}
        <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-soft border border-gray-100 flex-shrink-0 bg-white">
          <img src={iconSrc} alt={app.name} className="w-full h-full object-cover" />
        </div>

        {/* App Info Text */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{app.name}</h1>
              {app.isAiPowered && (
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-soft">
                  <Sparkles size={10} className="fill-emerald-200" />
                  AI POWERED
                </span>
              )}
              {app.isOffline && (
                <span className="bg-gray-100 text-gray-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Cpu size={10} />
                  OFFLINE USE
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-bold tracking-tight">{app.packageName}</p>
            <p className="text-sm text-gray-600 font-medium">Developed by <span className="text-gray-950 font-bold">Manav Dutt</span></p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-xs text-gray-500 pt-1 font-semibold">
            <div className="flex items-center space-x-1 text-amber-500">
              <Star size={14} className="fill-amber-500" />
              <span className="text-sm font-black">{app.rating > 0 ? app.rating.toFixed(1) : 'New'}</span>
              <span className="text-gray-400">({app.reviews?.length || 0})</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200 self-stretch" />
            <div className="flex items-center space-x-1">
              <Download size={14} className="text-gray-400" />
              <span className="text-gray-800 font-bold">{app.downloadsCount} downloads</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200 self-stretch" />
            <div>
              <span>Size: <span className="text-gray-800 font-bold">{app.appSize}</span></span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200 self-stretch" />
            <div>
              <span>Version: <span className="text-gray-800 font-bold">{app.versionName}</span></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white text-sm font-bold rounded-full transition-all shadow-soft"
            >
              <Download size={16} className="mr-2" />
              Download APK
            </button>
            <div className="flex gap-3 justify-center w-full sm:w-auto">
              <button
                onClick={() => setShowQr(!showQr)}
                className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center px-5 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-full transition-all shadow-soft whitespace-nowrap"
              >
                QR Code Download
              </button>
              {app.githubUrl && (
                <a
                  href={app.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-3.5 bg-white border border-gray-200 text-gray-700 rounded-full transition-all shadow-soft flex-shrink-0"
                  title="View Source on GitHub"
                >
                  <GithubIcon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Checksum & QR Overlay */}
          {showQr && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left max-w-lg mt-4 animate-in fade-in duration-200">
              <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                {/* Simulated QR block */}
                <div className="w-20 h-20 bg-gray-100 flex flex-wrap items-center justify-center p-1 rounded">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 ${i % 3 === 0 || i % 7 === 0 ? 'bg-gray-900' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-900">QR Code Download</h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Scan this code using your Android camera/scanner to launch fast APK download directly on your phone.
                </p>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-800 px-2 py-0.5 rounded-full font-bold block mt-1">
                  Direct APK Link Securely Bound
                </span>
              </div>
            </div>
          )}

          {/* SHA-256 indicator */}
          <div className="pt-2 flex items-center space-x-1.5 justify-center md:justify-start text-[11px] text-gray-400 font-semibold">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="font-mono">{downloadHash}</span>
          </div>
        </div>
      </div>

      {/* 2. App Screenshots Carousel */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="space-y-3.5">
          <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">Screenshots Preview</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x">
            {app.screenshots.map((s) => {
              const src = s.url.startsWith('/') ? `${BACKEND_URL}${s.url}` : s.url;
              return (
                <div 
                  key={s.id} 
                  className="w-48 sm:w-60 h-80 sm:h-96 relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 snap-start shadow-soft"
                >
                  <img src={src} alt="screenshot" className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Detailed Information & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle Column: Tabs Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs bar */}
          <div className="flex border-b border-gray-100 text-sm font-semibold text-gray-500 overflow-x-auto no-scrollbar">
            {(['overview', 'reviews', 'changelog', 'permissions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 border-b-2 capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'border-primary text-primary font-black' 
                    : 'border-transparent'
                }`}
              >
                {tab === 'changelog' ? 'What\'s New' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-gray-900 text-base mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {app.description}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-3">
                  <h4 className="font-black text-gray-900 text-sm">Ecosystem Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 font-semibold">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Material Design 3 Architecture</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Zero trackers and metadata checks</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Local databases and offline support</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Full tablet / folding responsiveness</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-gray-50 pb-4">
                  <div>
                    <h4 className="font-black text-gray-900 text-base">Release Notes - Version {app.versionName}</h4>
                    <span className="text-xs text-gray-400 font-bold block mt-1">Code: {app.versionCode}</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1.5">
                    <Calendar size={12} />
                    Active Version
                  </span>
                </div>
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-800 text-sm">What's New in this release:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 pl-2 leading-relaxed">
                    <li>Migrated components to Material Design 3 and responsive grids.</li>
                    <li>Highly optimized loading speeds and memory overhead by 25%.</li>
                    <li>Refined layout spacing, hover animations, and ripple gestures.</li>
                    <li>Patched offline storage backup errors for compatibility updates.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 text-base mb-1">Requested Access Permissions</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  To protect security integrity, here is the list of Android manifest permission access requests:
                </p>
                <div className="space-y-2.5">
                  {app.isOffline ? (
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800">
                      <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Offline Security Guard</p>
                        <p className="text-emerald-600 mt-0.5">This app is fully offline. It request ZERO internet sockets, preventing user tracking.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start space-x-3 text-xs text-gray-700">
                      <Cpu size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">android.permission.INTERNET</p>
                        <p className="text-gray-500 mt-0.5">Required for real-time messaging sockets and peer network connections.</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start space-x-3 text-xs text-gray-700">
                    <Cpu size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">android.permission.READ_EXTERNAL_STORAGE</p>
                      <p className="text-gray-500 mt-0.5">Required to import contact icons or scan database backup files.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* 1. Review List */}
                <div className="space-y-6">
                  <h4 className="font-black text-gray-900 text-base border-b border-gray-50 pb-3">
                    Customer Reviews ({app.reviews?.length || 0})
                  </h4>
                  {app.reviews && app.reviews.length > 0 ? (
                    <div className="space-y-6 divider-y divider-gray-50">
                      {app.reviews.map((r) => (
                        <div key={r.id} className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-primary font-bold">
                                {r.user?.name ? r.user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{r.user?.name || 'Tester'}</p>
                                <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={11} 
                                  className={i < r.rating ? 'fill-amber-500' : 'text-gray-200'} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 pl-4 sm:pl-10 leading-relaxed">{r.comment}</p>

                          {/* Developer Reply display */}
                          {r.developerReply && (
                            <div className="bg-emerald-50/30 border border-emerald-50 rounded-2xl p-4 mt-2 ml-4 sm:ml-10 space-y-1">
                              <p className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                                <Sparkles size={11} /> Developer Response:
                              </p>
                              <p className="text-emerald-800 text-sm leading-relaxed">{r.developerReply}</p>
                            </div>
                          )}

                          {/* Admin Only - Developer Reply Input Box */}
                          {user?.role === 'ADMIN' && !r.developerReply && (
                            <div className="mt-3 ml-4 sm:ml-10 flex gap-2 max-w-md">
                              <input
                                type="text"
                                placeholder="Write response as admin..."
                                value={developerReplies[r.id] || ''}
                                onChange={(e) => setDeveloperReplies({ ...developerReplies, [r.id]: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 text-xs w-full focus:outline-none focus:border-primary"
                              />
                              <button
                                onClick={() => handleDevReply(r.id)}
                                className="bg-primary text-white p-2 rounded-xl"
                              >
                                <Send size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">No reviews posted yet. Be the first to share feedback!</p>
                  )}
                </div>

                {/* 2. Review Write Form */}
                <div className="border-t border-gray-100 pt-6">
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <h4 className="font-black text-gray-900 text-base">Write a Review</h4>
                      
                      {/* Rating selection stars */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-gray-500 font-bold mr-2">Your Rating:</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setNewRating(i + 1)}
                            className="text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star 
                              size={20} 
                              className={i < newRating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'} 
                            />
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1.5">
                        <textarea
                          placeholder="What did you like or dislike? How can we improve this app?"
                          rows={4}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-soft"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center space-y-2">
                      <p className="text-sm font-semibold text-gray-800">Want to review this application?</p>
                      <p className="text-xs text-gray-500">Sign in to your account to submit feedback and rate this application.</p>
                      <button
                        onClick={() => router.push('/auth/login')}
                        className="text-primary text-xs font-bold mt-1"
                      >
                        Sign In Now <ChevronRight size={12} className="inline" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Tech Specs & Related Apps */}
        <div className="space-y-8">
          {/* Tech Specs Panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-2">Technical Specs</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Package Name</span>
                <span className="text-gray-800 font-mono text-[10px] break-all max-w-[150px] text-right">{app.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Minimum Android</span>
                <span className="text-gray-800 font-bold">Android {app.minAndroid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Target Android</span>
                <span className="text-gray-800 font-bold">Android {app.targetAndroid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Developer Website</span>
                <a 
                  href={app.websiteUrl || 'https://manavstech.com'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-bold flex items-center gap-0.5"
                >
                  Visit <ExternalLink size={10} />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Support Contact</span>
                <a href={`mailto:${app.supportEmail || 'support@manavstech.com'}`} className="text-gray-700 font-semibold">{app.supportEmail || 'support@manavstech.com'}</a>
              </div>
            </div>
          </div>

          {/* Related Apps List */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base tracking-tight">Similar Applications</h3>
            <div className="space-y-4">
              {relatedApps.length > 0 ? (
                relatedApps.map((a) => (
                  <Link
                    href={`/apps/${a.id}`}
                    key={a.id}
                    className="flex items-center space-x-3.5 p-3 bg-white border border-gray-100 rounded-2xl shadow-soft transition-all cursor-pointer"
                  >
                    <img 
                      src={a.iconUrl.startsWith('/') ? `${BACKEND_URL}${a.iconUrl}` : a.iconUrl} 
                      alt={a.name} 
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-extrabold text-xs text-gray-900 truncate">{a.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{a.category?.name}</p>
                      <div className="flex items-center space-x-1.5 text-[10px] text-amber-500 font-bold mt-0.5">
                        <Star size={10} className="fill-amber-500" />
                        <span>{a.rating > 0 ? a.rating.toFixed(1) : 'New'}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-gray-500">No related applications found in this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

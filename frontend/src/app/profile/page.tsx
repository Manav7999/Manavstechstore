'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Download, Heart, Star, Sparkles, 
  Trash2, Compass, Cpu, ChevronRight 
} from 'lucide-react';
import { authApi, appsApi, wishlistApi, AppData } from '../../lib/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


export default function ProfilePage() {
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const data = await authApi.getProfile();
      setProfileData(data);

      // Load recommendations based on download history package names
      const dlPackNames = data.downloadHistory.map((h: any) => h.app.packageName);
      const recs = await appsApi.getRecommendations(dlPackNames);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load user profile dataset:', err);
      authApi.logout();
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRemoveWishlist = async (appId: string) => {
    try {
      await wishlistApi.remove(appId);
      // Reload profile
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-500 font-semibold">
        Fetching profile data...
      </div>
    );
  }

  if (!profileData) return null;

  const { user, wishlist, downloadHistory, reviews } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 md:space-y-5">
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
      {/* 1. Profile header badge */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <User size={32} />
        </div>
        <div className="text-center sm:text-left space-y-1 flex-grow">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{user.name}</h1>
          <p className="text-sm text-gray-500 font-semibold">{user.email}</p>
          <span className="inline-block text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase mt-1">
            {user.role} Account
          </span>
        </div>
        <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-wider">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column - Wishlist & Download History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wishlist */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
              <Heart className="text-red-500 fill-red-100" size={20} /> My Wishlist
            </h3>

            {wishlist && wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map((item: any) => (
                  <div key={item.id} className="relative group border border-gray-50 rounded-2xl p-4 bg-muted-custom/30 hover:border-red-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.app.iconUrl.startsWith('/') ? `${BACKEND_URL}${item.app.iconUrl}` : item.app.iconUrl}
                        alt={item.app.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-extrabold text-xs text-gray-900 truncate">{item.app.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.app.versionName}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveWishlist(item.appId)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2 border border-dashed border-gray-100 rounded-2xl">
                <Heart size={24} className="text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-800">Your wishlist is empty</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Explore apps in the store catalog and tap wishlist icons to track releases.</p>
              </div>
            )}
          </div>

          {/* Download History */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
              <Download className="text-primary" size={20} /> Download History
            </h3>

            {downloadHistory && downloadHistory.length > 0 ? (
              <div className="space-y-4">
                {downloadHistory.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-muted-custom/30 text-xs">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <img
                        src={h.app.iconUrl.startsWith('/') ? `${BACKEND_URL}${h.app.iconUrl}` : h.app.iconUrl}
                        alt={h.app.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-gray-900 truncate">{h.app.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Version {h.version}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{new Date(h.downloadedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2 border border-dashed border-gray-100 rounded-2xl">
                <Download size={24} className="text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-800">No downloads tracked yet</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Applications you download from the marketplace will display logs here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Reviews List & Suggestions */}
        <div className="space-y-8">
          {/* Personalized Suggestions */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary fill-emerald-100" /> Suggestions For You
            </h3>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((app) => (
                  <div key={app.id} className="border border-gray-50 p-4 rounded-2xl shadow-soft flex items-center space-x-3 hover:border-emerald-200 transition-colors">
                    <img
                      src={app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl}
                      alt={app.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-grow min-w-0 text-xs">
                      <h4 className="font-extrabold text-gray-900 truncate">{app.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{app.category?.name}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/apps/${app.id}`)}
                      className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      GET
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 font-semibold">No suggestions currently available.</p>
              )}
            </div>
          </div>

          {/* User Reviews */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
              <Star className="text-amber-500 fill-amber-100" size={16} /> My Reviews
            </h3>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="p-4 border border-gray-50 rounded-2xl bg-muted-custom/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800">{r.app.name}</h4>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < r.rating ? 'fill-amber-500' : 'text-gray-200'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-medium">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4 font-semibold">You haven't reviewed any apps yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

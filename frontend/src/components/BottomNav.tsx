'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Search, Heart, User, LayoutDashboard, LogIn } from 'lucide-react';
import { authApi } from '../lib/api';

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [hash, setHash] = useState('');

  useEffect(() => {
    // Listen to hash changes in client-side navigation
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    
    // Check navigation events via interval to catch fast routing
    const interval = setInterval(() => {
      if (window.location.hash !== hash) {
        setHash(window.location.hash);
      }
    }, 200);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, [hash]);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('manavstech_token');
        if (token) {
          authApi.getProfile()
            .then(res => setUser(res.user))
            .catch(() => {
              authApi.logout();
              setUser(null);
            });
        } else {
          setUser(null);
        }
      }
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Determine active state for navigation links
  const isActive = (path: string, matchHash?: string) => {
    if (matchHash) {
      return pathname === path && hash === matchHash;
    }
    if (path === '/profile') {
      return pathname === path && hash !== '#wishlist';
    }
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-lg border-t border-gray-100/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center justify-around">
      {/* 1. Store / Home */}
      <Link 
        href="/" 
        className={`flex flex-col items-center space-y-1 transition-all ${
          isActive('/') ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Compass size={20} className={isActive('/') ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
        <span className="text-[10px] font-bold tracking-tight">Store</span>
      </Link>

      {/* 2. Search */}
      <Link 
        href="/search" 
        className={`flex flex-col items-center space-y-1 transition-all ${
          isActive('/search') ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Search size={20} className={isActive('/search') ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
        <span className="text-[10px] font-bold tracking-tight">Search</span>
      </Link>

      {/* Dynamic Tabs Based on Auth State */}
      {user && (
        <>
          {/* 3. Wishlist */}
          <Link 
            href="/profile#wishlist" 
            className={`flex flex-col items-center space-y-1 transition-all ${
              isActive('/profile', '#wishlist') ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart size={20} className={isActive('/profile', '#wishlist') ? 'stroke-[2.5px] fill-primary/10' : 'stroke-[2px]'} />
            <span className="text-[10px] font-bold tracking-tight">Wishlist</span>
          </Link>

          {/* 4. Account / Profile */}
          <Link 
            href="/profile" 
            className={`flex flex-col items-center space-y-1 transition-all ${
              isActive('/profile')
                ? 'text-primary scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={20} className={isActive('/profile') ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[10px] font-bold tracking-tight">Account</span>
          </Link>

          {/* 5. Admin Dashboard (only for admin) */}
          {user.role === 'ADMIN' && (
            <Link 
              href="/dashboard" 
              className={`flex flex-col items-center space-y-1 transition-all ${
                isActive('/dashboard') ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutDashboard size={20} className={isActive('/dashboard') ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              <span className="text-[10px] font-bold tracking-tight">Admin</span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

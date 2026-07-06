'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  MoreVertical, X, Search, User, LogOut, Heart, 
  Download, LayoutDashboard, Sparkles, Bell 
} from 'lucide-react';
import { authApi } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Scroll visibility states
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-close mobile panels when navigating
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Notifications mock data
  const notifications = [
    { id: 1, text: "CDialer v1.2.4 update is now live!", time: "2h ago" },
    { id: 2, text: "New App 'MPlayer' added to Category", time: "1d ago" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled state
      setIsScrolled(currentScrollY > 10);

      // Smart hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

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

    window.addEventListener('scroll', handleScroll);
    checkAuth();

    // Listen to custom login events if any
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [pathname, lastScrollY]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Apps', href: '/search' },
    { label: 'Categories', href: '/search?tab=categories' },
    { label: 'Developer', href: 'https://manavstech.vercel.app' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 transform ${
      visible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`transition-all duration-300 mt-3 sm:mt-4 mx-2 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto px-4 sm:px-6 py-2.5 rounded-full border bg-white ${
        isScrolled 
          ? 'shadow-md3 border-primary/40' 
          : 'shadow-soft border-gray-100'
      }`}>
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-soft flex items-center justify-center bg-white border border-gray-100 flex-shrink-0">
                <img src="/logo.png" alt="ManavsTech Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900">
                ManavsTech<span className="text-primary">.</span>Store
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search apps or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Nav Items - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 rounded-full transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-md3 p-4 space-y-3 z-50">
                  <h4 className="font-semibold text-sm text-gray-800 border-b border-gray-50 pb-2">Notifications</h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs text-gray-600 p-2 rounded-xl transition-colors">
                        <p className="font-medium text-gray-800">{n.text}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    href="/dashboard"
                    title="Admin Dashboard"
                    className="p-2 text-gray-500 rounded-full transition-all"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-500 rounded-full transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full transition-all shadow-soft"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Search Toggle Icon */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsOpen(false);
              }}
              className={`p-2 rounded-xl transition-all ${
                isSearchOpen ? 'text-primary bg-primary/5' : 'text-gray-600'
              }`}
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* User icon on mobile when logged in */}
            {user && (
              <Link href="/profile" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
                {user.name.charAt(0).toUpperCase()}
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setIsSearchOpen(false);
              }}
              className="p-2 text-gray-600 rounded-xl focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <MoreVertical size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {isSearchOpen && (
        <div className="md:hidden bg-white mt-2 mx-2 sm:mx-6 rounded-3xl border border-gray-100 p-4 shadow-md3 animate-in fade-in slide-in-from-top-5 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search apps or ask AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-3 text-gray-400 transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white mt-2 mx-2 sm:mx-6 rounded-3xl border border-gray-100 p-4 space-y-4 shadow-md3 animate-in fade-in slide-in-from-top-5 duration-200">

          {/* Links */}
          <div className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href ? 'bg-primary/5 text-primary' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === 'ADMIN' && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 flex items-center space-x-2"
              >
                <LayoutDashboard size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 flex items-center space-x-2"
                >
                  <User size={16} />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-red-600 flex items-center space-x-2 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-2xl transition-all shadow-soft"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

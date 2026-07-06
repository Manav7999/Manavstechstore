'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, Compass, ChevronRight } from 'lucide-react';

const GithubIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-github ${className}`}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

import { authApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user already logged in, redirect
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('manavstech_token');
      if (token) {
        router.push('/');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await authApi.login(email, password);
      } else {
        await authApi.register(email, password, name);
      }
      
      // Dispatch authentication sync event
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication process failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock social login integrations
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    setIsLoading(true);

    const mockEmail = provider === 'google' ? 'google-tester@gmail.com' : 'github-tester@gmail.com';
    const mockName = provider === 'google' ? 'Google Authenticated User' : 'GitHub Developer Profile';

    try {
      await authApi.socialLogin(mockEmail, mockName, provider, `mock_${provider}_id_${Date.now()}`);
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError('Social authentication integration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-4">
      {/* Back button */}
      <div className="flex justify-start">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-primary transition-colors gap-1 group bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-soft"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md3 space-y-6 relative overflow-hidden"
      >
        {/* Splash Accent */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg mx-auto shadow-soft">
            M
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {isLogin ? 'Access your store profile' : 'Join ManavsTech Ecosystem'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                <User size={13} /> Name
              </label>
              <input
                type="text"
                placeholder="Manav Dutt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <Lock size={13} /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-2xl transition-all shadow-soft hover:shadow-md3 hover:-translate-y-0.5"
          >
            {isLoading ? 'Signing processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <span className="relative bg-white px-3 z-10">Or Connect With</span>
        </div>

        {/* Third-party buttons */}
        <div className="grid grid-cols-1">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center py-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer text-xs font-bold text-gray-700 w-full"
          >
            <Compass size={14} className="text-red-500 mr-2" />
            Google
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-gray-500 hover:text-primary font-bold transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

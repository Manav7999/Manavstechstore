'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 bg-primary hover:bg-primary-hover text-white rounded-full shadow-md3 hover:-translate-y-1 hover:shadow-soft transition-all duration-200 cursor-pointer border border-primary/20 flex items-center justify-center animate-none"
      title="Back to Top"
    >
      <ArrowUp size={20} className="stroke-[2.5]" />
    </button>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Keep splash screen visible for 1.5s
    const fadeTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Destroy the DOM node after the 500ms exit transition finishes
    const destroyTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {shouldRender && (
        <div 
          className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-all duration-500 ease-out ${
            loading ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center space-y-8">
            {/* Custom Logo */}
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl md:rounded-[2rem] overflow-hidden shadow-soft border border-gray-100 bg-white transition-all duration-300">
              <img src="/logo.png" alt="ManavsTech Store Logo" className="w-full h-full object-cover" />
            </div>

            {/* Spinner loader container */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="loader"></div>
            </div>
          </div>
        </div>
      )}
      {children}
    </QueryClientProvider>
  );
}

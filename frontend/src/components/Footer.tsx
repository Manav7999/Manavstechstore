import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#18AC58] rounded-t-[2.5rem] py-10 mt-0 shadow-[0_-8px_30px_rgba(24,172,88,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/90 font-semibold gap-3">
        <p>© {currentYear} ManavsTech. All rights reserved.</p>
        <p className="text-white/80 font-medium">
          Developed by <span className="text-white font-black drop-shadow-sm">Manav Dutt</span>
        </p>
      </div>
    </footer>
  );
}

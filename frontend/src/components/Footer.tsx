import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border-custom py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-semibold gap-3">
        <p>© {currentYear} ManavsTech. All rights reserved.</p>
        <p className="text-gray-400 font-medium">
          Developed by <span className="text-primary font-bold">Manav Dutt</span>
        </p>
      </div>
    </footer>
  );
}

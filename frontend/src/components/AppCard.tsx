'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Download, Cpu, Sparkles } from 'lucide-react';
import { AppData } from '../lib/api';

interface AppCardProps {
  app: AppData;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AppCard({ app }: AppCardProps) {
  // Solve static asset URLs from backend or mock images
  const iconSrc = app.iconUrl.startsWith('/') ? `${BACKEND_URL}${app.iconUrl}` : app.iconUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-custom border border-border-custom rounded-3xl p-5 shadow-soft flex flex-col justify-between h-full"
    >
      <Link href={`/apps/${app.id}`} className="flex items-start space-x-4 cursor-pointer">
        {/* App Icon */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 bg-white">
          <img
            src={iconSrc}
            alt={`${app.name} icon`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <h3 className="font-bold text-gray-900 text-base truncate">{app.name}</h3>
            {app.isAiPowered && (
              <span className="text-emerald-500" title="AI Powered">
                <Sparkles size={14} className="fill-emerald-100" />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium mb-2 truncate">
            {app.category?.name || 'Utility'}
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>
      </Link>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Rating */}
          <div className="flex items-center space-x-1 text-amber-500 font-bold">
            <Star size={13} className="fill-amber-500" />
            <span>{app.rating > 0 ? app.rating.toFixed(1) : 'New'}</span>
          </div>

          {/* Downloads */}
          <div className="flex items-center space-x-1 font-semibold text-gray-600">
            <Download size={13} />
            <span>{app.downloadsCount > 1000 ? `${(app.downloadsCount / 1000).toFixed(1)}k` : app.downloadsCount}</span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex space-x-1.5">
          {app.isOffline && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 gap-0.5">
              <Cpu size={10} />
              Offline
            </span>
          )}
          {app.isAiPowered && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              AI
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

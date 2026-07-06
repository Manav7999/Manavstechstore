import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-card-custom border border-border-custom rounded-3xl p-5 shadow-soft flex items-center space-x-4 shimmer">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex space-x-2 pt-1">
          <div className="h-3.5 bg-gray-200 rounded-full w-12" />
          <div className="h-3.5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 shimmer">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 space-y-6 md:space-y-0">
        <div className="w-32 h-32 bg-gray-200 rounded-3xl flex-shrink-0" />
        <div className="flex-1 space-y-4 w-full text-center md:text-left">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto md:mx-0" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto md:mx-0" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto md:mx-0" />
          <div className="flex justify-center md:justify-start space-x-4">
            <div className="h-10 bg-gray-200 rounded-xl w-32" />
            <div className="h-10 bg-gray-200 rounded-xl w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border-custom">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2 text-center">
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-3xl" />
    </div>
  );
}

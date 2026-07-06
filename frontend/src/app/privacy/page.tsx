import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-gray-100 pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Effective Date: July 6, 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <p className="text-sm text-gray-600 leading-relaxed font-semibold">
          At ManavsTech Store, we prioritize user security and data privacy above all. This Privacy Policy documents how we distribute and manage packages without compromising on confidentiality.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <EyeOff className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">1. Zero Tracking Analytics</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                We do not inject third-party ad trackers, geolocation trackers, or profiling logs into our applications (such as CDialer, MPlayer, and MyNote). All applications operate on your device without transmitting data to remote servers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <Lock className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">2. Account Security</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                User accounts (created via Email or Google/GitHub social login adapters) are used solely to manage reviews, catalog wishlists, and track download history. We never share account metrics or email addresses with advertisers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <ShieldCheck className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">3. Package Verification</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                Every APK file compiled by Manav Dutt is scanned, signed, and indexed with its SHA-256 hash. The download server checks file integrity on streaming to prevent man-in-the-middle package injections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

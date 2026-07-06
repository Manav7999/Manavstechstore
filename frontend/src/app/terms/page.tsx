import React from 'react';
import { ShieldCheck, Scale, AlertOctagon } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-gray-100 pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-gray-500">Effective Date: July 6, 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <p className="text-sm text-gray-600 leading-relaxed font-semibold">
          By accessing or downloading applications from ManavsTech Store, you agree to comply with the terms of software usage outlined below.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <Scale className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">1. Distribution License</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                The applications downloaded from this store are distributed under direct developer licensing by Manav Dutt. You may install them on personal devices. Commercial redistribution, decompiling, or re-packaging without written consent is strictly prohibited.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <ShieldCheck className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">2. Security Responsibility</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                We provide SHA-256 integrity verification hashes for all builds. It is the user's responsibility to verify that the downloaded package matches the hash to ensure security.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 text-xs text-gray-700">
            <AlertOctagon className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">3. Disclaimer of Liability</h4>
              <p className="text-gray-500 leading-relaxed mt-1">
                Software is provided "as is" without warranty of any kind. The developer is not liable for issues arising from compatibility bugs, system adjustments, or hardware specs limitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CookieDashboard } from '@/components/CookieDashboard';

export default function CookieManagementPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Management</h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Control your cookie preferences, view your privacy settings, and manage 
              how your data is processed across all your devices.
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <CookieDashboard />
      </div>
    </div>
  );
}

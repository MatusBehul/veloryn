'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VelorynLogo } from '@/components/VelorynLogo';
import { CookieSettingsModal } from '@/components/CookieSettingsModal';
import { useTranslation } from '@/hooks/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <VelorynLogo variant="light" size="lg" />
            </div>
            <p className="text-slate-300 mb-4">
              {t('advanced_financial_intelligence_ai')}
            </p>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">
                <strong>{t('important_disclaimer_footer')}</strong> {t('disclaimer_full_text')}
              </p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('company_section')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white">
                  {t('privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white">
                  {t('terms_of_service')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-300 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-slate-300 hover:text-white">
                  Accessibility
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setShowCookieSettings(true)}
                  className="text-slate-300 hover:text-white text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('copyright_text')}
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              {t('built_with_standards')}
            </p>
          </div>
        </div>
      </div>
      
      <CookieSettingsModal 
        isOpen={showCookieSettings} 
        onClose={() => setShowCookieSettings(false)} 
      />
    </footer>
  );
}

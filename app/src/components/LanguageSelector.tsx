'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { isLanguageSupported, SUPPORTED_LANGUAGES } from '@/lib/languages/manager';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { language, updateLanguage, isLoading, isAuthenticated } = useLanguage();

  const handleLanguageChange = async (newLanguage: string) => {
    if (isLanguageSupported(newLanguage) && newLanguage !== language) {
      const success = await updateLanguage(newLanguage);
      if (!success) {
        // Handle error - maybe show a toast notification
        console.error('Failed to update language');
      }
    }
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isLoading}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${language === lang.code 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {lang.flag} {lang.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isLoading}
        className={`
          appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-gray-700
          text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
      
      {/* Dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

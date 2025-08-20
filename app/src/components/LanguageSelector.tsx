'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLanguageFlag, getLanguageName } from '@/lib/languages';

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showText?: boolean;
  variant?: 'dropdown' | 'tabs' | 'pills';
}

export function LanguageSelector({ 
  className = '', 
  showFlag = true, 
  showText = true,
  variant = 'dropdown'
}: LanguageSelectorProps) {
  const { currentLanguage, setCurrentLanguage, availableLanguages, getTranslation } = useLanguage();

  if (availableLanguages.length <= 1) {
    return null; // Don't show selector if only one language available
  }

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label={getTranslation('select_language')}
        >
          {availableLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {showFlag && `${getLanguageFlag(language.code)} `}
              {showText && getLanguageName(language.code)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentLanguage === language.code
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            aria-label={`${getTranslation('switch_language')} ${getLanguageName(language.code)}`}
          >
            {showFlag && (
              <span className="mr-1">{getLanguageFlag(language.code)}</span>
            )}
            {showText && (
              <span>{getLanguageName(language.code)}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentLanguage === language.code
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={`${getTranslation('switch_language')} ${getLanguageName(language.code)}`}
          >
            {showFlag && (
              <span className="mr-1">{getLanguageFlag(language.code)}</span>
            )}
            {showText && (
              <span>{getLanguageName(language.code)}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

// Compact version for headers/navigation
export function LanguageSelectorCompact({ className = '' }: { className?: string }) {
  return (
    <LanguageSelector 
      className={className}
      showText={false}
      variant="pills"
    />
  );
}

// Full version for settings pages
export function LanguageSelectorFull({ className = '' }: { className?: string }) {
  return (
    <LanguageSelector 
      className={className}
      showFlag={true}
      showText={true}
      variant="dropdown"
    />
  );
}

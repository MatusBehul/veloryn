'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  Language, 
  DEFAULT_LANGUAGE, 
  getLanguageByCode, 
  getAvailableLanguagesFromAnalysis,
  getUITranslation,
  UITranslationKey 
} from '@/lib/languages';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  availableLanguages: Language[];
  setAvailableLanguages: (languages: Language[]) => void;
  getTranslation: (key: UITranslationKey) => string;
  isLanguageAvailable: (languageCode: string) => boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(initialLanguage || DEFAULT_LANGUAGE);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([getLanguageByCode(DEFAULT_LANGUAGE)!]);

  // Load saved language preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
        setCurrentLanguageState(savedLanguage);
      }
    }
  }, [availableLanguages]);

  const setCurrentLanguage = (language: string) => {
    setCurrentLanguageState(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', language);
    }
  };

  const getTranslation = (key: UITranslationKey): string => {
    return getUITranslation(key, currentLanguage);
  };

  const isLanguageAvailable = (languageCode: string): boolean => {
    return availableLanguages.some(lang => lang.code === languageCode);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage,
    availableLanguages,
    setAvailableLanguages,
    getTranslation,
    isLanguageAvailable
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Custom hook for handling analysis data with language support
export function useAnalysisLanguage(analysisData: any) {
  const { currentLanguage, setCurrentLanguage, setAvailableLanguages } = useLanguage();

  useEffect(() => {
    if (analysisData) {
      const availableLanguages = getAvailableLanguagesFromAnalysis(analysisData);
      setAvailableLanguages(availableLanguages);
      
      // If current language is not available in this analysis, switch to first available
      if (!availableLanguages.some(lang => lang.code === currentLanguage)) {
        if (availableLanguages.length > 0) {
          setCurrentLanguage(availableLanguages[0].code);
        }
      }
    }
  }, [analysisData, currentLanguage, setCurrentLanguage, setAvailableLanguages]);

  // Get analysis data for current language
  const getCurrentLanguageAnalysis = () => {
    if (!analysisData || typeof analysisData !== 'object') {
      return null;
    }

    // Try current language first
    if (analysisData[currentLanguage]) {
      return analysisData[currentLanguage];
    }

    // Fallback to English
    if (analysisData[DEFAULT_LANGUAGE]) {
      return analysisData[DEFAULT_LANGUAGE];
    }

    // Fallback to first available language
    const firstAvailable = Object.keys(analysisData)[0];
    return firstAvailable ? analysisData[firstAvailable] : null;
  };

  return {
    currentAnalysis: getCurrentLanguageAnalysis(),
    hasMultipleLanguages: Object.keys(analysisData || {}).length > 1
  };
}

// Utility function to check if analysis has multiple languages
export function hasMultipleLanguages(analysisData: any): boolean {
  return Object.keys(analysisData || {}).length > 1;
}

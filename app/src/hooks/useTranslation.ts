'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getUITranslation, UITranslationKey, DEFAULT_LANGUAGE } from '@/lib/languages/manager';

export function useTranslation() {
  const { user } = useAuth();
  
  // Get user's preferred language or default to English
  const currentLanguage = user?.preferredLanguage || DEFAULT_LANGUAGE;
  
  // Translation function
  const t = (key: UITranslationKey): string => {
    return getUITranslation(key, currentLanguage);
  };
  
  return {
    t,
    currentLanguage
  };
}

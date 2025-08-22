'use client';

import { useEffect, useState } from 'react';
import { getUITranslation, UITranslationKey, DEFAULT_LANGUAGE } from '@/lib/languages/manager';
import { useLanguage } from './useLanguage';

/**
 * Hook for getting UI translations with SSR support
 * This hook ensures that the same content is rendered on server and client initially
 */
export function useTranslation() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = (key: UITranslationKey): string => {
    // Always use default language until client-side hydration is complete
    // This prevents hydration mismatches
    const languageToUse = isClient ? language : DEFAULT_LANGUAGE;
    return getUITranslation(key, languageToUse);
  };

  return {
    t,
    language: isClient ? language : DEFAULT_LANGUAGE,
    isReady: isClient,
  };
}

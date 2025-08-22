'use client';

import { useEffect, useState } from 'react';
import { getUITranslation, UITranslationKey, DEFAULT_LANGUAGE } from '@/lib/languages/manager';
import { useTranslation } from '@/hooks/useTranslation';

interface SafeTranslationProps {
  translationKey: UITranslationKey;
  fallback?: string;
}

/**
 * Component that safely renders translations without hydration issues
 * Shows the fallback or English translation initially, then updates to the correct language
 */
export function SafeTranslation({ translationKey, fallback }: SafeTranslationProps) {
  const { t, isReady } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use fallback or English translation during SSR and initial render
  if (!mounted || !isReady) {
    return <>{fallback || getUITranslation(translationKey, DEFAULT_LANGUAGE)}</>;
  }

  // Use the actual translation after hydration
  return <>{t(translationKey)}</>;
}

/**
 * Higher-order component to make any component with translations SSR-safe
 */
export function withSafeTranslation<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  return function SafeTranslationWrapper(props: T) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      // Return a skeleton or simplified version during SSR
      return null;
    }

    return <Component {...props} />;
  };
}

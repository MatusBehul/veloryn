'use client';

import { useEffect } from 'react';
import { hasAnalyticsConsent } from '@/lib/cookieConsent';

interface AnalyticsProps {
  googleAnalyticsId?: string;
}

export function ConditionalAnalytics({ googleAnalyticsId = 'GA_MEASUREMENT_ID' }: AnalyticsProps) {
  useEffect(() => {
    // Only load Google Analytics if user has consented
    if (hasAnalyticsConsent()) {
      loadGoogleAnalytics(googleAnalyticsId);
    }
    
    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'veloryn-cookie-consent') {
        if (hasAnalyticsConsent()) {
          loadGoogleAnalytics(googleAnalyticsId);
        } else {
          // Disable analytics if consent was withdrawn
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
              analytics_storage: 'denied'
            });
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [googleAnalyticsId]);

  return null; // This component doesn't render anything
}

function loadGoogleAnalytics(measurementId: string) {
  // Only load if not already loaded
  if (typeof window !== 'undefined' && !(window as any).gtag) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', measurementId, {
        analytics_storage: 'granted',
        ad_storage: 'denied', // We don't use ads
        personalization_storage: 'denied',
        security_storage: 'granted',
      });
    };
  }
}

// Alternative: Direct script injection for Next.js
export function AnalyticsScript({ googleAnalyticsId = 'GA_MEASUREMENT_ID' }: AnalyticsProps) {
  if (typeof window !== 'undefined' && !hasAnalyticsConsent()) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}', {
              analytics_storage: 'granted',
              ad_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted',
            });
          `,
        }}
      />
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCookieConsent, 
  setCookieConsent, 
  isConsentRequired,
  type CookiePreferences 
} from '@/lib/cookieConsent';

export function CookieBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    if (isConsentRequired()) {
      setIsVisible(true);
      
      // Load existing preferences if any
      const existingConsent = getCookieConsent();
      if (existingConsent) {
        setPreferences(existingConsent.preferences);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      essential: true,
      analytics: true,
    };
    setCookieConsent(allPreferences, true, true, user?.id, 'banner');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
    };
    setCookieConsent(essentialOnly, false, true, user?.id, 'banner');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(preferences, preferences.analytics, true, user?.id, 'banner');
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Cannot disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showPreferences ? (
          // Main banner
          <div className="py-4">
            <div className="flex items-start space-x-4">
              <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We use cookies to enhance your experience, analyze traffic, and for security. 
                  You can accept all, reject all, or customize your preferences. See our{' '}
                  <Link href="/cookies" className="text-blue-600 underline hover:text-blue-800">
                    Cookie Policy
                  </Link>{' '}
                  for more details.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium inline-flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Preferences
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Preferences panel
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close preferences"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 bg-gray-100 cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-500">Always On</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    These cookies are necessary for the website to function and cannot be switched off. 
                    They include authentication, security, language and basic functionality cookies. Includes also favourite tickers in case of membership to be able provide the service.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start space-x-3 border-t pt-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us understand how visitors use our site to improve performance and user experience.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={handleSavePreferences}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Reject All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to get current cookie preferences
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setPreferences(consent.preferences);
    }
  }, []);

  return preferences;
}

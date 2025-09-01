'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCookieConsent, 
  setCookieConsent,
  type CookiePreferences 
} from '@/lib/cookieConsent';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    if (isOpen) {
      // Load current preferences
      const consent = getCookieConsent();
      if (consent) {
        setPreferences(consent.preferences);
      }
    }
  }, [isOpen]);

  const handleSavePreferences = () => {
    setCookieConsent(preferences, preferences.analytics, true, user?.id, 'settings');
    onClose();
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Cannot disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cookie Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Manage your cookie preferences. You can enable or disable different types of cookies below. 
              Note that essential cookies cannot be disabled as they are required for the site to function.
            </p>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
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
                <p className="text-sm text-gray-600">
                  These cookies are necessary for the website to function and cannot be switched off. 
                  They include authentication, security, language and basic functionality cookies. Includes also favourite tickers in case of membership to be able provide the service.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Examples: Login sessions, security tokens, form submissions
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies help us understand how visitors interact with our website by 
                  collecting and reporting information anonymously.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Examples: Google Analytics, page views, user behavior tracking
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

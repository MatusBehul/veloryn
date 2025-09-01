'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeToCookiePreferenceChanges,
  getCookieChangeHistory,
  type CookieChangeLog 
} from '@/lib/cookieFirestore';
import { 
  getCookieConsent, 
  setCookieConsent, 
  syncCookiePreferencesOnLogin,
  type CookiePreferences 
} from '@/lib/cookieConsent';

interface UseCookiePreferencesReturn {
  preferences: CookiePreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (
    preferences: CookiePreferences, 
    analyticsCookie?: boolean, 
    essentialCookie?: boolean,
    source?: 'banner' | 'settings' | 'api'
  ) => void;
  changeHistory: CookieChangeLog[];
  refreshHistory: () => void;
  isFirestoreConnected: boolean;
}

/**
 * Hook to manage cookie preferences with Firestore integration for logged-in users
 */
export function useCookiePreferences(): UseCookiePreferencesReturn {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changeHistory, setChangeHistory] = useState<CookieChangeLog[]>([]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  // Load initial preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user?.id) {
          // User is logged in - sync with Firestore
          const syncedPreferences = await syncCookiePreferencesOnLogin(user.id);
          setPreferences(syncedPreferences);
          setIsFirestoreConnected(true);
        } else {
          // User is not logged in - use localStorage only
          const localConsent = getCookieConsent();
          setPreferences(localConsent?.preferences || null);
          setIsFirestoreConnected(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
        // Fallback to localStorage
        const localConsent = getCookieConsent();
        setPreferences(localConsent?.preferences || null);
        setIsFirestoreConnected(false);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Subscribe to Firestore changes when user is logged in
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToCookiePreferenceChanges(
      user.id,
      (updatedPreferences) => {
        setPreferences(updatedPreferences);
        setIsFirestoreConnected(true);
      },
      (error) => {
        console.error('Error subscribing to cookie changes:', error);
        setError(error.message);
        setIsFirestoreConnected(false);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Load change history for logged-in users
  const refreshHistory = useCallback(async () => {
    if (!user?.id) {
      setChangeHistory([]);
      return;
    }

    try {
      const history = await getCookieChangeHistory(user.id, 20);
      setChangeHistory(history);
    } catch (error) {
      console.error('Error loading cookie change history:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Update preferences function
  const updatePreferences = useCallback(
    (
      newPreferences: CookiePreferences, 
      analyticsCookie?: boolean, 
      essentialCookie?: boolean,
      source: 'banner' | 'settings' | 'api' = 'settings'
    ) => {
      try {
        const analyticsValue = analyticsCookie ?? newPreferences.analytics;
        const essentialValue = essentialCookie ?? true;
        setCookieConsent(newPreferences, analyticsValue, essentialValue, user?.id, source);
        setPreferences(newPreferences);
        setError(null);
        
        // Refresh history to show the latest change
        if (user?.id) {
          setTimeout(refreshHistory, 500); // Small delay to ensure Firestore write is complete
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preferences');
      }
    },
    [user?.id, refreshHistory]
  );

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    changeHistory,
    refreshHistory,
    isFirestoreConnected,
  };
}

/**
 * Hook to check if user has consented to analytics tracking
 */
export function useAnalyticsConsent(): boolean {
  const { preferences } = useCookiePreferences();
  return preferences?.analytics ?? false;
}

/**
 * Hook to monitor cookie preference changes and trigger callbacks
 */
export function useCookiePreferenceMonitor(
  onPreferenceChange?: (preferences: CookiePreferences) => void
) {
  const { preferences } = useCookiePreferences();
  const [previousPreferences, setPreviousPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    if (preferences && previousPreferences) {
      // Check if preferences actually changed
      if (JSON.stringify(preferences) !== JSON.stringify(previousPreferences)) {
        onPreferenceChange?.(preferences);
      }
    }
    setPreviousPreferences(preferences);
  }, [preferences, previousPreferences, onPreferenceChange]);
}

/**
 * Hook to get cookie consent status with loading state
 */
export function useCookieConsent() {
  const { preferences, loading, error, updatePreferences } = useCookiePreferences();
  
  const hasConsent = preferences !== null;
  const hasAnalyticsConsent = preferences?.analytics ?? false;
  const hasEssentialConsent = preferences?.essential ?? true;

  return {
    hasConsent,
    hasAnalyticsConsent,
    hasEssentialConsent,
    preferences,
    loading,
    error,
    updatePreferences,
  };
}

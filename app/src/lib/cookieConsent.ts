// Cookie consent utilities
import { 
  saveCookiePreferencesToFirestore, 
  getCookiePreferencesFromFirestore,
  syncCookiePreferences 
} from '@/lib/cookieFirestore';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('veloryn-cookie-consent');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.preferences.analytics ?? false;
}

export function setCookieConsent(
  preferences: CookiePreferences, 
  analyticsCookie: boolean,
  essentialCookie: boolean,
  userId?: string, 
  source: 'banner' | 'settings' | 'api' = 'settings'
): void {
  if (typeof window === 'undefined') return;
  
  const consent: CookieConsent = {
    preferences,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  // Always save to localStorage first for immediate availability
  localStorage.setItem('veloryn-cookie-consent', JSON.stringify(consent));
  
  // Apply cookie preferences to third-party services
  applyConsentToServices(preferences);
  
  // Save to Firestore if user is logged in
  if (userId) {
    saveCookiePreferencesToFirestore(userId, preferences, analyticsCookie, essentialCookie, source).catch(error => {
      console.error('Failed to save cookie preferences to Firestore:', error);
    });
  }
}

export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('veloryn-cookie-consent');
}

/**
 * Sync cookie preferences when user logs in
 * This ensures Firestore and localStorage are in sync
 */
export async function syncCookiePreferencesOnLogin(userId: string): Promise<CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean }> {
  const localConsent = getCookieConsent();
  const localPreferences = localConsent?.preferences || null;
  
  try {
    const syncedPreferences = await syncCookiePreferences(userId, localPreferences);
    
    // Update localStorage with synced preferences
    setCookieConsent(
      { essential: syncedPreferences.essential, analytics: syncedPreferences.analytics }, 
      syncedPreferences.analyticsCookie, 
      syncedPreferences.essentialCookie, 
      userId, 
      'api'
    );
    
    return syncedPreferences;
  } catch (error) {
    console.error('Error syncing cookie preferences on login:', error);
    // Fallback to local preferences or defaults
    const fallbackPreferences = localPreferences || { essential: true, analytics: false };
    const fallbackAnalyticsCookie = fallbackPreferences.analytics;
    const fallbackEssentialCookie = true;
    setCookieConsent(fallbackPreferences, fallbackAnalyticsCookie, fallbackEssentialCookie, userId, 'api');
    return { 
      ...fallbackPreferences, 
      analyticsCookie: fallbackAnalyticsCookie, 
      essentialCookie: fallbackEssentialCookie 
    };
  }
}

/**
 * Get cookie preferences with Firestore fallback for logged-in users
 */
export async function getCookieConsentForUser(userId?: string): Promise<CookieConsent | null> {
  // First try localStorage for immediate response
  const localConsent = getCookieConsent();
  
  // If user is logged in, try to get from Firestore as well
  if (userId) {
    try {
      const firestorePreferences = await getCookiePreferencesFromFirestore(userId);
      if (firestorePreferences) {
        // Create consent object with Firestore preferences
        const firestoreConsent: CookieConsent = {
          preferences: {
            essential: firestorePreferences.essential,
            analytics: firestorePreferences.analytics
          },
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        // Update localStorage to match Firestore
        if (!localConsent || JSON.stringify(localConsent.preferences) !== JSON.stringify(firestoreConsent.preferences)) {
          localStorage.setItem('veloryn-cookie-consent', JSON.stringify(firestoreConsent));
        }
        
        return firestoreConsent;
      }
    } catch (error) {
      console.error('Error getting Firestore preferences, falling back to localStorage:', error);
    }
  }
  
  return localConsent;
}

/**
 * Get complete cookie preferences including the new boolean fields for logged-in users
 */
export async function getFullCookiePreferences(userId?: string): Promise<(CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean }) | null> {
  if (!userId) {
    // For non-logged-in users, return local preferences with default boolean values
    const localConsent = getCookieConsent();
    if (localConsent) {
      return {
        ...localConsent.preferences,
        analyticsCookie: localConsent.preferences.analytics,
        essentialCookie: true
      };
    }
    return null;
  }

  try {
    const firestorePreferences = await getCookiePreferencesFromFirestore(userId);
    return firestorePreferences;
  } catch (error) {
    console.error('Error getting full cookie preferences:', error);
    // Fallback to local preferences
    const localConsent = getCookieConsent();
    if (localConsent) {
      return {
        ...localConsent.preferences,
        analyticsCookie: localConsent.preferences.analytics,
        essentialCookie: true
      };
    }
    return null;
  }
}

function applyConsentToServices(preferences: CookiePreferences): void {
  // Google Analytics consent
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
    });
  }
  
  // You can add other third-party service consent updates here
}

// Check if consent is needed (no consent or old version)
export function isConsentRequired(): boolean {
  const consent = getCookieConsent();
  if (!consent) return true;
  
  // Check if version is outdated
  const currentVersion = '1.0';
  return consent.version !== currentVersion;
}

// Get consent age in days
export function getConsentAge(): number | null {
  const consent = getCookieConsent();
  if (!consent) return null;
  
  const consentDate = new Date(consent.timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - consentDate.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

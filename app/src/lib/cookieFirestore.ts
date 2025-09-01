import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  onSnapshot, 
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import type { CookiePreferences, CookieConsent } from '@/lib/cookieConsent';

export interface CookieConsentFirestore extends Omit<CookieConsent, 'timestamp'> {
  userId: string;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  source: 'banner' | 'settings' | 'api';
  revision: number; // Track revisions for each save
  analyticsCookie: boolean;
  essentialCookie: boolean;
}

export interface CookieChangeLog {
  userId: string;
  previousPreferences: CookiePreferences & { analyticsCookie?: boolean; essentialCookie?: boolean };
  newPreferences: CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean };
  timestamp: Timestamp;
  source: 'banner' | 'settings' | 'api';
  ipAddress?: string;
  userAgent?: string;
  revision: number;
}

export interface CookieRevision {
  userId: string;
  preferences: CookiePreferences;
  analyticsCookie: boolean;
  essentialCookie: boolean;
  timestamp: Timestamp;
  source: 'banner' | 'settings' | 'api';
  revision: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Get current cookie consent data including revision information
 */
async function getCurrentCookieConsent(userId: string): Promise<CookieConsentFirestore | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'users', userId, 'privacy', 'cookieConsent');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CookieConsentFirestore;
    }
    return null;
  } catch (error) {
    console.error('Error getting current cookie consent:', error);
    return null;
  }
}

/**
 * Save cookie preferences to Firestore for logged-in users
 */
export async function saveCookiePreferencesToFirestore(
  userId: string,
  preferences: CookiePreferences,
  analyticsCookie: boolean,
  essentialCookie: boolean,
  source: 'banner' | 'settings' | 'api' = 'settings'
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('Firestore not available, skipping cookie save');
    return;
  }

  try {
    // Get current preferences to determine next revision number
    const currentConsent = await getCurrentCookieConsent(userId);
    const nextRevision = currentConsent ? currentConsent.revision + 1 : 1;
    
    const consentData: CookieConsentFirestore = {
      userId,
      preferences,
      analyticsCookie,
      essentialCookie,
      timestamp: serverTimestamp() as Timestamp,
      version: '1.0',
      source,
      revision: nextRevision,
      // Optionally add IP and user agent for compliance logging
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
    };

    // Save current preferences to users/{userId}/privacy/cookieConsent
    await setDoc(doc(db, 'users', userId, 'privacy', 'cookieConsent'), consentData);

    // Create a revision document in the cookieRevisions subcollection
    const revisionData: CookieRevision = {
      userId,
      preferences,
      analyticsCookie,
      essentialCookie,
      timestamp: serverTimestamp() as Timestamp,
      source,
      revision: nextRevision,
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
    };

    await addDoc(collection(db, 'users', userId, 'cookieRevisions'), revisionData);

    // Log the change if this isn't the first revision
    if (currentConsent) {
      await logCookiePreferenceChange(
        userId, 
        { 
          ...currentConsent.preferences, 
          analyticsCookie: currentConsent.analyticsCookie, 
          essentialCookie: currentConsent.essentialCookie 
        },
        { 
          ...preferences, 
          analyticsCookie, 
          essentialCookie 
        }, 
        source,
        nextRevision
      );
    }

    console.log('Cookie preferences saved to Firestore for user:', userId, 'Revision:', nextRevision);
  } catch (error) {
    console.error('Error saving cookie preferences to Firestore:', error);
    throw error;
  }
}

/**
 * Get cookie preferences from Firestore for logged-in users
 */
export async function getCookiePreferencesFromFirestore(
  userId: string
): Promise<(CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean }) | null> {
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }

  try {
    const docRef = doc(db, 'users', userId, 'privacy', 'cookieConsent');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CookieConsentFirestore;
      return {
        ...data.preferences,
        analyticsCookie: data.analyticsCookie,
        essentialCookie: data.essentialCookie
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie preferences from Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to cookie preference changes for a user
 */
export function subscribeToCookiePreferenceChanges(
  userId: string,
  onUpdate: (preferences: CookiePreferences) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('Firestore not available, cannot subscribe to cookie changes');
    return () => {};
  }

  const docRef = doc(db, 'users', userId, 'privacy', 'cookieConsent');
  
  return onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data() as CookieConsentFirestore;
        onUpdate(data.preferences);
      }
    },
    (error) => {
      console.error('Error subscribing to cookie preference changes:', error);
      onError?.(error);
    }
  );
}

/**
 * Log cookie preference changes for audit trail
 */
async function logCookiePreferenceChange(
  userId: string,
  previousPreferences: CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean },
  newPreferences: CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean },
  source: 'banner' | 'settings' | 'api',
  revision: number
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const changeLog: CookieChangeLog = {
      userId,
      previousPreferences,
      newPreferences,
      timestamp: serverTimestamp() as Timestamp,
      source,
      revision,
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
    };

    await addDoc(collection(db, 'users', userId, 'cookieChangeLogs'), changeLog);
    console.log('Cookie preference change logged for user:', userId, 'Revision:', revision);
  } catch (error) {
    console.error('Error logging cookie preference change:', error);
  }
}

/**
 * Get cookie preference change history for a user
 */
export async function getCookieChangeHistory(
  userId: string,
  limitCount: number = 10
): Promise<CookieChangeLog[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'users', userId, 'cookieChangeLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as CookieChangeLog);
  } catch (error) {
    console.error('Error getting cookie change history:', error);
    return [];
  }
}

/**
 * Sync local storage with Firestore preferences
 */
export async function syncCookiePreferences(
  userId: string,
  localPreferences: CookiePreferences | null,
  localAnalyticsCookie?: boolean,
  localEssentialCookie?: boolean
): Promise<CookiePreferences & { analyticsCookie: boolean; essentialCookie: boolean }> {
  try {
    const firestorePreferences = await getCookiePreferencesFromFirestore(userId);
    
    if (firestorePreferences) {
      // Use Firestore as source of truth
      return firestorePreferences;
    } else if (localPreferences) {
      // Save local preferences to Firestore
      const analyticsCookie = localAnalyticsCookie ?? localPreferences.analytics;
      const essentialCookie = localEssentialCookie ?? true;
      await saveCookiePreferencesToFirestore(userId, localPreferences, analyticsCookie, essentialCookie, 'api');
      return { 
        ...localPreferences, 
        analyticsCookie, 
        essentialCookie 
      };
    } else {
      // No preferences anywhere, return defaults
      const defaultPreferences: CookiePreferences = {
        essential: true,
        analytics: false,
      };
      const defaultAnalyticsCookie = false;
      const defaultEssentialCookie = true;
      await saveCookiePreferencesToFirestore(userId, defaultPreferences, defaultAnalyticsCookie, defaultEssentialCookie, 'api');
      return { 
        ...defaultPreferences, 
        analyticsCookie: defaultAnalyticsCookie, 
        essentialCookie: defaultEssentialCookie 
      };
    }
  } catch (error) {
    console.error('Error syncing cookie preferences:', error);
    // Fallback to local preferences or defaults
    const fallbackPrefs = localPreferences || { essential: true, analytics: false };
    return { 
      ...fallbackPrefs, 
      analyticsCookie: localAnalyticsCookie ?? fallbackPrefs.analytics, 
      essentialCookie: localEssentialCookie ?? true 
    };
  }
}

/**
 * Get cookie revision history for a user
 */
export async function getCookieRevisionHistory(
  userId: string,
  limitCount: number = 10
): Promise<CookieRevision[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'users', userId, 'cookieRevisions'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as CookieRevision);
  } catch (error) {
    console.error('Error getting cookie revision history:', error);
    return [];
  }
}

/**
 * Delete all cookie data for a user (for GDPR compliance)
 */
export async function deleteUserCookieData(userId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    // Delete the main cookie consent document
    const consentDocRef = doc(db, 'users', userId, 'privacy', 'cookieConsent');
    await deleteDoc(consentDocRef);

    // Delete all revisions
    const revisionsCollection = collection(db, 'users', userId, 'cookieRevisions');
    const revisionsSnapshot = await getDocs(revisionsCollection);
    
    // Delete each revision document
    const revisionDeletePromises = revisionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(revisionDeletePromises);

    // Delete all change logs
    const changeLogsCollection = collection(db, 'users', userId, 'cookieChangeLogs');
    const changeLogsSnapshot = await getDocs(changeLogsCollection);
    
    // Delete each change log document
    const changeLogDeletePromises = changeLogsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(changeLogDeletePromises);

    console.log('User cookie data deleted successfully');
  } catch (error) {
    console.error('Error deleting user cookie data:', error);
    throw error;
  }
}

/**
 * Get user's IP address for compliance logging
 */
async function getUserIP(): Promise<string | undefined> {
  try {
    // In a production environment, you might want to use a more reliable service
    // or get this from your server-side API
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not get user IP:', error);
    return undefined;
  }
}

/**
 * Export aggregated cookie analytics (for admin dashboard)
 * Note: This function now uses collection group queries to access all cookie consents
 */
export async function getCookieAnalytics(): Promise<{
  totalUsers: number;
  analyticsEnabled: number;
  analyticsDisabled: number;
  lastUpdated: Date;
}> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      totalUsers: 0,
      analyticsEnabled: 0,
      analyticsDisabled: 0,
      lastUpdated: new Date(),
    };
  }

  try {
    // Use collectionGroup to query all cookieConsent documents across all users
    // Note: This requires a composite index in Firestore for collectionGroup queries
    const consentQuery = query(
      collectionGroup(db, 'privacy'),
      where('__name__', '==', 'cookieConsent')
    );
    
    const snapshot = await getDocs(consentQuery);
    
    let analyticsEnabled = 0;
    let analyticsDisabled = 0;
    
    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as CookieConsentFirestore;
      if (data.preferences?.analytics) {
        analyticsEnabled++;
      } else {
        analyticsDisabled++;
      }
    });

    return {
      totalUsers: snapshot.size,
      analyticsEnabled,
      analyticsDisabled,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting cookie analytics:', error);
    // Fallback: count users with cookie preferences using a different approach
    try {
      // Alternative: Query users collection and check for privacy subcollection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalWithPreferences = 0;
      let analyticsEnabled = 0;
      
      // Note: This approach requires reading all user documents, which may not scale well
      // Consider implementing this as a Cloud Function with proper aggregation
      
      return {
        totalUsers: totalWithPreferences,
        analyticsEnabled,
        analyticsDisabled: totalWithPreferences - analyticsEnabled,
        lastUpdated: new Date(),
      };
    } catch (fallbackError) {
      console.error('Fallback analytics query also failed:', fallbackError);
      return {
        totalUsers: 0,
        analyticsEnabled: 0,
        analyticsDisabled: 0,
        lastUpdated: new Date(),
      };
    }
  }
}

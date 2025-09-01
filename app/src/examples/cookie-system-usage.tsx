// Example Usage of the Updated Cookie System

import { 
  saveCookiePreferencesToFirestore,
  getCookiePreferencesFromFirestore,
  getCookieRevisionHistory,
  getCookieChangeHistory
} from '@/lib/cookieFirestore';
import { 
  setCookieConsent,
  getFullCookiePreferences,
  syncCookiePreferencesOnLogin
} from '@/lib/cookieConsent';

// Example 1: Save cookie preferences with new boolean fields
async function saveUserCookiePreferences(userId: string) {
  const preferences = {
    essential: true,
    analytics: true
  };
  
  const analyticsCookie = true;
  const essentialCookie = true;
  
  await saveCookiePreferencesToFirestore(
    userId, 
    preferences, 
    analyticsCookie, 
    essentialCookie, 
    'settings'
  );
  
  console.log('Cookie preferences saved with revision tracking');
}

// Example 2: Get complete cookie preferences including new fields
async function getUserCookiePreferences(userId: string) {
  const fullPreferences = await getCookiePreferencesFromFirestore(userId);
  
  if (fullPreferences) {
    console.log('User preferences:', {
      essential: fullPreferences.essential,
      analytics: fullPreferences.analytics,
      analyticsCookie: fullPreferences.analyticsCookie,
      essentialCookie: fullPreferences.essentialCookie
    });
  }
}

// Example 3: Get revision history for a user
async function getUserCookieHistory(userId: string) {
  // Get revision history (every time preferences are saved)
  const revisionHistory = await getCookieRevisionHistory(userId, 10);
  
  console.log('Cookie revisions:', revisionHistory.map(revision => ({
    revision: revision.revision,
    timestamp: revision.timestamp,
    source: revision.source,
    preferences: revision.preferences,
    analyticsCookie: revision.analyticsCookie,
    essentialCookie: revision.essentialCookie
  })));
  
  // Get change logs (when preferences actually change)
  const changeHistory = await getCookieChangeHistory(userId, 10);
  
  console.log('Cookie changes:', changeHistory.map(change => ({
    revision: change.revision,
    timestamp: change.timestamp,
    source: change.source,
    previousPreferences: change.previousPreferences,
    newPreferences: change.newPreferences
  })));
}

// Example 4: Set cookie consent in UI components
function handleUserCookieSelection() {
  const preferences = {
    essential: true,
    analytics: true
  };
  
  const analyticsCookie = true;
  const essentialCookie = true;
  const userId = 'user123';
  
  setCookieConsent(preferences, analyticsCookie, essentialCookie, userId, 'banner');
}

// Example 5: Sync preferences on login
async function handleUserLogin(userId: string) {
  try {
    const syncedPreferences = await syncCookiePreferencesOnLogin(userId);
    
    console.log('Synced preferences:', {
      essential: syncedPreferences.essential,
      analytics: syncedPreferences.analytics,
      analyticsCookie: syncedPreferences.analyticsCookie,
      essentialCookie: syncedPreferences.essentialCookie
    });
  } catch (error) {
    console.error('Failed to sync cookie preferences on login:', error);
  }
}

// Example 6: Using the updated hook
import { useCookiePreferences } from '@/hooks/useCookiePreferences';

function CookieManagementComponent() {
  const { preferences, updatePreferences, changeHistory } = useCookiePreferences();
  
  const handleUpdatePreferences = () => {
    const newPreferences = {
      essential: true,
      analytics: false
    };
    
    // New signature with boolean fields
    updatePreferences(
      newPreferences,
      false, // analyticsCookie
      true,  // essentialCookie
      'settings'
    );
  };
  
  return (
    <div>
      <h3>Current Preferences</h3>
      <p>Essential: {preferences?.essential ? 'Yes' : 'No'}</p>
      <p>Analytics: {preferences?.analytics ? 'Yes' : 'No'}</p>
      
      <h3>Change History</h3>
      {changeHistory.map((change, index) => (
        <div key={index}>
          <p>Revision: {change.revision}</p>
          <p>Source: {change.source}</p>
          <p>Timestamp: {change.timestamp.toDate().toLocaleString()}</p>
        </div>
      ))}
      
      <button onClick={handleUpdatePreferences}>
        Update Preferences
      </button>
    </div>
  );
}

export default CookieManagementComponent;

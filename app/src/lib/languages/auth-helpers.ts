import { getLanguageManager } from '@/lib/languages/client-manager';

/**
 * Helper function to sync language preferences when user logs in
 * This should be called after successful authentication
 */
export async function syncLanguageOnLogin(firebaseUser: any) {
  try {
    const languageManager = getLanguageManager();
    const token = await firebaseUser.getIdToken();
    
    // Sync language between local storage and server
    await languageManager.syncWithServer(token);
    
    console.log('Language preferences synced successfully');
  } catch (error) {
    console.error('Error syncing language preferences on login:', error);
  }
}

/**
 * Helper function to get the current language for server-side requests
 */
export function getCurrentLanguageForRequest(): string {
  const languageManager = getLanguageManager();
  return languageManager.getCurrentLanguage();
}

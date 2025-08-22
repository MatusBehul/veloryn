'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLanguageManager, LanguageManager } from '@/lib/languages/client-manager';

export function useLanguage() {
  const [language, setLanguage] = useState<string>('en'); // Always start with default
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { firebaseUser } = useAuth();
  
  const languageManager = getLanguageManager();

  useEffect(() => {
    // Force hydration on mount
    languageManager.forceHydration();
    
    // Wait for hydration to complete
    setIsHydrated(true);
    
    // Initialize language from storage after hydration
    const currentLang = languageManager.getCurrentLanguage();
    setLanguage(currentLang);

    // Add listener for language changes
    const handleLanguageChange = (newLanguage: string) => {
      setLanguage(newLanguage);
    };

    languageManager.addListener(handleLanguageChange);

    // Sync with server if user is authenticated
    const syncLanguage = async () => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await languageManager.syncWithServer(token);
        } catch (error) {
          console.error('Error getting token for language sync:', error);
        }
      } else {
        // For non-authenticated users, ensure we're using the stored language
        const storedLang = languageManager.getCurrentLanguage();
        if (storedLang !== language) {
          setLanguage(storedLang);
        }
      }
    };

    syncLanguage();

    // Cleanup
    return () => {
      languageManager.removeListener(handleLanguageChange);
    };
  }, [firebaseUser, languageManager]);

  const updateLanguage = async (newLanguage: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (firebaseUser) {
        // Authenticated user - update both local storage and server
        const token = await firebaseUser.getIdToken();
        const success = await languageManager.setLanguageAuthenticated(newLanguage, token);
        setIsLoading(false);
        return success;
      } else {
        // Non-authenticated user - update local storage only
        languageManager.setLanguageLocal(newLanguage);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Error updating language:', error);
      setIsLoading(false);
      return false;
    }
  };

  return {
    language,
    updateLanguage,
    isLoading,
    isAuthenticated: !!firebaseUser,
    isHydrated, // Expose hydration status
  };
}

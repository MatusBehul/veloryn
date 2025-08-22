'use client';

const LANGUAGE_STORAGE_KEY = 'veloryn_preferred_language';
const DEFAULT_LANGUAGE = 'en';

export class LanguageManager {
  private static instance: LanguageManager;
  private currentLanguage: string = DEFAULT_LANGUAGE;
  private listeners: Set<(language: string) => void> = new Set();
  private isHydrated: boolean = false;

  private constructor() {
    // Don't load from storage during SSR
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.isHydrated = true;
    }
  }

  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  // Load language from local storage
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      this.currentLanguage = stored || DEFAULT_LANGUAGE;
    }
  }

  // Save language to local storage
  private saveToStorage(language: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch (error) {
        console.error('Failed to save language to localStorage:', error);
      }
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    // During SSR or before hydration, always return default
    if (!this.isHydrated) {
      return DEFAULT_LANGUAGE;
    }
    
    // Ensure we have the latest from localStorage for non-authenticated users
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && stored !== this.currentLanguage) {
        this.currentLanguage = stored;
      }
    }
    
    return this.currentLanguage;
  }

  // Get language for SSR-safe usage
  getCurrentLanguageSSR(): string {
    return DEFAULT_LANGUAGE;
  }

  // Check if the manager is hydrated (client-side)
  isClientSide(): boolean {
    return this.isHydrated;
  }

  // Force hydration (useful for client-only components)
  forceHydration(): void {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.isHydrated = true;
      // Notify listeners of the current language after hydration
      this.notifyListeners(this.currentLanguage);
    }
  }

  // Set language for non-authenticated users (local storage only)
  setLanguageLocal(language: string): void {
    this.currentLanguage = language;
    this.saveToStorage(language);
    this.notifyListeners(language);
    
    // Mark as hydrated if we're setting language (means we're on client)
    if (typeof window !== 'undefined') {
      this.isHydrated = true;
    }
  }

  // Set language for authenticated users (both local storage and server)
  async setLanguageAuthenticated(language: string, token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredLanguage: language }),
      });

      if (response.ok) {
        this.currentLanguage = language;
        this.saveToStorage(language);
        this.notifyListeners(language);
        return true;
      } else {
        console.error('Failed to update language on server');
        return false;
      }
    } catch (error) {
      console.error('Error updating language:', error);
      return false;
    }
  }

  // Sync language with server (called on login)
  async syncWithServer(token: string): Promise<void> {
    try {
      // First, try to get the user's language from the server
      const response = await fetch('/api/user/language', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serverLanguage = data.preferredLanguage;
        
        // If server has a language preference, use it
        if (serverLanguage && serverLanguage !== this.currentLanguage) {
          this.currentLanguage = serverLanguage;
          this.saveToStorage(serverLanguage);
          this.notifyListeners(serverLanguage);
        } else if (this.currentLanguage !== DEFAULT_LANGUAGE) {
          // If local storage has a different language, update the server
          await this.setLanguageAuthenticated(this.currentLanguage, token);
        }
        
        // Mark as hydrated after successful sync
        this.isHydrated = true;
      }
    } catch (error) {
      console.error('Error syncing language with server:', error);
      // Still mark as hydrated even if sync fails
      this.isHydrated = true;
    }
  }

  // Add listener for language changes
  addListener(listener: (language: string) => void): void {
    this.listeners.add(listener);
  }

  // Remove listener
  removeListener(listener: (language: string) => void): void {
    this.listeners.delete(listener);
  }

  // Notify all listeners of language change
  private notifyListeners(language: string): void {
    this.listeners.forEach(listener => listener(language));
  }

  // Get language from local storage without instance
  static getStoredLanguage(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  }
}

// Export convenience functions
export const getLanguageManager = () => LanguageManager.getInstance();
export const getStoredLanguage = () => LanguageManager.getStoredLanguage();

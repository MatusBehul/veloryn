'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SUPPORTED_LANGUAGES, getLanguageFlag, getLanguageName } from '@/lib/languages/manager';
import { Check, Globe, ChevronDown } from 'lucide-react';

interface LanguagePreferenceSelectorProps {
  className?: string;
}

export function LanguagePreferenceSelector({ className = '' }: LanguagePreferenceSelectorProps) {
  const { user, firebaseUser, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || 'en');
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update selectedLanguage when user data changes
  useEffect(() => {
    if (user?.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  // Check if current selection differs from saved preference
  useEffect(() => {
    setIsChanged(selectedLanguage !== (user?.preferredLanguage || 'en'));
  }, [selectedLanguage, user?.preferredLanguage]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Don't close dropdown immediately to show the confirm button
  };

  const handleConfirm = async () => {
    if (!firebaseUser || !isChanged) return;

    try {
      setIsSaving(true);

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredLanguage: selectedLanguage }),
      });

      if (response.ok) {
        // Refresh user data to get the updated preference
        if (refreshUser) {
          await refreshUser();
        }
        setIsOpen(false);
        setIsChanged(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to save language preference:', errorData.error);
        // Reset to previous selection
        setSelectedLanguage(user?.preferredLanguage || 'en');
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
      // Reset to previous selection
      setSelectedLanguage(user?.preferredLanguage || 'en');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedLanguage(user?.preferredLanguage || 'en');
    setIsOpen(false);
    setIsChanged(false);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        aria-label="Select preferred language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{getLanguageFlag(currentLanguage.code)}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Preferred Language</h3>
              <p className="text-xs text-gray-500 mt-1">Choose your default language for the interface</p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getLanguageFlag(language.code)}</span>
                    <div>
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-gray-500">{language.name}</div>
                    </div>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="text-blue-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {isChanged && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      Save <strong>{getLanguageName(selectedLanguage)}</strong> as your preferred language?
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

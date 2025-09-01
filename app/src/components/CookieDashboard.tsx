'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Cookie, Settings, Shield, Database, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useCookiePreferences } from '@/hooks/useCookiePreferences';
import { CookiePreferenceHistory } from '@/components/CookiePreferenceHistory';
import { CookieSettingsModal } from '@/components/CookieSettingsModal';
import { useAuth } from '@/contexts/AuthContext';

export function CookieDashboard() {
  const { user } = useAuth();
  const { 
    preferences, 
    loading, 
    error, 
    updatePreferences, 
    isFirestoreConnected 
  } = useCookiePreferences();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Cookie className="h-8 w-8 text-gray-400 animate-pulse mx-auto mb-3" />
            <p className="text-gray-600">Loading cookie preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Preferences</h3>
                <p className="text-red-800 text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleQuickToggle = (type: 'analytics', enabled: boolean) => {
    if (!preferences) return;
    
    const newPreferences = {
      ...preferences,
      [type]: enabled
    };
    updatePreferences(newPreferences, 'settings');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cookie Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your cookie preferences and view your privacy settings.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Cookie Settings
        </button>
      </div>

      {/* Connection Status */}
      <Card className={`border-2 ${isFirestoreConnected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardContent className="py-4">
          <div className="flex items-center space-x-3">
            {isFirestoreConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {isFirestoreConnected ? 'Preferences Synced' : 'Local Storage Only'}
              </h3>
              <p className="text-sm text-gray-700">
                {isFirestoreConnected ? (
                  user ? 
                    'Your cookie preferences are synced across all your devices.' :
                    'Connected to cloud storage.'
                ) : (
                  user ?
                    'Cloud sync temporarily unavailable. Using local storage.' :
                    'Log in to sync your preferences across devices.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Preferences */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center space-x-3 mb-6">
            <Cookie className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Current Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Essential Cookies
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Required for authentication, security, and core functionality
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-700 mr-3">Always On</span>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-blue-600" />
                  Analytics Cookies
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Help us understand how you use our service to improve performance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${preferences?.analytics ? 'text-green-700' : 'text-gray-500'}`}>
                  {preferences?.analytics ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleQuickToggle('analytics', !preferences?.analytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences?.analytics ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences?.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {preferences && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Preference Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Essential cookies: Always enabled for security and functionality</p>
                <p>• Analytics tracking: {preferences.analytics ? 'Enabled' : 'Disabled'}</p>
                {user && (
                  <p>• Account sync: {isFirestoreConnected ? 'Active' : 'Offline'}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User-specific features */}
      {user && (
        <>
          {/* Preference History */}
          <Card>
            <CardContent className="py-6">
              <CookiePreferenceHistory />
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="border-gray-200">
            <CardContent className="py-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sync Status:</span>
                  <span className={`font-medium ${isFirestoreConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isFirestoreConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Location:</span>
                  <span className="font-medium">
                    {isFirestoreConnected ? 'Cloud + Local' : 'Local Only'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Cookie Settings Modal */}
      <CookieSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

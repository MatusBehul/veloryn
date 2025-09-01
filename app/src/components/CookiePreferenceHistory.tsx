'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Clock, User, Settings, Eye, Cookie } from 'lucide-react';
import { useCookiePreferences } from '@/hooks/useCookiePreferences';
import { useAuth } from '@/contexts/AuthContext';

export function CookiePreferenceHistory() {
  const { user } = useAuth();
  const { changeHistory, refreshHistory, isFirestoreConnected, loading } = useCookiePreferences();

  if (!user) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              Log in to view your cookie preference history and sync across devices.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center space-x-3">
            <Cookie className="h-5 w-5 text-gray-600 animate-pulse" />
            <p className="text-gray-600 text-sm">Loading cookie preference history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'banner':
        return <Cookie className="h-4 w-4 text-blue-600" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'api':
        return <Eye className="h-4 w-4 text-purple-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'banner':
        return 'Cookie Banner';
      case 'settings':
        return 'Settings Panel';
      case 'api':
        return 'System Sync';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    try {
      // Handle Firestore Timestamp
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPreferenceChanges = (prev: any, current: any) => {
    const changes = [];
    if (prev.analytics !== current.analytics) {
      changes.push(`Analytics: ${prev.analytics ? 'enabled' : 'disabled'} → ${current.analytics ? 'enabled' : 'disabled'}`);
    }
    return changes.length > 0 ? changes : ['No changes detected'];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Cookie Preference History</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isFirestoreConnected ? 'Synced' : 'Local only'}
          </span>
          <button
            onClick={refreshHistory}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {changeHistory.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-6 text-center">
            <Cookie className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No cookie preference changes recorded yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Changes will appear here when you update your cookie preferences.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {changeHistory.map((change, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSourceIcon(change.source)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getSourceLabel(change.source)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(change.timestamp)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {getPreferenceChanges(change.previousPreferences, change.newPreferences).map((changeText, i) => (
                          <p key={i} className="text-sm text-gray-700">
                            {changeText}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacy & Data Protection</h4>
              <p className="text-blue-800 text-sm">
                This history is stored securely and helps ensure compliance with data protection 
                regulations. You can request deletion of this data at any time by contacting support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

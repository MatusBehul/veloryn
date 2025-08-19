'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteTickers } from '@/hooks/useFavoriteTickers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Bell, Star } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    favoriteTickers,
    loading,
    error,
    addTicker,
    removeTicker,
    toggleDailyUpdates,
  } = useFavoriteTickers();
  
  const [newTicker, setNewTicker] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddTicker = async () => {
    if (!newTicker.trim()) return;

    try {
      setSaving(true);
      await addTicker(newTicker.trim());
      setNewTicker('');
      setSuccessMessage('Ticker added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding ticker:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTicker = async (symbol: string) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol} from your favorites?`)) return;
    try {
      setSaving(true);
      await removeTicker(symbol);
      setSuccessMessage('Ticker removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error removing ticker:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDailyUpdates = async (symbol: string, enabled: boolean) => {
    try {
      setSaving(true);
      await toggleDailyUpdates(symbol, enabled);
      setSuccessMessage(`Daily updates ${enabled ? 'enabled' : 'disabled'} for ${symbol}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error toggling daily updates:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTicker();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access your settings.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your favorite tickers and daily update preferences</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Favorite Tickers Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Favorite Tickers</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Add stock tickers you want to follow. You can enable daily analysis updates for each ticker.
            </p>
          </CardHeader>
          <CardContent>
            {/* Add New Ticker */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter ticker symbol (e.g., AAPL, GOOGL)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={saving}
                />
                <Button 
                  onClick={handleAddTicker}
                  disabled={saving || !newTicker.trim()}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Tickers List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading your favorite tickers...</p>
              </div>
            ) : favoriteTickers.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No favorite tickers yet</p>
                <p className="text-sm text-gray-400">Add some tickers above to get started with daily updates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteTickers.map((ticker) => (
                  <div key={ticker.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <span className="font-mono font-medium text-lg">{ticker.symbol}</span>
                        {ticker.name && (
                          <p className="text-sm text-gray-600">{ticker.name}</p>
                        )}
                        {ticker.dailyUpdates && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full align-middle">Daily</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Daily Updates Toggle */}
                      <div className="flex items-center space-x-2">
                        <Bell className={`h-4 w-4 ${ticker.dailyUpdates ? 'text-green-500' : 'text-gray-400'}`} />
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ticker.dailyUpdates}
                            onChange={(e) => handleToggleDailyUpdates(ticker.symbol, e.target.checked)}
                            disabled={saving}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            ticker.dailyUpdates ? 'bg-green-600' : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              ticker.dailyUpdates ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                        <span className="text-sm text-gray-600">
                          {ticker.dailyUpdates ? 'Daily updates on' : 'Daily updates off'}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTicker(ticker.symbol)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold text-gray-900 mb-2">About Daily Updates</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Daily updates will be sent to your registered email address</p>
              <p>• Updates include AI-generated analysis, technical indicators, and market sentiment</p>
              <p>• You can enable or disable updates for individual tickers at any time</p>
              <p>• Updates are sent on market days (Monday-Friday) before market open</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteTickers } from '@/hooks/useFavoriteTickers';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Bell, Star } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      setSuccessMessage(t('tickerAddedSuccessfully'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding ticker:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTicker = async (symbol: string) => {
    if (!window.confirm(t('removeTickerConfirmation').replace('{symbol}', symbol))) return;
    try {
      setSaving(true);
      await removeTicker(symbol);
      setSuccessMessage(t('tickerRemovedSuccessfully'));
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
      const message = enabled 
        ? t('dailyUpdatesEnabledFor').replace('{symbol}', symbol)
        : t('dailyUpdatesDisabledFor').replace('{symbol}', symbol);
      setSuccessMessage(message);
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
            <h2 className="text-xl font-semibold mb-4">{t('settingsAuthenticationRequired')}</h2>
            <p className="text-gray-600 mb-4">{t('settingsPleaseLogInToAccessSettings')}</p>
            <Link href="/login">
              <Button>{t('settingsGoToLogin')}</Button>
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
            {t('settingsBackToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('settingsTitle')}</h1>
          <p className="text-slate-600">{t('manageFavoriteTickersAndDailyUpdates')}</p>
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
              <span>{t('favoriteTickersSection')}</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              {t('addStockTickersDescription')}
            </p>
          </CardHeader>
          <CardContent>
            {/* Add New Ticker */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <Input
                  placeholder={t('enterTickerSymbol')}
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
                  <span>{t('settingsAdd')}</span>
                </Button>
              </div>
            </div>

            {/* Tickers List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('loadingFavoriteTickers')}</p>
              </div>
            ) : favoriteTickers.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">{t('noFavoriteTickersYetSettings')}</p>
                <p className="text-sm text-gray-400">{t('addSomeTickersAboveToGetStarted')}</p>
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
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full align-middle">{t('dailyBadge')}</span>
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
                          {ticker.dailyUpdates ? t('dailyUpdatesOn') : t('dailyUpdatesOff')}
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
            <h3 className="font-semibold text-gray-900 mb-2">{t('aboutDailyUpdates')}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{t('dailyUpdatesDescription1')}</p>
              <p>{t('dailyUpdatesDescription2')}</p>
              <p>{t('dailyUpdatesDescription3')}</p>
              <p>{t('dailyUpdatesDescription4')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

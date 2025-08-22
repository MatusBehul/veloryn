'use client';

import React from 'react';
import { useFavoriteTickers } from '@/hooks/useFavoriteTickers';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Star, Bell, Plus, Settings } from 'lucide-react';

export function FavoriteTickersWidget() {
  const { favoriteTickers, loading, getTickersWithDailyUpdates } = useFavoriteTickers();
  const { t } = useTranslation();
  const dailyUpdateTickers = getTickersWithDailyUpdates();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>{t('favoriteTickers')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">{t('widgetLoading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>{t('favoriteTickers')}</span>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              {t('manage')}
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteTickers.length === 0 ? (
          <div className="text-center py-6">
            <Star className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">{t('noFavoriteTickersYet')}</p>
            <Link href="/settings">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t('addTickers')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 pb-2 border-b">
              <span>{favoriteTickers.length} {favoriteTickers.length === 1 ? 'ticker' : t('tickers')} {t('tickersTotal')}</span>
              <div className="flex items-center space-x-1">
                <Bell className="h-4 w-4 text-green-500" />
                <span>{dailyUpdateTickers.length} {t('withDailyUpdates')}</span>
              </div>
            </div>

            {/* Tickers List */}
            <div className="space-y-2">
              {favoriteTickers.slice(0, 5).map((ticker) => (
                <div key={ticker.symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-sm">{ticker.symbol}</span>
                    {ticker.name && (
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {ticker.name}
                      </span>
                    )}
                  </div>
                  {ticker.dailyUpdates && (
                    <div title="Daily updates enabled">
                      <Bell className="h-3 w-3 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {favoriteTickers.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="text-xs">
                      {t('viewAllTickers')} {favoriteTickers.length} {t('tickers')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-1" />
                  {t('manageTickersUpdates')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface FavoriteTicker {
  symbol: string;
  name?: string;
  dailyUpdates: boolean;
}

export interface TierInfo {
  currentTier: string;
  limit: number;
  used: number;
  remaining: number;
}

// Tier-based limits for favorite tickers (keep in sync with backend)
const TICKER_LIMITS = {
  free: 0,
  standard: 5,
  premium: 20,
  vip: 50,
  ultimate: 100
} as const;

type SubscriptionTier = keyof typeof TICKER_LIMITS;

function getTierLimit(tier: string): number {
  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return TICKER_LIMITS[normalizedTier] || TICKER_LIMITS.free;
}

function calculateTierInfo(favoriteTickers: FavoriteTicker[], subscriptionTier: string): TierInfo {
  const limit = getTierLimit(subscriptionTier);
  const used = favoriteTickers.length;
  const remaining = Math.max(0, limit - used);
  
  return {
    currentTier: subscriptionTier,
    limit,
    used,
    remaining
  };
}

export function useFavoriteTickers() {
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract favorite tickers and tier info from user data (already fetched by AuthContext)
  const favoriteTickers = user?.favoriteTickers || [];
  const subscriptionTier = user?.subscriptionTier || 'free';
  const tierInfo = calculateTierInfo(favoriteTickers, subscriptionTier);

  const saveFavoriteTickers = async (updatedTickers: FavoriteTicker[]) => {
    if (!firebaseUser) {
      throw new Error('User must be authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/user/tickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ favoriteTickers: updatedTickers }),
      });

      if (response.ok) {
        // The backend has been updated successfully.
        // For now, we'll trust the update worked. The user data will be 
        // refreshed on next page load or when the AuthContext refetches.
        return true;
      } else {
        const errorData = await response.json();
        // Include tier limit information in error for better UX
        if (response.status === 403 && errorData.tierLimit !== undefined) {
          throw new Error(`${errorData.error} Upgrade your subscription to add more favorite tickers.`);
        }
        throw new Error(errorData.error || 'Failed to save favorite tickers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving favorite tickers:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTicker = async (symbol: string, name?: string, dailyUpdates: boolean = true) => {
    const tickerSymbol = symbol.trim().toUpperCase();
    
    // Check if ticker already exists
    if (favoriteTickers.some(ticker => ticker.symbol === tickerSymbol)) {
      throw new Error('Ticker already in your favorites');
    }

    // Check tier limits before adding
    if (favoriteTickers.length >= tierInfo.limit) {
      throw new Error(`Cannot add more tickers. Your ${tierInfo.currentTier.toUpperCase()} tier allows maximum ${tierInfo.limit} favorite tickers. Upgrade your subscription for more capacity.`);
    }

    const newTicker: FavoriteTicker = {
      symbol: tickerSymbol,
      name,
      dailyUpdates,
    };

    const updatedTickers = [...favoriteTickers, newTicker];
    await saveFavoriteTickers(updatedTickers);
  };

  const removeTicker = async (symbolToRemove: string) => {
    const updatedTickers = favoriteTickers.filter(ticker => ticker.symbol !== symbolToRemove);
    await saveFavoriteTickers(updatedTickers);
  };

  const updateTicker = async (symbol: string, updates: Partial<FavoriteTicker>) => {
    const updatedTickers = favoriteTickers.map(ticker =>
      ticker.symbol === symbol ? { ...ticker, ...updates } : ticker
    );
    await saveFavoriteTickers(updatedTickers);
  };

  const toggleDailyUpdates = async (symbol: string, enabled: boolean) => {
    await updateTicker(symbol, { dailyUpdates: enabled });
  };

  const getTickersWithDailyUpdates = () => {
    return favoriteTickers.filter(ticker => ticker.dailyUpdates);
  };

  return {
    favoriteTickers,
    tierInfo,
    loading,
    error,
    addTicker,
    removeTicker,
    updateTicker,
    toggleDailyUpdates,
    getTickersWithDailyUpdates,
  };
}

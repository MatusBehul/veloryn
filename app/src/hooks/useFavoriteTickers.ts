import { useState, useEffect } from 'react';
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

export function useFavoriteTickers() {
  const { firebaseUser } = useAuth();
  const [favoriteTickers, setFavoriteTickers] = useState<FavoriteTicker[]>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo>({ currentTier: 'free', limit: 0, used: 0, remaining: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavoriteTickers = async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/user/tickers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteTickers(data.favoriteTickers || []);
        setTierInfo(data.tierInfo || { currentTier: 'free', limit: 0, used: 0, remaining: 0 });
      } else {
        throw new Error('Failed to load favorite tickers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading favorite tickers:', err);
    } finally {
      setLoading(false);
    }
  };

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
        const data = await response.json();
        setFavoriteTickers(updatedTickers);
        setTierInfo(data.tierInfo || { currentTier: 'free', limit: 0, used: 0, remaining: 0 });
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

  // Load tickers when component mounts or user changes
  useEffect(() => {
    if (firebaseUser) {
      loadFavoriteTickers();
    } else {
      setFavoriteTickers([]);
      setTierInfo({ currentTier: 'free', limit: 0, used: 0, remaining: 0 });
      setError(null);
    }
  }, [firebaseUser]);

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
    loadFavoriteTickers,
  };
}

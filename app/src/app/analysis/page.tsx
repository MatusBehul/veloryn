'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useFavoriteTickers } from '@/hooks/useFavoriteTickers';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Search, Calendar, TrendingUp, AlertCircle, ChevronRight, Star, ChevronDown, ChevronUp, ExternalLink, Building2 } from 'lucide-react';

interface FinancialAnalysis {
  id: string;
  ticker: string;
  timestamp?: any;

  name?: string;
  description?: string;
  industry?: string;
  link?: string;
  created_at?: any;
  day?: string;
}

export default function AnalysisPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { hasActiveSubscription, syncSubscription } = useSubscription();
  const { favoriteTickers } = useFavoriteTickers();
  const { t } = useTranslation();
  const [analyses, setAnalyses] = useState<FinancialAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Handle successful checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && user) {
      setShowSuccessMessage(true);
      
      const syncAfterCheckout = async () => {
        try {
          await syncSubscription();
          console.log('Subscription synced after successful checkout');
          
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          setTimeout(() => setShowSuccessMessage(false), 5000);
        } catch (error) {
          console.error('Failed to sync subscription after checkout:', error);
        }
      };
      
      syncAfterCheckout();
    }
  }, [user, syncSubscription]);

  const fetchAnalyses = async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const params = new URLSearchParams({
        limit: '12',
      });

      // Add filters if they exist
      if (selectedTicker) {
        params.append('ticker', selectedTicker);
      }
      
      if (fromDate) {
        params.append('fromDate', fromDate);
      }

      if (toDate) {
        params.append('toDate', toDate);
      }

      const url = `/api/financial-analysis?${params}`;
      console.log('Fetching analyses:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
        console.log(`Loaded ${data.analyses?.length || 0} analyses`);
      } else {
        console.error('Failed to fetch analyses:', response.status);
        setAnalyses([]);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser && hasActiveSubscription) {
      fetchAnalyses();
    }
  }, [firebaseUser, hasActiveSubscription]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching with filters:', { selectedTicker, fromDate, toDate });
    fetchAnalyses();
  };

  // Check if a ticker is in user's favorites
  const isTickerFavorite = (ticker: string) => {
    return favoriteTickers.some(favTicker => favTicker.symbol === ticker);
  };

  // Filter analyses based on favorites - this should be applied after fetching, not affect the API call
  const filteredAnalyses = showFavoritesOnly 
    ? analyses.filter(analysis => isTickerFavorite(analysis.ticker))
    : analyses;

  // Helper function to get company name
  // const getCompanyName = (analysis: FinancialAnalysis): string => {
  //   return analysis.company_overview?.data?.[0]?.Name || analysis.ticker;
  // };

  // // Helper function to get company description
  // const getCompanyDescription = (analysis: FinancialAnalysis): string => {
  //   const description = analysis.company_overview?.data?.[0]?.Description;
  //   return description || 'Financial analysis available for this security.';
  // };

  // // Helper function to get industry
  // const getIndustry = (analysis: FinancialAnalysis): string => {
  //   return analysis.company_overview?.data?.[0]?.Industry || '';
  // };

  // // Helper function to get sector
  // const getSector = (analysis: FinancialAnalysis): string => {
  //   return analysis.company_overview?.data?.[0]?.Sector || '';
  // };

  // // Helper function to get official website
  // const getOfficialSite = (analysis: FinancialAnalysis): string => {
  //   return analysis.company_overview?.data?.[0]?.OfficialSite || '';
  // };

  // Helper function to toggle card expansion
  const toggleCardExpansion = (analysisId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(analysisId)) {
      newExpanded.delete(analysisId);
    } else {
      newExpanded.add(analysisId);
    }
    setExpandedCards(newExpanded);
  };

  const formatDate = (date: unknown) => {
    if (!date) return t('analysisNotAvailable');
    
    // Handle Firestore Timestamp objects
    if (typeof date === 'object' && date !== null && '_seconds' in date) {
      const timestamp = date as { _seconds: number; _nanoseconds: number };
      const dateObj = new Date(timestamp._seconds * 1000);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    
    // Handle regular dates
    const dateObj = date instanceof Date ? date : new Date(date as string);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const availableTickers = ['AAPL', 'TSLA', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'META', 'NFLX'];

  // // Helper function to get analysis title
  // const getAnalysisTitle = (analysis: FinancialAnalysis): string => {
  //   try {
  //     const data = analysis.analysis_data as Record<string, unknown>;
  //     if (data?.title && typeof data.title === 'string') {
  //       return data.title;
  //     }
  //     return `${analysis.ticker} Financial Analysis`;
  //   } catch {
  //     return `${analysis.ticker} Financial Analysis`;
  //   }
  // };

  // // Helper function to get summary
  // const getAnalysisSummary = (analysis: FinancialAnalysis): string => {
  //   try {
  //     const data = analysis.analysis_data as Record<string, unknown>;
  //     if (data?.summary && typeof data.summary === 'string') {
  //       return data.summary;
  //     }
  //     return 'Comprehensive financial analysis available';
  //   } catch {
  //     return 'Comprehensive financial analysis available';
  //   }
  // };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-600">{t('analysisLoading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('analysisAuthenticationRequired')}</h2>
            <p className="text-gray-600 mb-4">{t('analysisAuthenticationDescription')}</p>
            <Link href="/login">
              <Button>{t('analysisLogIn')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('analysisSubscriptionRequired')}</h2>
            <p className="text-gray-600 mb-4">{t('analysisSubscriptionDescription')}</p>
            <Link href="/pricing">
              <Button>{t('analysisViewPricing')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-green-800">
                  {t('analysisWelcomeMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('analysisPageTitle')}</h1>
          <p className="text-slate-600">{t('analysisPageSubtitle')}</p>
        </div>

        <div className="mb-8">
          <p className="text-slate-900">{t('analysisPageEnrichmentMessage1')}</p>
          <p className="text-slate-900">{t('analysisPageEnrichmentMessage2')}</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('analysisTicker')}
                  </label>
                  <select
                    value={selectedTicker}
                    onChange={(e) => setSelectedTicker(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('analysisAllTickers')}</option>
                    {availableTickers.map((ticker) => (
                      <option key={ticker} value={ticker}>
                        {ticker}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('analysisFromDate')}
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('analysisToDate')}
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    {t('analysisSearch')}
                  </Button>
                </div>
              </div>
              
              {/* Favorites Filter */}
              {favoriteTickers.length > 0 && (
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFavoritesOnly}
                      onChange={(e) => {
                        setShowFavoritesOnly(e.target.checked);
                      }}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {t('analysisShowFavoritesOnly').replace('{count}', favoriteTickers.length.toString())}
                      </span>
                    </div>
                  </label>
                </div>
              )}
              
              {(selectedTicker || fromDate || toDate || showFavoritesOnly) && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTicker('');
                      setFromDate('');
                      setToDate('');
                      setShowFavoritesOnly(false);
                      fetchAnalyses();
                    }}
                  >
                    {t('analysisClearAllFilters')}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Analysis Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              {showFavoritesOnly ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('analysisNoAnalysesForFavorites')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('analysisNoAnalysesForFavoritesDescription')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowFavoritesOnly(false)}
                  >
                    {t('analysisShowAllAnalyses')}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('analysisNoAnalysisFound')}</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTicker || fromDate || toDate
                      ? t('analysisNoAnalysisFoundDescription')
                      : t('analysisNoAnalysisFoundGeneralDescription')}
                  </p>
                  {(selectedTicker || fromDate || toDate) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTicker('');
                        setFromDate('');
                        setToDate('');
                        fetchAnalyses();
                      }}
                    >
                      {t('analysisClearFilters')}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            {showFavoritesOnly && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {t('analysisShowingFavoritesCount')
                      .replace('{filtered}', filteredAnalyses.length.toString())
                      .replace('{total}', analyses.length.toString())}
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-6 mb-8">
              {filteredAnalyses.map((analysis) => {
                const isFavorite = isTickerFavorite(analysis.ticker);
                const companyName = analysis.name || analysis.ticker;
                const industry = analysis.industry || '';
                const description = analysis.description || '';;
                const officialSite = analysis.link || '';;
                const isExpanded = expandedCards.has(analysis.id);
                
                return (
                  <Card 
                    key={analysis.id} 
                    className={`hover:shadow-lg transition-all ${
                      isFavorite 
                        ? 'ring-2 ring-yellow-300 bg-yellow-50 border-yellow-200' 
                        : ''
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl leading-tight">
                              {companyName}
                            </CardTitle>
                            {isFavorite && (
                              <div title={t('analysisFavoriteTickerTitle')}>
                                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-mono font-medium ${
                              isFavorite 
                                ? 'bg-yellow-200 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {analysis.ticker}
                            </span>
                            
                            {industry && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{industry}</span>
                              </div>
                            )}
                            
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(analysis.timestamp || analysis.created_at || analysis.day)}</span>
                            </div>
                            <span className="text-emerald-600 font-medium">{t('analysisAIAnalysis')}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Description Preview */}
                      <div className="mb-4">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">{t('analysisOfficialWebsite')}: </span>
                            <a 
                              href={officialSite} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              {officialSite}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                          {t('analysisFinancialAnalysisTag')}
                        </span>
                        {industry && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {industry}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link href={`/analysis/${analysis.id}`} className="block">
                        <Button className="w-full">
                          {t('analysisReadFullAnalysis')}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

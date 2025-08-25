'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NewsItem, NewsFilters } from '@/types/news';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Calendar, 
  Filter, 
  ExternalLink, 
  Clock, 
  User, 
  Hash, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  X,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function NewsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NewsFilters>({
    ticker: '',
    topic: '',
    dateFrom: '',
    dateTo: '',
    limit: 30
  });
  const [showFilters, setShowFilters] = useState(false);
  const [popularTickers, setPopularTickers] = useState<string[]>([]);
  const [popularTopics, setPopularTopics] = useState<string[]>([]);

  // Predefined options
  const ALLOWED_TOPICS = [
    'Blockchain',
    'Earnings',
    'Economy - Fiscal',
    'Economy - Macro',
    'Economy - Monetary',
    'Energy & Transportation',
    'Finance',
    'Financial Markets',
    'IPO',
    'Life Sciences',
    'Manufacturing',
    'Mergers & Acquisitions',
    'Real Estate & Construction',
    'Retail & Wholesale',
    'Technology'
  ];

  const ALLOWED_TICKERS = [
    'CRYPTO:SOL', 'CRYPTO:XRP', 'DQ', 'DSGX', 'DSKYF', 'DTNOF', 'EBAY', 'EDAP', 'ELBM', 'ENGS',
    'F', 'FFBC', 'FIG', 'FNLPF', 'FOREX:BGN', 'FOREX:CNY', 'FOREX:USD', 'FOSUF', 'FRST', 'GDOT',
    'GEV', 'GIB', 'GILD', 'GLPI', 'GM', 'GOOG', 'GS', 'GVHIB', 'HEI', 'HOVNP', 'HUYA', 'ICNB',
    'IMAB', 'INTC', 'IONQ', 'IPCFF', 'ISRG', 'IVZ', 'JNJ', 'JYSKF', 'KDP', 'KGC', 'KNBWF', 'KSFTF',
    'LINE', 'MALRF', 'MAOFF', 'MCQEF', 'MDT', 'META', 'MJDLF', 'MRNA', 'MS', 'MSFT', 'NFLX', 'NHPEF',
    'NIO', 'NMRA', 'NOTE', 'NTES', 'NVAAF', 'NVDA', 'NWCCF', 'OKTA', 'OLB', 'ONDS', 'PAAS', 'PANW',
    'PDD', 'PEP', 'PLTR', 'PMNT', 'RH', 'RPRX', 'RRC', 'SBET', 'SCBFF', 'SHOP', 'SION', 'SKXJF',
    'SMHGF', 'SMTC', 'SNEJF', 'SNY', 'SOFI', 'SSL', 'SSNLF', 'STM', 'STOK', 'SYANY', 'SYNA', 'SZIHF',
    'TCTZF', 'TGHI', 'TGT', 'TRTPF', 'TSEM', 'TSLA', 'TSM', 'VRNT', 'VTLE', 'VZ', 'WB', 'WBD', 'WDAY',
    'WFC', 'WLDBF', 'WMT', 'XPEV', 'YUM'
  ];

  // Fetch news data
  const fetchNews = async (searchFilters = filters) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchFilters.ticker && searchFilters.ticker.trim()) {
        params.append('ticker', searchFilters.ticker.trim());
      }
      if (searchFilters.dateFrom && searchFilters.dateFrom.trim()) {
        params.append('dateFrom', searchFilters.dateFrom.trim());
      }
      if (searchFilters.dateTo && searchFilters.dateTo.trim()) {
        params.append('dateTo', searchFilters.dateTo.trim());
      }
      if (searchFilters.topic && searchFilters.topic.trim()) {
        params.append('topic', searchFilters.topic.trim());
      }

      const response = await fetch(`/api/news?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNews(data.news || []);
      setFilteredNews(data.news || []);
      
      // Extract popular tickers and topics for suggestions
      if (data.news) {
        const tickers = new Set<string>();
        const topics = new Set<string>();
        
        data.news.forEach((item: NewsItem) => {
          item.tickers?.forEach(ticker => tickers.add(ticker));
          item.topics?.forEach(topic => topics.add(topic));
        });
        
        setPopularTickers(Array.from(tickers).slice(0, 10));
        setPopularTopics(Array.from(topics).slice(0, 10));
      }
      
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search with current filters
  const handleSearch = () => {
    fetchNews(filters);
  };

  // Format time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  // Get sentiment color and icon
  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'somewhat-bullish':
      case 'somewhat_bullish':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'somewhat-bearish':
      case 'somewhat_bearish':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'neutral':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish':
      case 'somewhat-bullish':
      case 'somewhat_bullish':
        return <TrendingUp className="h-3 w-3" />;
      case 'bearish':
      case 'somewhat-bearish':
      case 'somewhat_bearish':
        return <TrendingDown className="h-3 w-3" />;
      case 'neutral':
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  // Effects
  useEffect(() => {
    if (user) {
      // Initial load with empty filters to get all news
      fetchNews({
        ticker: '',
        topic: '',
        dateFrom: '',
        dateTo: '',
        limit: 30
      });
    }
  }, [user]);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the latest financial news and market insights.
            </p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Latest Financial News
          </h1>
          <p className="text-gray-600">
            Stay updated with the latest market news and sentiment analysis
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Filter Limitation:</strong> You can search by either ticker symbol OR topic, but not both at the same time. 
                  Select from the predefined lists of {ALLOWED_TICKERS.length} tickers and {ALLOWED_TOPICS.length} topics.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ticker Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticker Symbol
                  </label>
                  <div className="relative">
                    <select
                      value={filters.ticker}
                      onChange={(e) => setFilters(prev => ({ ...prev, ticker: e.target.value }))}
                      disabled={!!filters.topic}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${!!filters.topic ? 'bg-gray-100' : 'bg-white'}`}
                    >
                      <option value="">Select a ticker...</option>
                      {ALLOWED_TICKERS.map(ticker => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                      ))}
                    </select>
                    {filters.ticker && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, ticker: '' }))}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {filters.topic && (
                    <p className="text-xs text-gray-500 mt-1">
                      Clear the topic field to enable ticker search
                    </p>
                  )}
                </div>

                {/* Topic Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <div className="relative">
                    <select
                      value={filters.topic}
                      onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
                      disabled={!!filters.ticker}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${!!filters.ticker ? 'bg-gray-100' : 'bg-white'}`}
                    >
                      <option value="">Select a topic...</option>
                      {ALLOWED_TOPICS.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    {filters.topic && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, topic: '' }))}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {filters.ticker && (
                    <p className="text-xs text-gray-500 mt-1">
                      Clear the ticker field to enable topic search
                    </p>
                  )}
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Search Button */}
              <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-1" />
                  {loading ? 'Searching...' : 'Search News'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing news articles is limited to 30. Showing {filteredNews.length}
          </p>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Legend */}
        {filteredNews.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-700">
              <strong>Reading the Data:</strong> 
              <span className="ml-2"><strong>Topics:</strong> Colored by relevancy (green ≥70%, yellow ≥50%, gray &lt;50%). Only predefined topics are clickable to filter.</span>
              <span className="ml-2"><strong>Tickers:</strong> Show sentiment icon, relevancy %, and sentiment score. Colored by sentiment (green = bullish, red = bearish, gray = neutral). Only predefined tickers are clickable to filter.</span>
              <span className="ml-2"><strong>Note:</strong> Grayed-out badges are either not available for filtering or disabled due to mutual exclusivity.</span>
            </p>
          </div>
        )}

        {/* News List */}
        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {loading ? 'Loading news...' : 'No news found'}
                </h3>
                <p className="text-gray-500">
                  {loading ? 'Please wait while we fetch the latest news.' : 'Try adjusting your filters or check back later for new articles.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNews.map((newsItem) => (
              <Card key={newsItem.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(newsItem.time_published_datetime)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {newsItem.authors && newsItem.authors.length > 0 ? newsItem.authors.join(', ') : 'Unknown'}
                    </div>
                    <div className="text-blue-600 font-medium">{newsItem.source}</div>
                  </div>

                  {/* Title and Link */}
                  <div className="mb-4">
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                        {newsItem.title}
                        <ExternalLink className="inline-block h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    </a>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {newsItem.summary}
                  </p>

                  {/* Sentiment */}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-sm font-medium text-gray-900">Overall Sentiment:</span>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(newsItem.overall_sentiment_label || '')}`}>
                      {getSentimentIcon(newsItem.overall_sentiment_label || '')}
                      <span className="ml-1">{newsItem.overall_sentiment_label}</span>
                      <span className="ml-2 text-xs opacity-75">
                        ({newsItem.overall_sentiment_score?.toFixed(3) || 'N/A'})
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  {newsItem.topics_relevancy && newsItem.topics_relevancy.length > 0 && (
                    <div className="flex items-start space-x-2 mb-4">
                      <div className="flex items-center text-sm font-medium text-gray-900 mt-1">
                        <Hash className="h-4 w-4 mr-1" />
                        Topics:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newsItem?.topics_relevancy.map((topicData, idx) => {
                          const relevancyScore = parseFloat(topicData.relevance_score);
                          const relevancyPercent = (relevancyScore * 100).toFixed(0);
                          const relevancyColor = relevancyScore >= 0.7 ? 'bg-green-100 border-green-300 text-green-800' :
                                                relevancyScore >= 0.5 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                                                'bg-gray-100 border-gray-300 text-gray-800';
                          
                          const isClickable = !filters.ticker && ALLOWED_TOPICS.includes(topicData.topic);
                          const tooltipText = isClickable ? 
                            `Relevancy: ${relevancyPercent}% - Click to filter by this topic` :
                            filters.ticker ? 
                              `Relevancy: ${relevancyPercent}% - Clear ticker filter to enable topic filtering` :
                              `Relevancy: ${relevancyPercent}% - This topic is not available for filtering`;
                          
                          return (
                            <div
                              key={`topic-${newsItem.id}-${idx}-${topicData.topic}`}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-opacity ${relevancyColor}`}
                              title={tooltipText}
                            >
                              <span>{topicData.topic}</span>
                              <span className="ml-2 text-xs opacity-75">
                                - rel. {relevancyPercent}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mentioned Tickers */}
                  {newsItem.ticker_sentiment && newsItem.ticker_sentiment.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <div className="flex items-center text-sm font-medium text-gray-900 mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Tickers:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newsItem.ticker_sentiment.map((tickerData, idx) => {
                          const relevancyScore = parseFloat(tickerData.relevance_score);
                          const sentimentScore = parseFloat(tickerData.sentiment_score);
                          const relevancyPercent = (relevancyScore * 100).toFixed(0);
                          
                          // Color based on sentiment
                          const sentimentColor = tickerData.sentiment_label?.toLowerCase().includes('bullish') ? 'bg-green-100 border-green-300 text-green-800' :
                                               tickerData.sentiment_label?.toLowerCase().includes('bearish') ? 'bg-red-100 border-red-300 text-red-800' :
                                               'bg-gray-100 border-gray-300 text-gray-800';
                          
                          // Sentiment icon
                          const getSentimentIconSmall = (label: string) => {
                            if (label?.toLowerCase().includes('bullish')) return <TrendingUp className="h-3 w-3" />;
                            if (label?.toLowerCase().includes('bearish')) return <TrendingDown className="h-3 w-3" />;
                            return <Minus className="h-3 w-3" />;
                          };
                          
                          const isClickable = !filters.topic && ALLOWED_TICKERS.includes(tickerData.ticker);
                          const baseTooltip = `${tickerData.ticker} - Sentiment: ${tickerData.sentiment_label} (${sentimentScore.toFixed(2)}) | Relevancy: ${relevancyPercent}%`;
                          const tooltipText = isClickable ? 
                            `${baseTooltip} - Click to filter by this ticker` :
                            filters.topic ? 
                              `${baseTooltip} - Clear topic filter to enable ticker filtering` :
                              `${baseTooltip} - This ticker is not available for filtering`;
                          
                          return (
                            <div
                              key={`ticker-${newsItem.id}-${idx}-${tickerData.ticker}`}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-opacity ${sentimentColor}`}
                              title={tooltipText}
                            >
                              {getSentimentIconSmall(tickerData.sentiment_label)}
                              <span className="ml-1">{tickerData.ticker}</span>
                              <span className="ml-2 text-xs opacity-75">
                                - rel. {relevancyPercent}% | sent. {sentimentScore >= 0 ? '+' : ''}{sentimentScore.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

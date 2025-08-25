import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Clock, User, Hash, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';

interface TickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
}

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  source: string;
  topics: (string | { topic?: string; name?: string; relevance_score?: string })[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
}

interface NewsCarouselProps {
  news: NewsItem[];
  ticker?: string;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ news, ticker }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const nextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevNews = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const formatTime = (timeString: string) => {
    try {
      // Format: "20250825T063451"
      const year = timeString.substring(0, 4);
      const month = timeString.substring(4, 6);
      const day = timeString.substring(6, 8);
      const hour = timeString.substring(9, 11);
      const minute = timeString.substring(11, 13);
      
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
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

  const formatSentimentScore = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(numScore) ? 'N/A' : numScore.toFixed(3);
  };

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">{t('analysisDetailNewsNotAvailable')}</p>
        </CardContent>
      </Card>
    );
  }

  const currentNews = news[currentIndex];

  // Filter and sort ticker sentiments for relevance
  const relevantTickers = currentNews.ticker_sentiment
    ?.filter(t => {
      if (!t) return false;
      const relevance = parseFloat(t.relevance_score || '0');
      // Show if relevance > 3% OR if it's the current ticker being analyzed
      return relevance > 0.03 || (ticker && t.ticker === ticker);
    })
    ?.sort((a, b) => {
      // Sort by relevance score (highest first)
      return parseFloat(b.relevance_score || '0') - parseFloat(a.relevance_score || '0');
    })
    ?.slice(0, 8) || []; // Show top 8 most relevant

  return (
    <Card>
      <CardContent className="p-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{t('analysisDetailNewsAndSentiment')}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {currentIndex + 1} / {news.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevNews}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={news.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextNews}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={news.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* News Content */}
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(currentNews.time_published)}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {currentNews.authors?.length > 0 ? currentNews.authors.join(', ') : 'N/A'}
            </div>
            <div className="text-blue-600 font-medium">{currentNews.source}</div>
          </div>

          {/* Title and Link */}
          <div>
            <a
              href={currentNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                {currentNews.title}
                <ExternalLink className="inline-block h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
            </a>
          </div>

          {/* Summary */}
          <p className="text-gray-700 leading-relaxed">
            {currentNews.summary}
          </p>

          {/* Overall Sentiment */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900">{t('analysisDetailNewsOverallSentiment')}:</span>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(currentNews.overall_sentiment_label)}`}>
              {getSentimentIcon(currentNews.overall_sentiment_label)}
              <span className="ml-1">{currentNews.overall_sentiment_label}</span>
              <span className="ml-2 text-xs">
                ({formatSentimentScore(currentNews.overall_sentiment_score)})
              </span>
            </div>
          </div>

          {/* Topics */}
          {currentNews.topics && currentNews.topics.length > 0 && (
            <div className="flex items-start space-x-2">
              <div className="flex items-center text-sm font-medium text-gray-900 mt-1">
                <Hash className="h-4 w-4 mr-1" />
                {t('analysisDetailNewsTopics')}:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentNews.topics.map((topic, idx) => {
                  // Handle both string topics and object topics
                  const topicText = typeof topic === 'string' ? topic : topic?.topic || topic?.name || 'Unknown Topic';
                  return (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {topicText}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ticker Sentiments */}
          {relevantTickers.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">{t('analysisDetailNewsAffectedTickers')}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relevantTickers.map((tickerData, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      tickerData.ticker === ticker ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm ${
                        tickerData.ticker === ticker ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {tickerData.ticker}
                        {tickerData.ticker === ticker && (
                          <span className="ml-1 text-xs text-blue-600">{t('analysisDetailNewsCurrent')}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t('analysisDetailNewsRelevance')}: {(parseFloat(tickerData.relevance_score) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getSentimentColor(tickerData.ticker_sentiment_label)}`}>
                      {getSentimentIcon(tickerData.ticker_sentiment_label)}
                      <span className="ml-1">{tickerData.ticker_sentiment_label}</span>
                      <span className="ml-1">
                        ({formatSentimentScore(tickerData.ticker_sentiment_score)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Carousel Navigation */}
        {news.length > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            {/* Progress indicator for mobile */}
            <div className="flex items-center space-x-2 sm:hidden">
              <span className="text-xs text-gray-500">
                {currentIndex + 1} / {news.length}
              </span>
            </div>
            
            {/* Dots for desktop (max 10 dots with ellipsis) */}
            <div className="hidden sm:flex items-center space-x-2">
              {news.length <= 10 ? (
                // Show all dots if 10 or fewer items
                <div className="flex space-x-1">
                  {news.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                // Show condensed dots with ellipsis for more than 10 items
                <div className="flex items-center space-x-1">
                  {/* First dot */}
                  <button
                    onClick={() => setCurrentIndex(0)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      0 === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                  
                  {/* Left ellipsis */}
                  {currentIndex > 3 && <span className="text-gray-400 text-xs">...</span>}
                  
                  {/* Surrounding dots */}
                  {Array.from({ length: Math.min(5, news.length - 2) }, (_, i) => {
                    let dotIndex;
                    if (currentIndex <= 3) {
                      dotIndex = i + 1;
                    } else if (currentIndex >= news.length - 4) {
                      dotIndex = news.length - 6 + i;
                    } else {
                      dotIndex = currentIndex - 2 + i;
                    }
                    
                    if (dotIndex <= 0 || dotIndex >= news.length - 1) return null;
                    
                    return (
                      <button
                        key={dotIndex}
                        onClick={() => setCurrentIndex(dotIndex)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          dotIndex === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    );
                  })}
                  
                  {/* Right ellipsis */}
                  {currentIndex < news.length - 4 && <span className="text-gray-400 text-xs">...</span>}
                  
                  {/* Last dot */}
                  {news.length > 1 && (
                    <button
                      onClick={() => setCurrentIndex(news.length - 1)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        news.length - 1 === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )}
              
              {/* Text indicator for large numbers */}
              {news.length > 10 && (
                <span className="text-xs text-gray-500 ml-2">
                  {currentIndex + 1} / {news.length}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

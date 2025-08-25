export interface NewsItem {
  id?: string;
  title: string;
  summary: string;
  url: string;
  time_published: string;
  time_published_datetime?: Date | any; // Firestore timestamp or Date
  authors?: string[];
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  tickers?: string[];
  topics?: string[];
  topics_relevancy?: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
  ticker_sentiment?: Array<{
    ticker: string;
    relevance_score: string;
    sentiment_score: string;
    sentiment_label: string;
  }>;
  content_hash?: string;
  created_at?: Date | any; // Firestore timestamp or Date
  updated_at?: Date | any; // Firestore timestamp or Date
}

export interface NewsApiResponse {
  success: boolean;
  count: number;
  news: NewsItem[];
  filters: {
    ticker?: string | null;
    topic?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    limit: number;
  };
  error?: string;
  details?: string;
}

export interface TickerProfile {
  ticker: string;
  latest_news_count: number;
  total_mentions: number;
  sentiment_score_avg: number;
  latest_update: Date | any; // Firestore timestamp or Date
  news_articles: string[]; // Array of news article IDs
}

export interface NewsFilters {
  ticker?: string;
  topic?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

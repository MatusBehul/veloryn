export interface FavoriteTicker {
  symbol: string;
  name?: string;
  dailyUpdates: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled';
  subscriptionTier: 'free' | 'standard' | 'premium' | 'vip' | 'ultimate';
  subscriptionId?: string;
  customerId?: string;
  currentPeriodEnd?: number;
  favoriteTickers?: FavoriteTicker[];
}

// New comprehensive analysis structure types
export interface ComprehensiveAnalysisData {
  id: string;
  ticker: string;
  date: string;
  analysis_overview: {
    analysis_data?: {
      fundamental_analysis?: string | string[];
      investment_narrative?: string | string[];
      investment_insights?: string | string[];
      overall_analysis?: string | string[];
      risk_analysis?: string | string[];
      sentiment_analysis?: string | string[];
      technical_analysis?: string | string[];
    };
  };
  balance_sheet_data: {
    data?: Array<{
      fiscalDateEnding: string;
      reportedCurrency: string;
      totalAssets: string;
      totalCurrentAssets: string;
      cashAndCashEquivalentsAtCarryingValue: string;
      totalLiabilities: string;
      totalShareholderEquity: string;
      // ... other balance sheet fields
    }>;
  };
  company_overview: {
    data?: Array<{
      Symbol: string;
      Name: string;
      Description: string;
      Sector: string;
      Industry: string;
      Exchange: string;
      Country: string;
      MarketCapitalization: number;
      PERatio: number;
      EPS: number;
      DividendYield: number;
      // ... other company overview fields
    }>;
  };
  daily_prices: {
    data?: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
  technical_analysis_results: {
    data?: {
      current_price: number;
      week_52_high: number;
      week_52_low: number;
      last_day_volume: number;
      daily?: {
        rsi: number;
        macd: {
          macd_line: number;
          signal_line: number;
          histogram: number;
        };
        sar: number;
        moving_averages: {
          sma_20: number;
          sma_50: number;
          sma_200: number;
          ema_12: number;
          ema_26: number;
        };
      };
    };
  };
  income_statement_data: {
    data?: Array<{
      fiscalDateEnding: string;
      totalRevenue: string;
      netIncome: string;
      grossProfit: string;
      operatingIncome: string;
      // ... other income statement fields
    }>;
  };
  earnings_estimates: {
    data?: Array<{
      horizon: string;
      eps_estimate_average: string;
      eps_estimate_high: string;
      eps_estimate_low: string;
      revenue_estimate_average: string;
    }>;
  };
  dividend_data: {
    data?: Array<{
      ex_dividend_date: string;
      declaration_date: string;
      record_date: string;
      payment_date: string;
      open: number;
    }>;
  };
  createdAt: string;
}

// Legacy types for backwards compatibility
export interface FinancialAnalysis {
  id: string;
  ticker: string;
  created_at: string;
  analysis_data: Record<string, unknown>;
  charts?: Record<string, unknown>;
  tables?: Record<string, unknown>;
}

// Generic chart data types
export interface ChartData {
  data?: Record<string, unknown>;
  type?: string;
  config?: Record<string, unknown>;
}

export interface TableData {
  headers?: string[];
  rows?: (string | number)[][];
  title?: string;
}

// Parsed analysis data structure (from the JSON string)
export interface ParsedAnalysisData {
  ticker: string;
  analysis_date: string;
  overview: {
    current_price: number;
    change_percent: string;
    market_cap: string;
    volume: number;
    avg_volume: number;
    pe_ratio: number;
    '52_week_high': number;
    '52_week_low': number;
  };
  data: {
    [timeframe: string]: Array<{
      timestamp: string;
      price: number;
      volume: number;
      [key: string]: string | number;
    }>;
  };
  technical_indicators?: {
    [indicator: string]: Record<string, unknown>;
  };
  summary?: string;
  charts?: Array<{
    type: string;
    title: string;
    data: unknown[];
    [key: string]: unknown;
  }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
    [key: string]: unknown;
  }>;
  comments?: string[];
  insights?: {
    action: string;
    confidence: number;
    target_price: number;
    reasoning: string[];
    [key: string]: string | number | string[];
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

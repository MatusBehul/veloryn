export interface AnalysisData {
  analysis?: {
    overview?: {
      current_price: number;
      change_percent: string;
      market_cap: string;
      pe_ratio: string;
      volume: number;
      avg_volume: number;
      '52_week_high': number;
      '52_week_low': number;
    };
    insights?: {
      action: string;
      target_price: number;
      confidence: number;
      reasoning: string[];
      stop_loss?: number;
    };
    technical_analysis?: {
      trend: string;
      rsi: number;
      macd?: {
        signal: string;
      };
    };
    risk_analysis?: {
      risk_level: string;
      beta: number;
      max_drawdown: number;
    };
    storytelling?: string[];
  };
}

export interface FinancialAnalysis {
  id: string;
  ticker: string;
  created_at: any;
  analysis_data: AnalysisData;
  user_id: string;
}

export interface EmailRequest {
  analysisId: string;
  ticker: string;
  recipients: string[];
  requestedAt: string;
  language: string; // The user's preferred language
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

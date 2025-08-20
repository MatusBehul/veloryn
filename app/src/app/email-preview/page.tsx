import React from 'react';
import { formatAnalysisDataForEmail } from '@/lib/email/analysis-formatter';

// Mock analysis data for testing
const mockAnalysisData = {
  id: "test-123",
  ticker: "AAPL",
  date: "2025-08-18",
  company_overview: {
    data: [{
      Name: "Apple Inc.",
      MarketCapitalization: "3400000000000",
      PERatio: "28.5",
      EPS: "6.15",
      DividendYield: "0.0045",
      _52WeekHigh: "220.20",
      _52WeekLow: "164.08",
      _50DayMovingAverage: "192.35",
      _200DayMovingAverage: "180.22"
    }]
  },
  analysis_overview: {
    analysis_data: {
      overall_analysis: [
        "Apple Inc. demonstrates **strong financial fundamentals** with consistent revenue growth and robust cash flows.",
        "The company's ecosystem approach creates significant **competitive moats** and customer loyalty.",
        "Recent quarterly results show **resilient performance** despite macroeconomic headwinds."
      ],
      investment_narrative: [
        "Apple represents a **premium technology investment** with diversified revenue streams.",
        "The services segment continues to show **accelerating growth** and higher margins.",
        "Innovation in AI and emerging technologies positions Apple for **future growth**."
      ],
      technical_analysis: [
        "Current price action shows **bullish momentum** with support at key moving averages.",
        "RSI indicates the stock is in **neutral territory** with room for upward movement.",
        "MACD signals suggest **positive momentum** building in the near term."
      ],
      fundamental_analysis: [
        "Revenue growth of **8.2%** year-over-year demonstrates business resilience.",
        "Operating margins remain **healthy at 28%** indicating efficient operations.",
        "Strong balance sheet with **$50B+ in net cash** provides financial flexibility."
      ],
      risk_analysis: [
        "**Geopolitical tensions** in key markets pose potential headwinds.",
        "Supply chain disruptions could impact **product availability** and margins.",
        "Regulatory scrutiny on App Store policies presents **compliance risks**."
      ],
      sentiment_analysis: [
        "Institutional sentiment remains **largely positive** with increased holdings.",
        "Analyst coverage shows **72% buy ratings** with average price target of $210.",
        "Social media sentiment trends **bullish** following recent product announcements."
      ],
      investment_insights: [
        "**BUY** insights with 12-month price target of $215.",
        "Suitable for **long-term growth** and dividend income investors.",
        "Consider **dollar-cost averaging** for optimal entry positioning."
      ]
    }
  },
  technical_analysis_results: {
    daily: {
      rsi: 59.24,
      macd: {
        macd_line: 5.53,
        signal_line: 2.33,
        histogram: 3.20
      },
      sar: 200.12,
      cci: 96.81,
      obv: -438597882,
      momentum: 2.45,
      moving_averages: {
        sma_20: 203.90,
        sma_50: 204.49,
        sma_200: 185.30,
        ema_12: 213.56,
        ema_26: 208.03
      },
      bollinger_bands: {
        upper: 215.45,
        middle: 203.90,
        lower: 192.35
      }
    }
  },
  income_statement_data: {
    data: [{
      totalRevenue: "94930000000",
      netIncome: "22956000000",
      grossProfit: "43818000000",
      operatingIncome: "26274000000",
      fiscalDateEnding: "2024-06-30"
    }]
  },
  balance_sheet_data: {
    data: [{
      totalAssets: "365725000000",
      totalLiabilities: "279414000000",
      totalShareholderEquity: "86311000000",
      cashAndCashEquivalentsAtCarryingValue: "67150000000"
    }]
  },
  earnings_estimates: {
    data: [
      {
        horizon: "Current Quarter",
        eps_estimate_average: "1.53",
        eps_estimate_high: "1.60",
        eps_estimate_low: "1.45",
        revenue_estimate_average: "94500000000"
      },
      {
        horizon: "Next Quarter",
        eps_estimate_average: "2.18",
        eps_estimate_high: "2.25",
        eps_estimate_low: "2.10",
        revenue_estimate_average: "120000000000"
      }
    ]
  }
};

export default function EmailPreviewPage() {
  const emailContent = formatAnalysisDataForEmail(mockAnalysisData as any);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>Email Template Preview</h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Subject: {emailContent.subject}
        </p>
      </div>
      
      <div style={{ 
        border: '2px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div 
          dangerouslySetInnerHTML={{ __html: emailContent.html }}
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: '1.6'
          }}
        />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>Plain Text Version</h2>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          fontSize: '14px', 
          color: '#374151',
          fontFamily: 'Monaco, Consolas, monospace',
          lineHeight: '1.5'
        }}>
          {emailContent.text}
        </pre>
      </div>
    </div>
  );
}

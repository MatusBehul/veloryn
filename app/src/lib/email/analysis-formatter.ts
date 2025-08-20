interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

interface AnalysisData {
  id: string;
  ticker: string;
  date?: string;
  createdAt?: string;
  // Data collection documents
  analysis_overview?: {
    analysis_data?: {
      fundamental_analysis?: string[];
      investment_narrative?: string[];
      investment_insights?: string[];
      overall_analysis?: string[];
      risk_analysis?: string[];
      sentiment_analysis?: string[];
      technical_analysis?: string[];
    };
  };
  balance_sheet_data?: any;
  company_overview?: any;
  daily_prices?: any;
  dividend_data?: any;
  earnings_estimates?: any;
  hourly_prices?: any;
  income_statement_data?: any;
  monthly_prices?: any;
  splits_data?: any;
  technical_analysis_results?: any;
  weekly_prices?: any;
  // Optional fields that might exist in Firestore documents
  timestamp?: any;
  created_at?: any;
}

export function formatAnalysisDataForEmail(analysis: AnalysisData): EmailContent {
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Date not available';
    
    if (typeof dateString === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    if (typeof dateString === 'object' && dateString !== null && '_seconds' in dateString) {
      const timestamp = dateString as { _seconds: number; _nanoseconds: number };
      return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return 'N/A';
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const formatLargeNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    if (numValue >= 1e12) return `$${(numValue / 1e12).toFixed(2)}T`;
    if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
    if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
    if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
    return formatCurrency(numValue);
  };

  const formatPercent = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)}%`;
  };

  // Helper function to format text with bold markdown for email
  const formatTextWithBold = (text: any): string => {
    if (!text || typeof text !== 'string') return String(text || '');
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Helper function to render analysis text sections for email
  const renderAnalysisSection = (content: any): string => {
    if (!content) return '';
    
    if (Array.isArray(content)) {
      return content.map((paragraph: any) => 
        `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151;">${formatTextWithBold(paragraph)}</p>`
      ).join('');
    } else {
      return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151;">${formatTextWithBold(content)}</p>`;
    }
  };

  const subject = `Financial Analysis: ${analysis.ticker} - ${formatDate(analysis.date || analysis.timestamp || analysis.created_at || analysis.createdAt)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #374151; 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb; 
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      background-color: white; 
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white; 
      padding: 32px 24px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: bold; 
    }
    .header p { 
      margin: 8px 0 0 0; 
      opacity: 0.9; 
      font-size: 16px; 
    }
    .content { 
      padding: 32px 24px; 
    }
    .section { 
      margin-bottom: 40px; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      padding: 24px; 
      background: #ffffff; 
    }
    .section h2 { 
      color: #1f2937; 
      font-size: 24px; 
      font-weight: 600; 
      margin: 0 0 20px 0; 
      border-bottom: 2px solid #e5e7eb; 
      padding-bottom: 12px; 
      display: flex; 
      align-items: center; 
    }
    .section-icon { 
      margin-right: 12px; 
      font-size: 20px; 
    }
    .metric-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }
    .metric-grid-3 { 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }
    .metric-grid-4 { 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }
    .metric-card { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 16px; 
      text-align: center; 
    }
    .metric-card.blue { background: #eff6ff; border-color: #bfdbfe; }
    .metric-card.gray { background: #f9fafb; border-color: #d1d5db; }
    
    .metric-value { 
      font-size: 20px; 
      font-weight: bold; 
      color: #1f2937; 
      margin-bottom: 4px; 
    }
    .metric-value.blue { color: #2563eb; }
    .metric-value.gray { color: #4b5563; }
    
    .metric-label { 
      font-size: 14px; 
      color: #6b7280; 
      font-weight: 500; 
    }
    .analysis-content {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    }
    .analysis-content.blue { background: #eff6ff; }
    .analysis-content.yellow { background: #fffbeb; }
    
    .table-container {
      overflow-x: auto;
      margin: 16px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }
    .data-table th {
      background: #f9fafb;
      color: #374151;
      font-weight: 600;
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    .footer { 
      background: #f9fafb; 
      padding: 32px 24px; 
      text-align: center; 
      border-top: 1px solid #e5e7eb; 
    }
    .disclaimer { 
      background: #fef2f2; 
      border: 1px solid #fca5a5; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 24px 0; 
      font-size: 14px; 
    }
    .disclaimer h3 {
      color: #dc2626;
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    
    @media (max-width: 600px) {
      .metric-grid,
      .metric-grid-3,
      .metric-grid-4 { 
        grid-template-columns: 1fr; 
      }
      .container { 
        margin: 0; 
      }
      .content { 
        padding: 16px; 
      }
      .section {
        padding: 16px;
        margin-bottom: 20px;
      }
      .header {
        padding: 20px 16px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${analysis.ticker} Financial Analysis</h1>
      <p>AI-Generated Market Intelligence Report</p>
      <p>Generated on ${formatDate(analysis.date || analysis.timestamp || analysis.created_at || analysis.createdAt)}</p>
      ${analysis.company_overview?.data?.[0] ? `<p>${analysis.company_overview.data[0].Name}</p>` : ''}
    </div>

    <div class="content">
      ${analysis.analysis_overview?.analysis_data?.overall_analysis ? `
      <div class="section">
        <h2><span class="section-icon">🧠</span>Overall Analysis</h2>
        <div class="analysis-content">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.overall_analysis)}
        </div>
      </div>
      ` : ''}

      ${analysis.company_overview?.data?.[0] ? `
      <div class="section">
        <h2><span class="section-icon">📊</span>Key Financial Metrics</h2>
        <div class="metric-grid-4">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatLargeNumber(analysis.company_overview.data[0].MarketCapitalization)}</div>
            <div class="metric-label">Market Cap</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${analysis.company_overview.data[0].PERatio || 'N/A'}</div>
            <div class="metric-label">P/E Ratio</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.company_overview.data[0].EPS)}</div>
            <div class="metric-label">EPS</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatPercent(analysis.company_overview.data[0].DividendYield * 100)}</div>
            <div class="metric-label">Dividend Yield</div>
          </div>
        </div>
        <div class="metric-grid-4">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.company_overview.data[0]._52WeekHigh)}</div>
            <div class="metric-label">52W High</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatCurrency(analysis.company_overview.data[0]._52WeekLow)}</div>
            <div class="metric-label">52W Low</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.company_overview.data[0]._50DayMovingAverage)}</div>
            <div class="metric-label">50-Day MA</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatCurrency(analysis.company_overview.data[0]._200DayMovingAverage)}</div>
            <div class="metric-label">200-Day MA</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.investment_narrative ? `
      <div class="section">
        <h2><span class="section-icon">💡</span>Investment Narrative</h2>
        <div class="analysis-content blue">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.investment_narrative)}
        </div>
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.technical_analysis ? `
      <div class="section">
        <h2><span class="section-icon">⚡</span>Technical Analysis</h2>
        <div class="analysis-content">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.technical_analysis)}
        </div>
      </div>
      ` : ''}

      ${analysis.technical_analysis_results?.daily ? `
      <div class="section">
        <h2><span class="section-icon">📈</span>Technical Indicators</h2>
        <h3 style="color: #374151; margin: 0 0 16px 0;">Key Indicators</h3>
        <div class="metric-grid-3">
          <div class="metric-card blue">
            <div class="metric-value blue">${analysis.technical_analysis_results.daily.rsi?.toFixed(2) || 'N/A'}</div>
            <div class="metric-label">RSI</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${analysis.technical_analysis_results.daily.macd?.macd_line?.toFixed(2) || 'N/A'}</div>
            <div class="metric-label">MACD</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.sar)}</div>
            <div class="metric-label">SAR</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${analysis.technical_analysis_results.daily.cci?.toFixed(2) || 'N/A'}</div>
            <div class="metric-label">CCI</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatLargeNumber(analysis.technical_analysis_results.daily.obv)}</div>
            <div class="metric-label">OBV</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${analysis.technical_analysis_results.daily.momentum?.toFixed(2) || 'N/A'}</div>
            <div class="metric-label">Momentum</div>
          </div>
        </div>
        
        ${analysis.technical_analysis_results.daily.moving_averages ? `
        <h3 style="color: #374151; margin: 24px 0 16px 0;">Moving Averages</h3>
        <div class="metric-grid" style="grid-template-columns: repeat(5, 1fr);">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_20)}</div>
            <div class="metric-label">SMA 20</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_50)}</div>
            <div class="metric-label">SMA 50</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_200)}</div>
            <div class="metric-label">SMA 200</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.ema_12)}</div>
            <div class="metric-label">EMA 12</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.ema_26)}</div>
            <div class="metric-label">EMA 26</div>
          </div>
        </div>
        ` : ''}

        ${analysis.technical_analysis_results.daily.bollinger_bands ? `
        <h3 style="color: #374151; margin: 24px 0 16px 0;">Bollinger Bands</h3>
        <div class="metric-grid-3">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.upper)}</div>
            <div class="metric-label">Upper Band</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.middle)}</div>
            <div class="metric-label">Middle Band</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.lower)}</div>
            <div class="metric-label">Lower Band</div>
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.fundamental_analysis ? `
      <div class="section">
        <h2><span class="section-icon">📊</span>Fundamental Analysis</h2>
        <div class="analysis-content">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.fundamental_analysis)}
        </div>
      </div>
      ` : ''}

      ${analysis.income_statement_data?.data?.[0] ? `
      <div class="section">
        <h2><span class="section-icon">💰</span>Latest Quarter Financials</h2>
        <div class="metric-grid-4">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatLargeNumber(analysis.income_statement_data.data[0].totalRevenue)}</div>
            <div class="metric-label">Total Revenue</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatLargeNumber(analysis.income_statement_data.data[0].netIncome)}</div>
            <div class="metric-label">Net Income</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatLargeNumber(analysis.income_statement_data.data[0].grossProfit)}</div>
            <div class="metric-label">Gross Profit</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatLargeNumber(analysis.income_statement_data.data[0].operatingIncome)}</div>
            <div class="metric-label">Operating Income</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${analysis.balance_sheet_data?.data?.[0] ? `
      <div class="section">
        <h2><span class="section-icon">🏛️</span>Balance Sheet Highlights</h2>
        <div class="metric-grid-4">
          <div class="metric-card blue">
            <div class="metric-value blue">${formatLargeNumber(analysis.balance_sheet_data.data[0].totalAssets)}</div>
            <div class="metric-label">Total Assets</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatLargeNumber(analysis.balance_sheet_data.data[0].totalLiabilities)}</div>
            <div class="metric-label">Total Liabilities</div>
          </div>
          <div class="metric-card blue">
            <div class="metric-value blue">${formatLargeNumber(analysis.balance_sheet_data.data[0].totalShareholderEquity)}</div>
            <div class="metric-label">Shareholder Equity</div>
          </div>
          <div class="metric-card gray">
            <div class="metric-value gray">${formatLargeNumber(analysis.balance_sheet_data.data[0].cashAndCashEquivalentsAtCarryingValue)}</div>
            <div class="metric-label">Cash & Equivalents</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.risk_analysis ? `
      <div class="section">
        <h2><span class="section-icon">🛡️</span>Risk Analysis</h2>
        <div class="analysis-content yellow">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.risk_analysis)}
        </div>
      </div>
      ` : ''}

      ${analysis.earnings_estimates?.data ? `
      <div class="section">
        <h2><span class="section-icon">🎯</span>Earnings Estimates</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>EPS Estimate</th>
                <th>High/Low</th>
                <th>Revenue Estimate</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.earnings_estimates.data.slice(0, 4).map((estimate: any) => `
                <tr>
                  <td style="font-weight: 600;">${estimate.horizon}</td>
                  <td>${formatCurrency(estimate.eps_estimate_average)}</td>
                  <td>${formatCurrency(estimate.eps_estimate_high)} / ${formatCurrency(estimate.eps_estimate_low)}</td>
                  <td>${formatLargeNumber(estimate.revenue_estimate_average)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.sentiment_analysis ? `
      <div class="section">
        <h2><span class="section-icon">📊</span>Sentiment Analysis</h2>
        <div class="analysis-content yellow">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.sentiment_analysis)}
        </div>
      </div>
      ` : ''}

      ${analysis.analysis_overview?.analysis_data?.investment_insights ? `
      <div class="section">
        <h2><span class="section-icon">🎯</span>Investment Insights</h2>
        <div class="analysis-content blue">
          ${renderAnalysisSection(analysis.analysis_overview.analysis_data.investment_insights)}
        </div>
      </div>
      ` : ''}

      <div class="disclaimer">
        <h3>⚠️ Important Disclaimer</h3>
        <p style="margin: 0; line-height: 1.5;">
          This analysis is generated by AI and is for educational purposes only. It should not be considered as financial advice. 
          Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0; color: #6b7280; font-size: 16px; font-weight: 600;">
        Generated by <strong>Veloryn</strong> - AI-Powered Financial Intelligence
      </p>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">
        © ${new Date().getFullYear()} Veloryn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Create plain text version
  const text = `
${analysis.ticker} Financial Analysis
Generated by Veloryn on ${formatDate(analysis.date || analysis.timestamp || analysis.created_at || analysis.createdAt)}
${analysis.company_overview?.data?.[0] ? `Company: ${analysis.company_overview.data[0].Name}` : ''}

${analysis.analysis_overview?.analysis_data?.overall_analysis ? `
OVERALL ANALYSIS
${Array.isArray(analysis.analysis_overview.analysis_data.overall_analysis) 
  ? analysis.analysis_overview.analysis_data.overall_analysis.join('\n\n')
  : analysis.analysis_overview.analysis_data.overall_analysis}
` : ''}

${analysis.company_overview?.data?.[0] ? `
KEY FINANCIAL METRICS
Market Cap: ${formatLargeNumber(analysis.company_overview.data[0].MarketCapitalization)}
P/E Ratio: ${analysis.company_overview.data[0].PERatio || 'N/A'}
EPS: ${formatCurrency(analysis.company_overview.data[0].EPS)}
Dividend Yield: ${formatPercent(analysis.company_overview.data[0].DividendYield * 100)}
52-Week Range: ${formatCurrency(analysis.company_overview.data[0]._52WeekLow)} - ${formatCurrency(analysis.company_overview.data[0]._52WeekHigh)}
50-Day MA: ${formatCurrency(analysis.company_overview.data[0]._50DayMovingAverage)}
200-Day MA: ${formatCurrency(analysis.company_overview.data[0]._200DayMovingAverage)}
` : ''}

${analysis.analysis_overview?.analysis_data?.investment_narrative ? `
INVESTMENT NARRATIVE
${Array.isArray(analysis.analysis_overview.analysis_data.investment_narrative) 
  ? analysis.analysis_overview.analysis_data.investment_narrative.join('\n\n')
  : analysis.analysis_overview.analysis_data.investment_narrative}
` : ''}

${analysis.analysis_overview?.analysis_data?.technical_analysis ? `
TECHNICAL ANALYSIS
${Array.isArray(analysis.analysis_overview.analysis_data.technical_analysis) 
  ? analysis.analysis_overview.analysis_data.technical_analysis.join('\n\n')
  : analysis.analysis_overview.analysis_data.technical_analysis}
` : ''}

${analysis.technical_analysis_results?.daily ? `
TECHNICAL INDICATORS
RSI: ${analysis.technical_analysis_results.daily.rsi?.toFixed(2) || 'N/A'}
MACD: ${analysis.technical_analysis_results.daily.macd?.macd_line?.toFixed(2) || 'N/A'}
SAR: ${formatCurrency(analysis.technical_analysis_results.daily.sar)}
CCI: ${analysis.technical_analysis_results.daily.cci?.toFixed(2) || 'N/A'}
OBV: ${formatLargeNumber(analysis.technical_analysis_results.daily.obv)}
Momentum: ${analysis.technical_analysis_results.daily.momentum?.toFixed(2) || 'N/A'}

${analysis.technical_analysis_results.daily.moving_averages ? `
Moving Averages:
SMA 20: ${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_20)}
SMA 50: ${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_50)}
SMA 200: ${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.sma_200)}
EMA 12: ${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.ema_12)}
EMA 26: ${formatCurrency(analysis.technical_analysis_results.daily.moving_averages.ema_26)}
` : ''}

${analysis.technical_analysis_results.daily.bollinger_bands ? `
Bollinger Bands:
Upper: ${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.upper)}
Middle: ${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.middle)}
Lower: ${formatCurrency(analysis.technical_analysis_results.daily.bollinger_bands.lower)}
` : ''}
` : ''}

${analysis.analysis_overview?.analysis_data?.fundamental_analysis ? `
FUNDAMENTAL ANALYSIS
${Array.isArray(analysis.analysis_overview.analysis_data.fundamental_analysis) 
  ? analysis.analysis_overview.analysis_data.fundamental_analysis.join('\n\n')
  : analysis.analysis_overview.analysis_data.fundamental_analysis}
` : ''}

${analysis.income_statement_data?.data?.[0] ? `
LATEST QUARTER FINANCIALS
Total Revenue: ${formatLargeNumber(analysis.income_statement_data.data[0].totalRevenue)}
Net Income: ${formatLargeNumber(analysis.income_statement_data.data[0].netIncome)}
Gross Profit: ${formatLargeNumber(analysis.income_statement_data.data[0].grossProfit)}
Operating Income: ${formatLargeNumber(analysis.income_statement_data.data[0].operatingIncome)}
` : ''}

${analysis.balance_sheet_data?.data?.[0] ? `
BALANCE SHEET HIGHLIGHTS
Total Assets: ${formatLargeNumber(analysis.balance_sheet_data.data[0].totalAssets)}
Total Liabilities: ${formatLargeNumber(analysis.balance_sheet_data.data[0].totalLiabilities)}
Shareholder Equity: ${formatLargeNumber(analysis.balance_sheet_data.data[0].totalShareholderEquity)}
Cash & Equivalents: ${formatLargeNumber(analysis.balance_sheet_data.data[0].cashAndCashEquivalentsAtCarryingValue)}
` : ''}

${analysis.analysis_overview?.analysis_data?.risk_analysis ? `
RISK ANALYSIS
${Array.isArray(analysis.analysis_overview.analysis_data.risk_analysis) 
  ? analysis.analysis_overview.analysis_data.risk_analysis.join('\n\n')
  : analysis.analysis_overview.analysis_data.risk_analysis}
` : ''}

${analysis.earnings_estimates?.data ? `
EARNINGS ESTIMATES
${analysis.earnings_estimates.data.slice(0, 4).map((estimate: any) => 
  `${estimate.horizon}: EPS ${formatCurrency(estimate.eps_estimate_average)} (${formatCurrency(estimate.eps_estimate_low)}-${formatCurrency(estimate.eps_estimate_high)}), Revenue ${formatLargeNumber(estimate.revenue_estimate_average)}`
).join('\n')}
` : ''}

${analysis.analysis_overview?.analysis_data?.sentiment_analysis ? `
SENTIMENT ANALYSIS
${Array.isArray(analysis.analysis_overview.analysis_data.sentiment_analysis) 
  ? analysis.analysis_overview.analysis_data.sentiment_analysis.join('\n\n')
  : analysis.analysis_overview.analysis_data.sentiment_analysis}
` : ''}

${analysis.analysis_overview?.analysis_data?.investment_insights ? `
INVESTMENT INSIGHTS
${Array.isArray(analysis.analysis_overview.analysis_data.investment_insights) 
  ? analysis.analysis_overview.analysis_data.investment_insights.join('\n\n')
  : analysis.analysis_overview.analysis_data.investment_insights}
` : ''}

IMPORTANT DISCLAIMER
This analysis is generated by AI and is for educational purposes only. It should not be considered as financial advice. 
Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.

---
Generated by Veloryn - AI-Powered Financial Intelligence
© ${new Date().getFullYear()} Veloryn. All rights reserved.
  `.trim();

  return { subject, html, text };
}

import { FinancialAnalysis, EmailContent } from './types';

export function formatAnalysisForEmail(analysis: FinancialAnalysis): EmailContent {
  const formatDate = (dateObj: any) => {
    if (dateObj && dateObj._seconds) {
      return new Date(dateObj._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const data = analysis.analysis_data;
  const subject = `Veloryn Financial Analysis: ${analysis.ticker}`;

  // Create HTML email content
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .content { padding: 24px; }
    .section { margin-bottom: 32px; }
    .section h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .metric-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .recommendation { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .recommendation-action { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: uppercase; }
    .buy { background: #dcfce7; color: #166534; }
    .hold { background: #fef3c7; color: #92400e; }
    .sell { background: #fee2e2; color: #991b1b; }
    .risk-card { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .disclaimer { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    @media (max-width: 600px) {
      .metric-grid { grid-template-columns: 1fr; }
      .container { margin: 0; }
      .content { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${analysis.ticker} Financial Analysis</h1>
      <p>AI-Generated Market Intelligence Report</p>
      <p>Generated on ${formatDate(analysis.created_at)}</p>
    </div>

    <div class="content">
      ${data.analysis?.overview ? `
      <div class="section">
        <h2>📊 Market Overview</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(data.analysis.overview.current_price)}</div>
            <div class="metric-label">Current Price</div>
            <div style="color: ${data.analysis.overview.change_percent?.startsWith('+') ? '#059669' : '#dc2626'}; font-weight: 600; margin-top: 4px;">
              ${data.analysis.overview.change_percent}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.analysis.overview.market_cap}</div>
            <div class="metric-label">Market Cap</div>
            <div style="color: #6b7280; margin-top: 4px;">P/E: ${data.analysis.overview.pe_ratio}</div>
          </div>
        </div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(data.analysis.overview['52_week_high'])}</div>
            <div class="metric-label">52-Week High</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(data.analysis.overview['52_week_low'])}</div>
            <div class="metric-label">52-Week Low</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${data.analysis?.recommendations ? `
      <div class="section">
        <h2>🎯 Investment Recommendation</h2>
        <div class="recommendation">
          <div style="text-align: center; margin-bottom: 16px;">
            <span class="recommendation-action ${data.analysis.recommendations.action}">${data.analysis.recommendations.action}</span>
          </div>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">${formatCurrency(data.analysis.recommendations.target_price)}</div>
              <div class="metric-label">Target Price</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${Math.round(data.analysis.recommendations.confidence * 100)}%</div>
              <div class="metric-label">Confidence Level</div>
            </div>
          </div>
          ${data.analysis.recommendations.reasoning ? `
          <div style="margin-top: 16px;">
            <strong>Key Reasoning:</strong>
            <ul>
              ${data.analysis.recommendations.reasoning.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${data.analysis.recommendations.stop_loss ? `
          <div style="background: #fee2e2; padding: 12px; border-radius: 6px; margin-top: 16px;">
            <strong>Stop Loss:</strong> ${formatCurrency(data.analysis.recommendations.stop_loss)}
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      ${data.analysis?.technical_analysis ? `
      <div class="section">
        <h2>📈 Technical Analysis</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value" style="color: ${data.analysis.technical_analysis.trend === 'bullish' ? '#059669' : data.analysis.technical_analysis.trend === 'bearish' ? '#dc2626' : '#d97706'};">
              ${data.analysis.technical_analysis.trend?.toUpperCase()}
            </div>
            <div class="metric-label">Overall Trend</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.analysis.technical_analysis.rsi}</div>
            <div class="metric-label">RSI</div>
          </div>
        </div>
        ${data.analysis.technical_analysis.macd ? `
        <div style="text-align: center; margin-top: 16px;">
          <span style="padding: 8px 16px; border-radius: 20px; background: ${data.analysis.technical_analysis.macd.signal === 'buy' ? '#dcfce7' : data.analysis.technical_analysis.macd.signal === 'sell' ? '#fee2e2' : '#fef3c7'}; color: ${data.analysis.technical_analysis.macd.signal === 'buy' ? '#166534' : data.analysis.technical_analysis.macd.signal === 'sell' ? '#991b1b' : '#92400e'}; font-weight: 600;">
            MACD Signal: ${data.analysis.technical_analysis.macd.signal?.toUpperCase()}
          </span>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${data.analysis?.risk_analysis ? `
      <div class="section">
        <h2>⚠️ Risk Analysis</h2>
        <div class="risk-card">
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value" style="color: ${data.analysis.risk_analysis.risk_level === 'high' ? '#dc2626' : data.analysis.risk_analysis.risk_level === 'medium' ? '#d97706' : '#059669'};">
                ${data.analysis.risk_analysis.risk_level?.toUpperCase()}
              </div>
              <div class="metric-label">Risk Level</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.analysis.risk_analysis.beta}</div>
              <div class="metric-label">Beta</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 12px;">
            <span style="color: #dc2626; font-weight: 600;">Max Drawdown: ${data.analysis.risk_analysis.max_drawdown}%</span>
          </div>
        </div>
      </div>
      ` : ''}

      ${data.analysis?.storytelling && data.analysis.storytelling.length > 0 ? `
      <div class="section">
        <h2>📝 Investment Narrative</h2>
        ${data.analysis.storytelling.map(paragraph => `
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; line-height: 1.6;">${paragraph}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="disclaimer">
        <h3 style="color: #dc2626; margin-top: 0;">⚠️ Important Disclaimer</h3>
        <p style="margin-bottom: 0; font-size: 13px;">
          This AI-generated analysis is provided for educational and informational purposes only. 
          It is NOT financial advice, NOT an offer to buy or sell securities, and NOT guaranteed 
          for accuracy, completeness, or profitability. Market conditions change rapidly, and past 
          performance does not guarantee future results. Always conduct your own research and 
          consult qualified financial advisors before making investment decisions.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Generated by <strong>Veloryn</strong> - AI-Powered Financial Intelligence
      </p>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
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
Generated by Veloryn on ${formatDate(analysis.created_at)}

${data.analysis?.overview ? `
MARKET OVERVIEW
Current Price: ${formatCurrency(data.analysis.overview.current_price)} (${data.analysis.overview.change_percent})
Market Cap: ${data.analysis.overview.market_cap}
P/E Ratio: ${data.analysis.overview.pe_ratio}
52-Week Range: ${formatCurrency(data.analysis.overview['52_week_low'])} - ${formatCurrency(data.analysis.overview['52_week_high'])}
` : ''}

${data.analysis?.recommendations ? `
INVESTMENT RECOMMENDATION
Action: ${data.analysis.recommendations.action.toUpperCase()}
Target Price: ${formatCurrency(data.analysis.recommendations.target_price)}
Confidence: ${Math.round(data.analysis.recommendations.confidence * 100)}%

Key Reasoning:
${data.analysis.recommendations.reasoning?.map(reason => `• ${reason}`).join('\n') || 'No reasoning provided'}

${data.analysis.recommendations.stop_loss ? `Stop Loss: ${formatCurrency(data.analysis.recommendations.stop_loss)}` : ''}
` : ''}

${data.analysis?.technical_analysis ? `
TECHNICAL ANALYSIS
Overall Trend: ${data.analysis.technical_analysis.trend?.toUpperCase()}
RSI: ${data.analysis.technical_analysis.rsi}
${data.analysis.technical_analysis.macd ? `MACD Signal: ${data.analysis.technical_analysis.macd.signal?.toUpperCase()}` : ''}
` : ''}

${data.analysis?.risk_analysis ? `
RISK ANALYSIS
Risk Level: ${data.analysis.risk_analysis.risk_level?.toUpperCase()}
Beta: ${data.analysis.risk_analysis.beta}
Max Drawdown: ${data.analysis.risk_analysis.max_drawdown}%
` : ''}

${data.analysis?.storytelling && data.analysis.storytelling.length > 0 ? `
INVESTMENT NARRATIVE
${data.analysis.storytelling.join('\n\n')}
` : ''}

IMPORTANT DISCLAIMER
This AI-generated analysis is provided for educational and informational purposes only. 
It is NOT financial advice, NOT an offer to buy or sell securities, and NOT guaranteed 
for accuracy, completeness, or profitability. Market conditions change rapidly, and past 
performance does not guarantee future results. Always conduct your own research and 
consult qualified financial advisors before making investment decisions.

---
Generated by Veloryn - AI-Powered Financial Intelligence
© ${new Date().getFullYear()} Veloryn. All rights reserved.
  `.trim();

  return { subject, html, text };
}

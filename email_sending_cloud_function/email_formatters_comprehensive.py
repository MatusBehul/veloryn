# Updated email formatting utilities for comprehensive financial analysis data
# This module formats the complete analysis data structure for email delivery

from typing import Dict, Any, List
from datetime import datetime
import os
import re

ISPROD = os.environ.get('ISPROD', 'false').lower() == 'true'

def format_currency(value):
    """Format a number as currency"""
    if value is None:
        return 'N/A'
    try:
        if isinstance(value, str):
            value = float(value)
        if isinstance(value, (int, float)):
            return f"${value:,.2f}"
    except:
        pass
    return 'N/A'

def format_large_number(value):
    """Format large numbers with appropriate suffixes"""
    if value is None:
        return 'N/A'
    try:
        if isinstance(value, str):
            value = float(value)
        if isinstance(value, (int, float)):
            if value >= 1e12:
                return f"${value/1e12:.2f}T"
            elif value >= 1e9:
                return f"${value/1e9:.2f}B"
            elif value >= 1e6:
                return f"${value/1e6:.2f}M"
            elif value >= 1e3:
                return f"${value/1e3:.2f}K"
            else:
                return format_currency(value)
    except:
        pass
    return 'N/A'

def format_percent(value):
    """Format a number as percentage"""
    if value is None:
        return 'N/A'
    try:
        if isinstance(value, str):
            value = float(value)
        if isinstance(value, (int, float)):
            return f"{value:.2f}%"
    except:
        pass
    return 'N/A'

def format_date(date_obj):
    """Format date for display"""
    if date_obj:
        # Handle Firestore timestamp
        if hasattr(date_obj, 'timestamp'):
            return datetime.fromtimestamp(date_obj.timestamp()).strftime('%B %d, %Y')
        # Handle string dates
        if isinstance(date_obj, str):
            try:
                if len(date_obj) == 10 and date_obj.count('-') == 2:  # YYYY-MM-DD
                    return datetime.strptime(date_obj, '%Y-%m-%d').strftime('%B %d, %Y')
                else:
                    return datetime.fromisoformat(date_obj.replace('Z', '+00:00')).strftime('%B %d, %Y')
            except:
                pass
    return datetime.now().strftime('%B %d, %Y')

def format_text_with_bold(text):
    """Convert **bold** markdown to HTML <strong> tags"""
    if not text:
        return text
    
    # Handle non-string types
    if not isinstance(text, str):
        return str(text)
    
    return re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)

def render_analysis_section(content):
    """Render analysis content (string, list, or object) to HTML"""
    if not content:
        return ''
    
    if isinstance(content, list):
        html_parts = []
        for item in content:
            if isinstance(item, dict):
                # Handle dictionary objects (like investment recommendations)
                html_parts.append('<div style="margin: 0 0 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">')
                for key, value in item.items():
                    html_parts.append(f'<div style="margin-bottom: 8px;"><strong>{key}:</strong> {format_text_with_bold(str(value))}</div>')
                html_parts.append('</div>')
            else:
                html_parts.append(f'<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151;">{format_text_with_bold(str(item))}</p>')
        return ''.join(html_parts)
    elif isinstance(content, dict):
        # Handle single dictionary object
        html_parts = ['<div style="margin: 0 0 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">']
        for key, value in content.items():
            html_parts.append(f'<div style="margin-bottom: 8px;"><strong>{key}:</strong> {format_text_with_bold(str(value))}</div>')
        html_parts.append('</div>')
        return ''.join(html_parts)
    else:
        return f'<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151;">{format_text_with_bold(str(content))}</p>'

def format_analysis_for_email_comprehensive(analysis: Dict[str, Any]) -> Dict[str, str]:
    """
    Format the comprehensive financial analysis data for email delivery
    """
    ticker = analysis.get('ticker', 'Unknown')
    subject = f"{'[TEST] ' if not ISPROD else ''}Financial Analysis: {ticker} - {format_date(analysis.get('date') or analysis.get('timestamp') or analysis.get('created_at') or analysis.get('createdAt'))}"
    
    company_name = ''
    if analysis.get('company_overview', {}).get('data'):
        company_name = analysis['company_overview']['data'][0].get('Name', '')

    # Build HTML email content
    html_sections = []

    # Header
    html_sections.append(f"""
    <div class="header">
      <h1>{ticker} Financial Analysis</h1>
      <p>AI-Generated Market Intelligence Report</p>
      <p>Generated on {format_date(analysis.get('date') or analysis.get('timestamp') or analysis.get('created_at') or analysis.get('createdAt'))}</p>
      {f'<p>{company_name}</p>' if company_name else ''}
    </div>
    """)

    # Overall Analysis
    overall_analysis = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('overall_analysis')
    if overall_analysis:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">🧠</span>Overall Analysis</h2>
          <div class="analysis-content">
            {render_analysis_section(overall_analysis)}
          </div>
        </div>
        """)

    # Key Financial Metrics
    company_data = analysis.get('company_overview', {}).get('data', [{}])[0] if analysis.get('company_overview', {}).get('data') else {}
    if company_data:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">📊</span>Key Financial Metrics</h2>
          <div class="metric-grid-4">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_large_number(company_data.get('MarketCapitalization'))}</div>
              <div class="metric-label">Market Cap</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{company_data.get('PERatio', 'N/A')}</div>
              <div class="metric-label">P/E Ratio</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(company_data.get('EPS'))}</div>
              <div class="metric-label">EPS</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_percent((company_data.get('DividendYield', 0) or 0) * 100)}</div>
              <div class="metric-label">Dividend Yield</div>
            </div>
          </div>
          <div class="metric-grid-4">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(company_data.get('_52WeekHigh'))}</div>
              <div class="metric-label">52W High</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_currency(company_data.get('_52WeekLow'))}</div>
              <div class="metric-label">52W Low</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(company_data.get('_50DayMovingAverage'))}</div>
              <div class="metric-label">50-Day MA</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_currency(company_data.get('_200DayMovingAverage'))}</div>
              <div class="metric-label">200-Day MA</div>
            </div>
          </div>
        </div>
        """)

    # Investment Narrative
    investment_narrative = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('investment_narrative')
    if investment_narrative:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">💡</span>Investment Narrative</h2>
          <div class="analysis-content blue">
            {render_analysis_section(investment_narrative)}
          </div>
        </div>
        """)

    # Technical Analysis Text
    technical_analysis = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('technical_analysis')
    if technical_analysis:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">⚡</span>Technical Analysis</h2>
          <div class="analysis-content">
            {render_analysis_section(technical_analysis)}
          </div>
        </div>
        """)

    # Technical Indicators
    tech_indicators = analysis.get('technical_analysis_results', {}).get('daily')
    if tech_indicators:
        # Extract values safely for f-string formatting
        rsi_value = tech_indicators.get('rsi')
        rsi_display = f"{rsi_value:.2f}" if rsi_value is not None else 'N/A'
        
        macd_value = tech_indicators.get('macd', {}).get('macd_line') if tech_indicators.get('macd') else None
        macd_display = f"{macd_value:.2f}" if macd_value is not None else 'N/A'
        
        cci_value = tech_indicators.get('cci')
        cci_display = f"{cci_value:.2f}" if cci_value is not None else 'N/A'
        
        momentum_value = tech_indicators.get('momentum')
        momentum_display = f"{momentum_value:.2f}" if momentum_value is not None else 'N/A'
        
        indicators_html = f"""
        <div class="section">
          <h2><span class="section-icon">📈</span>Technical Indicators</h2>
          <h3 style="color: #374151; margin: 0 0 16px 0;">Key Indicators</h3>
          <div class="metric-grid-3">
            <div class="metric-card blue">
              <div class="metric-value blue">{rsi_display}</div>
              <div class="metric-label">RSI</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{macd_display}</div>
              <div class="metric-label">MACD</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(tech_indicators.get('sar'))}</div>
              <div class="metric-label">SAR</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{cci_display}</div>
              <div class="metric-label">CCI</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_large_number(tech_indicators.get('obv'))}</div>
              <div class="metric-label">OBV</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{momentum_display}</div>
              <div class="metric-label">Momentum</div>
            </div>
          </div>
        """
        
        # Moving Averages
        moving_averages = tech_indicators.get('moving_averages')
        if moving_averages:
            indicators_html += f"""
          <h3 style="color: #374151; margin: 24px 0 16px 0;">Moving Averages</h3>
          <div class="metric-grid" style="grid-template-columns: repeat(5, 1fr);">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(moving_averages.get('sma_20'))}</div>
              <div class="metric-label">SMA 20</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(moving_averages.get('sma_50'))}</div>
              <div class="metric-label">SMA 50</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(moving_averages.get('sma_200'))}</div>
              <div class="metric-label">SMA 200</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_currency(moving_averages.get('ema_12'))}</div>
              <div class="metric-label">EMA 12</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_currency(moving_averages.get('ema_26'))}</div>
              <div class="metric-label">EMA 26</div>
            </div>
          </div>
            """
        
        # Bollinger Bands
        bollinger_bands = tech_indicators.get('bollinger_bands')
        if bollinger_bands:
            indicators_html += f"""
          <h3 style="color: #374151; margin: 24px 0 16px 0;">Bollinger Bands</h3>
          <div class="metric-grid-3">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(bollinger_bands.get('upper'))}</div>
              <div class="metric-label">Upper Band</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_currency(bollinger_bands.get('middle'))}</div>
              <div class="metric-label">Middle Band</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_currency(bollinger_bands.get('lower'))}</div>
              <div class="metric-label">Lower Band</div>
            </div>
          </div>
            """
        
        indicators_html += "</div>"
        html_sections.append(indicators_html)

    # Fundamental Analysis
    fundamental_analysis = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('fundamental_analysis')
    if fundamental_analysis:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">📊</span>Fundamental Analysis</h2>
          <div class="analysis-content">
            {render_analysis_section(fundamental_analysis)}
          </div>
        </div>
        """)

    # Latest Quarter Financials
    income_data = analysis.get('income_statement_data', {}).get('data', [{}])[0] if analysis.get('income_statement_data', {}).get('data') else {}
    if income_data:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">💰</span>Latest Quarter Financials</h2>
          <div class="metric-grid-4">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_large_number(income_data.get('totalRevenue'))}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_large_number(income_data.get('netIncome'))}</div>
              <div class="metric-label">Net Income</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_large_number(income_data.get('grossProfit'))}</div>
              <div class="metric-label">Gross Profit</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_large_number(income_data.get('operatingIncome'))}</div>
              <div class="metric-label">Operating Income</div>
            </div>
          </div>
        </div>
        """)

    # Balance Sheet Highlights
    balance_data = analysis.get('balance_sheet_data', {}).get('data', [{}])[0] if analysis.get('balance_sheet_data', {}).get('data') else {}
    if balance_data:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">🏛️</span>Balance Sheet Highlights</h2>
          <div class="metric-grid-4">
            <div class="metric-card blue">
              <div class="metric-value blue">{format_large_number(balance_data.get('totalAssets'))}</div>
              <div class="metric-label">Total Assets</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_large_number(balance_data.get('totalLiabilities'))}</div>
              <div class="metric-label">Total Liabilities</div>
            </div>
            <div class="metric-card blue">
              <div class="metric-value blue">{format_large_number(balance_data.get('totalShareholderEquity'))}</div>
              <div class="metric-label">Shareholder Equity</div>
            </div>
            <div class="metric-card gray">
              <div class="metric-value gray">{format_large_number(balance_data.get('cashAndCashEquivalentsAtCarryingValue'))}</div>
              <div class="metric-label">Cash & Equivalents</div>
            </div>
          </div>
        </div>
        """)

    # Risk Analysis
    risk_analysis = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('risk_analysis')
    if risk_analysis:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">🛡️</span>Risk Analysis</h2>
          <div class="analysis-content yellow">
            {render_analysis_section(risk_analysis)}
          </div>
        </div>
        """)

    # Earnings Estimates
    earnings_data = analysis.get('earnings_estimates', {}).get('data', [])
    if earnings_data:
        earnings_rows = ""
        for estimate in earnings_data[:4]:
            earnings_rows += f"""
              <tr>
                <td style="font-weight: 600;">{estimate.get('horizon', 'N/A')}</td>
                <td>{format_currency(estimate.get('eps_estimate_average'))}</td>
                <td>{format_currency(estimate.get('eps_estimate_high'))} / {format_currency(estimate.get('eps_estimate_low'))}</td>
                <td>{format_large_number(estimate.get('revenue_estimate_average'))}</td>
              </tr>
            """
        
        html_sections.append(f"""
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
                {earnings_rows}
              </tbody>
            </table>
          </div>
        </div>
        """)

    # Sentiment Analysis
    sentiment_analysis = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('sentiment_analysis')
    if sentiment_analysis:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">📊</span>Sentiment Analysis</h2>
          <div class="analysis-content yellow">
            {render_analysis_section(sentiment_analysis)}
          </div>
        </div>
        """)

    # Investment Recommendations
    investment_recommendations = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('investment_recommendations')
    if investment_recommendations:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">🎯</span>Investment Insights</h2>
          <div class="analysis-content blue">
            {render_analysis_section(investment_recommendations)}
          </div>
        </div>
        """)

    # Supporting Details
    supporting_details = analysis.get('analysis_overview', {}).get('analysis_data', {}).get('supporting_details')
    if supporting_details:
        html_sections.append(f"""
        <div class="section">
          <h2><span class="section-icon">📊</span>Supporting Details</h2>
          <div class="analysis-content blue">
            {render_analysis_section(supporting_details)}
          </div>
        </div>
        """)

    # Complete HTML with styling
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #374151; 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb; 
    }}
    .container {{ 
      max-width: 800px; 
      margin: 0 auto; 
      background-color: white; 
    }}
    .header {{ 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white; 
      padding: 32px 24px; 
      text-align: center; 
    }}
    .header h1 {{ 
      margin: 0; 
      font-size: 32px; 
      font-weight: bold; 
    }}
    .header p {{ 
      margin: 8px 0 0 0; 
      opacity: 0.9; 
      font-size: 16px; 
    }}
    .content {{ 
      padding: 32px 24px; 
    }}
    .section {{ 
      margin-bottom: 40px; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      padding: 24px; 
      background: #ffffff; 
    }}
    .section h2 {{ 
      color: #1f2937; 
      font-size: 24px; 
      font-weight: 600; 
      margin: 0 0 20px 0; 
      border-bottom: 2px solid #e5e7eb; 
      padding-bottom: 12px; 
      display: flex; 
      align-items: center; 
    }}
    .section-icon {{ 
      margin-right: 12px; 
      font-size: 20px; 
    }}
    .metric-grid {{ 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }}
    .metric-grid-3 {{ 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }}
    .metric-grid-4 {{ 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr 1fr; 
      gap: 16px; 
      margin-bottom: 20px; 
    }}
    .metric-card {{ 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 16px; 
      text-align: center; 
    }}
    .metric-card.blue {{ background: #eff6ff; border-color: #bfdbfe; }}
    .metric-card.gray {{ background: #f9fafb; border-color: #d1d5db; }}
    .metric-card.yellow {{ background: #fffbeb; border-color: #fde68a; }}
    
    .metric-value {{ 
      font-size: 20px; 
      font-weight: bold; 
      color: #1f2937; 
      margin-bottom: 4px; 
    }}
    .metric-value.blue {{ color: #2563eb; }}
    .metric-value.gray {{ color: #4b5563; }}
    .metric-value.yellow {{ color: #d97706; }}
    
    .metric-label {{ 
      font-size: 14px; 
      color: #6b7280; 
      font-weight: 500; 
    }}
    .analysis-content {{
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    }}
    .analysis-content.blue {{ background: #eff6ff; }}
    .analysis-content.yellow {{ background: #fffbeb; }}
    
    .table-container {{
      overflow-x: auto;
      margin: 16px 0;
    }}
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }}
    .data-table th {{
      background: #f9fafb;
      color: #374151;
      font-weight: 600;
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }}
    .data-table td {{
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }}
    .footer {{ 
      background: #f9fafb; 
      padding: 32px 24px; 
      text-align: center; 
      border-top: 1px solid #e5e7eb; 
    }}
    .disclaimer {{ 
      background: #fef2f2; 
      border: 1px solid #fca5a5; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 24px 0; 
      font-size: 14px; 
    }}
    .disclaimer h3 {{
      color: #dc2626;
      margin: 0 0 12px 0;
      font-size: 16px;
    }}
    
    @media (max-width: 600px) {{
      .metric-grid,
      .metric-grid-3,
      .metric-grid-4 {{ 
        grid-template-columns: 1fr; 
      }}
      .container {{ 
        margin: 0; 
      }}
      .content {{ 
        padding: 16px; 
      }}
      .section {{
        padding: 16px;
        margin-bottom: 20px;
      }}
      .header {{
        padding: 20px 16px;
      }}
      .header h1 {{
        font-size: 24px;
      }}
    }}
  </style>
</head>
<body>
  <div class="container">
    {''.join(html_sections)}

    <div class="content">
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
        © {datetime.now().year} Veloryn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    """

    # Create plain text version
    text_sections = []
    text_sections.append(f"{ticker} Financial Analysis")
    text_sections.append(f"Generated by Veloryn on {format_date(analysis.get('date') or analysis.get('timestamp') or analysis.get('created_at') or analysis.get('createdAt'))}")
    if company_name:
        text_sections.append(f"Company: {company_name}")
    text_sections.append("")

    if overall_analysis:
        text_sections.append("OVERALL ANALYSIS")
        if isinstance(overall_analysis, list):
            text_sections.extend(overall_analysis)
        else:
            text_sections.append(overall_analysis)
        text_sections.append("")

    if company_data:
        text_sections.append("KEY FINANCIAL METRICS")
        text_sections.append(f"Market Cap: {format_large_number(company_data.get('MarketCapitalization'))}")
        text_sections.append(f"P/E Ratio: {company_data.get('PERatio', 'N/A')}")
        text_sections.append(f"EPS: {format_currency(company_data.get('EPS'))}")
        text_sections.append(f"Dividend Yield: {format_percent((company_data.get('DividendYield', 0) or 0) * 100)}")
        text_sections.append(f"52-Week Range: {format_currency(company_data.get('_52WeekLow'))} - {format_currency(company_data.get('_52WeekHigh'))}")
        text_sections.append(f"50-Day MA: {format_currency(company_data.get('_50DayMovingAverage'))}")
        text_sections.append(f"200-Day MA: {format_currency(company_data.get('_200DayMovingAverage'))}")
        text_sections.append("")

    # Add other sections to text version...
    text_sections.append("IMPORTANT DISCLAIMER")
    text_sections.append("This analysis is generated by AI and is for educational purposes only. It should not be considered as financial advice.")
    text_sections.append("Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.")
    text_sections.append("")
    text_sections.append("---")
    text_sections.append("Generated by Veloryn - AI-Powered Financial Intelligence")
    text_sections.append(f"© {datetime.now().year} Veloryn. All rights reserved.")

    text = '\n'.join(text_sections)

    return {
        'subject': subject,
        'html': html,
        'text': text
    }

# Keep the old function for backward compatibility
def format_analysis_for_email(analysis: Dict[str, Any]) -> Dict[str, str]:
    """Wrapper function for backward compatibility"""
    return format_analysis_for_email_comprehensive(analysis)

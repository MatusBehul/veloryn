# Shared email formatting utilities
# This module contains functions for formatting financial analysis data for email delivery

from typing import Dict, Any
import os

ISPROD = os.environ.get('ISPROD', 'false').lower() == 'true'

def format_analysis_for_email(analysis: Dict[str, Any]) -> Dict[str, str]:
    """
    Format the financial analysis data for email delivery
    """
    def format_date(date_obj):
        if date_obj and hasattr(date_obj, 'timestamp'):
            from datetime import datetime
            return datetime.fromtimestamp(date_obj.timestamp()).strftime('%B %d, %Y')
        from datetime import datetime
        return datetime.now().strftime('%B %d, %Y')

    def format_currency(value):
        if isinstance(value, (int, float)):
            return f"${value:,.2f}"
        return str(value)

    data = analysis.get('analysis_data', {}).get('analysis', {})
    ticker = analysis.get('ticker', 'Unknown')
    subject = f"{'[TEST] ' if ISPROD else ''}Veloryn Financial Analysis: {ticker}"
    created_at = analysis.get('created_at')

    # Create HTML email content
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }}
    .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
    .header {{ background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 28px; font-weight: bold; }}
    .header p {{ margin: 8px 0 0 0; opacity: 0.9; }}
    .content {{ padding: 24px; }}
    .section {{ margin-bottom: 32px; }}
    .section h2 {{ color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }}
    .metric-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }}
    .metric-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }}
    .metric-value {{ font-size: 24px; font-weight: bold; color: #1f2937; }}
    .metric-label {{ font-size: 14px; color: #6b7280; margin-top: 4px; }}
    .recommendation {{ background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 16px 0; }}
    .recommendation-action {{ display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: uppercase; }}
    .buy {{ background: #dcfce7; color: #166534; }}
    .hold {{ background: #fef3c7; color: #92400e; }}
    .sell {{ background: #fee2e2; color: #991b1b; }}
    .risk-card {{ background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0; }}
    .footer {{ background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }}
    .disclaimer {{ background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; }}
    .indicator-section {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }}
    .indicator-title {{ margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600; }}
    .indicator-values {{ display: grid; gap: 8px; margin-bottom: 12px; font-size: 12px; }}
    .indicator-comment {{ background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-size: 12px; color: #374151; }}
    ul {{ padding-left: 20px; }}
    li {{ margin-bottom: 8px; }}
    @media (max-width: 600px) {{
      .metric-grid {{ grid-template-columns: 1fr; }}
      .container {{ margin: 0; }}
      .content {{ padding: 16px; }}
      .indicator-values {{ grid-template-columns: 1fr !important; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{ticker} Financial Analysis</h1>
      <p>AI-Generated Market Intelligence Report</p>
      <p>Generated on {format_date(created_at)}</p>
    </div>

    <div class="content">
"""

    # Add overview section
    overview = data.get('overview', {})
    if overview:
        current_price = overview.get('current_price', 0)
        change_percent = overview.get('change_percent', '0%')
        market_cap = overview.get('market_cap', 'N/A')
        pe_ratio = overview.get('pe_ratio', 'N/A')
        week_high = overview.get('52_week_high', 0)
        week_low = overview.get('52_week_low', 0)
        
        color = '#059669' if change_percent.startswith('+') else '#dc2626'
        
        html += f"""
      <div class="section">
        <h2>📊 Market Overview</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">{format_currency(current_price)}</div>
            <div class="metric-label">Current Price</div>
            <div style="color: {color}; font-weight: 600; margin-top: 4px;">
              {change_percent}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{market_cap}</div>
            <div class="metric-label">Market Cap</div>
            <div style="color: #6b7280; margin-top: 4px;">P/E: {pe_ratio}</div>
          </div>
        </div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">{format_currency(week_high)}</div>
            <div class="metric-label">52-Week High</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{format_currency(week_low)}</div>
            <div class="metric-label">52-Week Low</div>
          </div>
        </div>
      </div>
"""

    # Add recommendation section
    recommendations = data.get('recommendations', {})
    if recommendations:
        action = recommendations.get('action', 'hold').lower()
        target_price = recommendations.get('target_price', 0)
        confidence = recommendations.get('confidence', 0)
        reasoning = recommendations.get('reasoning', [])
        stop_loss = recommendations.get('stop_loss')
        
        html += f"""
      <div class="section">
        <h2>🎯 Investment Recommendation</h2>
        <div class="recommendation">
          <div style="text-align: center; margin-bottom: 16px;">
            <span class="recommendation-action {action}">{action.upper()}</span>
          </div>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value">{format_currency(target_price)}</div>
              <div class="metric-label">Target Price</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{int(confidence * 100)}%</div>
              <div class="metric-label">Confidence Level</div>
            </div>
          </div>
"""
        
        if reasoning:
            html += """
          <div style="margin-top: 16px;">
            <strong>Key Reasoning:</strong>
            <ul>
"""
            for reason in reasoning:
                html += f"              <li>{reason}</li>\n"
            html += """
            </ul>
          </div>
"""
        
        if stop_loss:
            html += f"""
          <div style="background: #fee2e2; padding: 12px; border-radius: 6px; margin-top: 16px;">
            <strong>Stop Loss:</strong> {format_currency(stop_loss)}
          </div>
"""
        
        html += """
        </div>
      </div>
"""

    # Add technical analysis section
    technical = data.get('technical_analysis', {})
    if technical:
        trend = technical.get('trend', 'neutral')
        rsi = technical.get('rsi', 0)
        macd = technical.get('macd', {})
        
        trend_color = '#059669' if trend == 'bullish' else '#dc2626' if trend == 'bearish' else '#d97706'
        
        html += f"""
      <div class="section">
        <h2>📈 Technical Analysis</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value" style="color: {trend_color};">
              {trend.upper()}
            </div>
            <div class="metric-label">Overall Trend</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{rsi}</div>
            <div class="metric-label">RSI</div>
          </div>
        </div>
"""
        
        if macd and macd.get('signal'):
            signal = macd['signal'].lower()
            signal_color = '#dcfce7' if signal == 'buy' else '#fee2e2' if signal == 'sell' else '#fef3c7'
            text_color = '#166534' if signal == 'buy' else '#991b1b' if signal == 'sell' else '#92400e'
            
            html += f"""
        <div style="text-align: center; margin-top: 16px;">
          <span style="padding: 8px 16px; border-radius: 20px; background: {signal_color}; color: {text_color}; font-weight: 600;">
            MACD Signal: {signal.upper()}
          </span>
        </div>
"""

        # Add technical indicators with comments (like in web version)
        html += """
        <div style="margin-top: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Technical Indicators</h3>
          <div style="display: grid; gap: 16px;">
"""
        
        # Bollinger Bands
        bollinger = technical.get('bollinger_bands', {})
        if bollinger:
            html += f"""
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Bollinger Bands</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
                <div><strong>Upper:</strong> {format_currency(bollinger.get('upper', 0))}</div>
                <div><strong>Middle:</strong> {format_currency(bollinger.get('middle', 0))}</div>
                <div><strong>Lower:</strong> {format_currency(bollinger.get('lower', 0))}</div>
              </div>
"""
            if bollinger.get('comment'):
                html += f"""
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-size: 12px; color: #374151;">
                <strong>Analysis:</strong> {bollinger['comment']}
              </div>
"""
            html += """
            </div>
"""
        
        # Moving Averages
        ma = technical.get('moving_averages', {})
        if ma:
            html += f"""
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Moving Averages</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
"""
            if ma.get('sma_20'):
                html += f"                <div><strong>SMA 20:</strong> {format_currency(ma['sma_20'])}</div>\n"
            if ma.get('sma_50'):
                html += f"                <div><strong>SMA 50:</strong> {format_currency(ma['sma_50'])}</div>\n"
            if ma.get('sma_200'):
                html += f"                <div><strong>SMA 200:</strong> {format_currency(ma['sma_200'])}</div>\n"
            if ma.get('ema_12'):
                html += f"                <div><strong>EMA 12:</strong> {format_currency(ma['ema_12'])}</div>\n"
            if ma.get('ema_26'):
                html += f"                <div><strong>EMA 26:</strong> {format_currency(ma['ema_26'])}</div>\n"
            
            html += """
              </div>
"""
            if ma.get('comment'):
                html += f"""
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-size: 12px; color: #374151;">
                <strong>Analysis:</strong> {ma['comment']}
              </div>
"""
            html += """
            </div>
"""
        
        # Volume Analysis
        volume = technical.get('volume_analysis', {})
        if volume:
            trend_vol = volume.get('volume_trend', 'neutral')
            trend_vol_color = '#059669' if trend_vol == 'increasing' else '#dc2626' if trend_vol == 'decreasing' else '#6b7280'
            
            html += f"""
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Volume Analysis</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
                <div><strong>Trend:</strong> <span style="color: {trend_vol_color}; text-transform: capitalize;">{trend_vol}</span></div>
"""
            if volume.get('volume_ratio'):
                html += f"                <div><strong>Ratio:</strong> {volume['volume_ratio']}</div>\n"
            if volume.get('on_balance_volume'):
                obv_millions = volume['on_balance_volume'] / 1000000
                html += f"                <div><strong>OBV:</strong> {obv_millions:.0f}M</div>\n"
            
            html += """
              </div>
"""
            if volume.get('comment'):
                html += f"""
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-size: 12px; color: #374151;">
                <strong>Analysis:</strong> {volume['comment']}
              </div>
"""
            html += """
            </div>
"""
        
        # MACD Details
        if macd and (macd.get('value') or macd.get('histogram') or macd.get('comment')):
            html += f"""
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">MACD</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
"""
            if macd.get('signal'):
                signal = macd['signal'].lower()
                signal_style = 'color: #166534; background: #dcfce7;' if signal == 'buy' else 'color: #991b1b; background: #fee2e2;' if signal == 'sell' else 'color: #92400e; background: #fef3c7;'
                html += f"""
                <div><strong>Signal:</strong> <span style="padding: 2px 8px; border-radius: 12px; {signal_style} font-size: 10px; text-transform: uppercase;">{signal}</span></div>
"""
            if macd.get('value'):
                html += f"                <div><strong>Value:</strong> {macd['value']}</div>\n"
            if macd.get('histogram'):
                html += f"                <div><strong>Histogram:</strong> {macd['histogram']}</div>\n"
            
            html += """
              </div>
"""
            if macd.get('comment'):
                html += f"""
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-size: 12px; color: #374151;">
                <strong>Analysis:</strong> {macd['comment']}
              </div>
"""
            html += """
            </div>
"""
        
        html += """
          </div>
        </div>
"""
        
        html += """
      </div>
"""

    # Add sentiment analysis section
    sentiment = data.get('sentiment_analysis', {})
    if sentiment:
        overall_sentiment = sentiment.get('overall_sentiment', 'neutral')
        sentiment_score = sentiment.get('sentiment_score', 0)
        fear_greed = sentiment.get('fear_greed_index', 'N/A')
        analyst_ratings = sentiment.get('analyst_ratings', {})
        
        sentiment_color = '#059669' if overall_sentiment == 'positive' else '#dc2626' if overall_sentiment == 'negative' else '#d97706'
        
        html += f"""
      <div class="section">
        <h2>💭 Market Sentiment</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value" style="color: {sentiment_color};">
              {overall_sentiment.upper()}
            </div>
            <div class="metric-label">Overall Sentiment</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{int(sentiment_score * 100)}%</div>
            <div class="metric-label">Sentiment Score</div>
          </div>
        </div>
"""
        
        if fear_greed != 'N/A':
            html += f"""
        <div style="text-align: center; margin: 16px 0;">
          <div class="metric-card" style="display: inline-block; min-width: 150px;">
            <div class="metric-value">{fear_greed}</div>
            <div class="metric-label">Fear & Greed Index</div>
          </div>
        </div>
"""
        
        if analyst_ratings:
            buy_count = analyst_ratings.get('buy', 0)
            hold_count = analyst_ratings.get('hold', 0)
            sell_count = analyst_ratings.get('sell', 0)
            
            html += f"""
        <div style="margin-top: 16px;">
          <h4 style="text-align: center; margin-bottom: 12px; color: #374151;">Analyst Ratings</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div style="text-align: center; padding: 12px; background: #dcfce7; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: bold; color: #059669;">{buy_count}</div>
              <div style="font-size: 12px; color: #374151;">Buy</div>
            </div>
            <div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: bold; color: #d97706;">{hold_count}</div>
              <div style="font-size: 12px; color: #374151;">Hold</div>
            </div>
            <div style="text-align: center; padding: 12px; background: #fee2e2; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: bold; color: #dc2626;">{sell_count}</div>
              <div style="font-size: 12px; color: #374151;">Sell</div>
            </div>
          </div>
        </div>
"""
        
        if sentiment.get('comment'):
            html += f"""
        <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <p style="margin: 0; font-size: 14px; color: #374151;">{sentiment['comment']}</p>
        </div>
"""
        
        html += """
      </div>
"""

    # Add risk analysis section
    risk = data.get('risk_analysis', {})
    if risk:
        risk_level = risk.get('risk_level', 'medium').lower()
        beta = risk.get('beta', 0)
        max_drawdown = risk.get('max_drawdown', 0)
        
        risk_color = '#dc2626' if risk_level == 'high' else '#d97706' if risk_level == 'medium' else '#059669'
        
        html += f"""
      <div class="section">
        <h2>⚠️ Risk Analysis</h2>
        <div class="risk-card">
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value" style="color: {risk_color};">
                {risk_level.upper()}
              </div>
              <div class="metric-label">Risk Level</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{beta}</div>
              <div class="metric-label">Beta</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 12px;">
            <span style="color: #dc2626; font-weight: 600;">Max Drawdown: {max_drawdown}%</span>
          </div>
        </div>
      </div>
"""

    # Add upcoming events section
    events = data.get('events', {})
    if events:
        upcoming = events.get('upcoming_events', [])
        recent_news = events.get('recent_news', [])
        
        if upcoming or recent_news:
            html += """
      <div class="section">
        <h2>📅 Events & News</h2>
"""
            
            if upcoming:
                html += """
        <div style="margin-bottom: 24px;">
          <h4 style="color: #374151; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Upcoming Events</h4>
          <div style="display: grid; gap: 12px;">
"""
                for event in upcoming[:3]:  # Limit to 3 events for email
                    impact = event.get('impact', 'neutral')
                    impact_color = '#dcfce7' if impact == 'positive' else '#fee2e2' if impact == 'negative' else '#f3f4f6'
                    impact_text_color = '#166534' if impact == 'positive' else '#991b1b' if impact == 'negative' else '#374151'
                    
                    html += f"""
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">{event.get('headline', 'Event')}</div>
                <div style="font-size: 12px; color: #6b7280;">{event.get('date', 'Date TBD')}</div>
              </div>
              <span style="padding: 4px 8px; border-radius: 12px; background: {impact_color}; color: {impact_text_color}; font-size: 10px; text-transform: capitalize; font-weight: 600;">
                {impact}
              </span>
            </div>
"""
                html += """
          </div>
        </div>
"""
            
            if recent_news:
                html += """
        <div>
          <h4 style="color: #374151; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Recent News</h4>
          <div style="display: grid; gap: 8px;">
"""
                for news in recent_news[:3]:  # Limit to 3 news items for email
                    impact = news.get('impact', 'neutral')
                    impact_color = '#dcfce7' if impact == 'positive' else '#fee2e2' if impact == 'negative' else '#f3f4f6'
                    impact_text_color = '#166534' if impact == 'positive' else '#991b1b' if impact == 'negative' else '#374151'
                    
                    html += f"""
            <div style="background: #f8fafc; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 2px;">{news.get('headline', 'News Item')}</div>
                <div style="font-size: 11px; color: #6b7280;">{news.get('date', 'Date TBD')}</div>
              </div>
              <span style="margin-left: 12px; padding: 2px 6px; border-radius: 8px; background: {impact_color}; color: {impact_text_color}; font-size: 9px; text-transform: capitalize; font-weight: 600;">
                {impact}
              </span>
            </div>
"""
                html += """
          </div>
        </div>
"""
            
            html += """
      </div>
"""

    # Add storytelling section
    storytelling = data.get('storytelling', [])
    if storytelling:
        html += """
      <div class="section">
        <h2>📝 Investment Narrative</h2>
"""
        for paragraph in storytelling:
            html += f"""
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0; line-height: 1.6;">{paragraph}</p>
        </div>
"""
        html += """
      </div>
"""

    # Add disclaimer and footer
    from datetime import datetime
    html += f"""
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
        © {datetime.now().year} Veloryn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
"""

    # Create plain text version
    text_content = f"""
{ticker} Financial Analysis
Generated by Veloryn on {format_date(created_at)}

"""

    if overview:
        text_content += f"""
MARKET OVERVIEW
Current Price: {format_currency(overview.get('current_price', 0))} ({overview.get('change_percent', '0%')})
Market Cap: {overview.get('market_cap', 'N/A')}
P/E Ratio: {overview.get('pe_ratio', 'N/A')}
52-Week Range: {format_currency(overview.get('52_week_low', 0))} - {format_currency(overview.get('52_week_high', 0))}

"""

    if recommendations:
        text_content += f"""
INVESTMENT RECOMMENDATION
Action: {recommendations.get('action', 'HOLD').upper()}
Target Price: {format_currency(recommendations.get('target_price', 0))}
Confidence: {int(recommendations.get('confidence', 0) * 100)}%

Key Reasoning:
"""
        for reason in recommendations.get('reasoning', []):
            text_content += f"• {reason}\n"
        
        if recommendations.get('stop_loss'):
            text_content += f"\nStop Loss: {format_currency(recommendations['stop_loss'])}\n"
        text_content += "\n"

    if technical:
        text_content += f"""
TECHNICAL ANALYSIS
Overall Trend: {technical.get('trend', 'NEUTRAL').upper()}
RSI: {technical.get('rsi', 0)}
"""
        if technical.get('macd', {}).get('signal'):
            text_content += f"MACD Signal: {technical['macd']['signal'].upper()}\n"
        
        # Add technical indicators
        bollinger = technical.get('bollinger_bands', {})
        if bollinger:
            text_content += f"""
Bollinger Bands:
  Upper: {format_currency(bollinger.get('upper', 0))}
  Middle: {format_currency(bollinger.get('middle', 0))}
  Lower: {format_currency(bollinger.get('lower', 0))}
"""
            if bollinger.get('comment'):
                text_content += f"  Analysis: {bollinger['comment']}\n"
        
        ma = technical.get('moving_averages', {})
        if ma:
            text_content += "\nMoving Averages:\n"
            if ma.get('sma_20'): text_content += f"  SMA 20: {format_currency(ma['sma_20'])}\n"
            if ma.get('sma_50'): text_content += f"  SMA 50: {format_currency(ma['sma_50'])}\n"
            if ma.get('sma_200'): text_content += f"  SMA 200: {format_currency(ma['sma_200'])}\n"
            if ma.get('ema_12'): text_content += f"  EMA 12: {format_currency(ma['ema_12'])}\n"
            if ma.get('ema_26'): text_content += f"  EMA 26: {format_currency(ma['ema_26'])}\n"
            if ma.get('comment'):
                text_content += f"  Analysis: {ma['comment']}\n"
        
        volume = technical.get('volume_analysis', {})
        if volume:
            text_content += f"\nVolume Analysis:\n"
            text_content += f"  Trend: {volume.get('volume_trend', 'neutral').upper()}\n"
            if volume.get('volume_ratio'): text_content += f"  Ratio: {volume['volume_ratio']}\n"
            if volume.get('on_balance_volume'): text_content += f"  OBV: {volume['on_balance_volume']/1000000:.0f}M\n"
            if volume.get('comment'):
                text_content += f"  Analysis: {volume['comment']}\n"
        
        text_content += "\n"

    # Add sentiment analysis
    sentiment = data.get('sentiment_analysis', {})
    if sentiment:
        text_content += f"""
MARKET SENTIMENT
Overall Sentiment: {sentiment.get('overall_sentiment', 'NEUTRAL').upper()}
Sentiment Score: {int(sentiment.get('sentiment_score', 0) * 100)}%
"""
        if sentiment.get('fear_greed_index'):
            text_content += f"Fear & Greed Index: {sentiment['fear_greed_index']}\n"
        
        analyst_ratings = sentiment.get('analyst_ratings', {})
        if analyst_ratings:
            text_content += f"""
Analyst Ratings:
  Buy: {analyst_ratings.get('buy', 0)}
  Hold: {analyst_ratings.get('hold', 0)}
  Sell: {analyst_ratings.get('sell', 0)}
"""
        
        if sentiment.get('comment'):
            text_content += f"\nSentiment Analysis: {sentiment['comment']}\n"
        text_content += "\n"

    # Add events
    events = data.get('events', {})
    if events:
        upcoming = events.get('upcoming_events', [])
        recent_news = events.get('recent_news', [])
        
        if upcoming:
            text_content += "UPCOMING EVENTS\n"
            for event in upcoming[:3]:
                text_content += f"• {event.get('headline', 'Event')} ({event.get('impact', 'neutral').upper()}) - {event.get('date', 'TBD')}\n"
            text_content += "\n"
        
        if recent_news:
            text_content += "RECENT NEWS\n"
            for news in recent_news[:3]:
                text_content += f"• {news.get('headline', 'News')} ({news.get('impact', 'neutral').upper()}) - {news.get('date', 'TBD')}\n"
            text_content += "\n"

    if risk:
        text_content += f"""
RISK ANALYSIS
Risk Level: {risk.get('risk_level', 'MEDIUM').upper()}
Beta: {risk.get('beta', 0)}
Max Drawdown: {risk.get('max_drawdown', 0)}%

"""

    if storytelling:
        text_content += """
INVESTMENT NARRATIVE
"""
        text_content += "\n\n".join(storytelling) + "\n\n"

    text_content += f"""
IMPORTANT DISCLAIMER
This AI-generated analysis is provided for educational and informational purposes only. 
It is NOT financial advice, NOT an offer to buy or sell securities, and NOT guaranteed 
for accuracy, completeness, or profitability. Market conditions change rapidly, and past 
performance does not guarantee future results. Always conduct your own research and 
consult qualified financial advisors before making investment decisions.

---
Generated by Veloryn - AI-Powered Financial Intelligence
© {datetime.now().year} Veloryn. All rights reserved.
"""

    return {
        'subject': subject,
        'html': html,
        'text': text_content.strip()
    }

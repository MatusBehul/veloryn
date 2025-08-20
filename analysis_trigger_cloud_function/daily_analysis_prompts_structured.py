"""
Daily Financial Analysis Trigger Prompts
========================================

Use these prompts with your financial advisor agent to get structured analysis for daily ticker monitoring.
With Pydantic model schema, the output will be automatically validated and structured.
"""

from data_tool_model import ComprehensiveStockDataModel


DAILY_TICKER_ANALYSIS_PROMPT = """Provide a comprehensive financial analysis for ticker {ticker} for day {day_input}.
You do not calculate anything, I will provide you with all the data you need.
YOU CANNOT FABULATE OR MAKE UP DATA. ALL DATA MUST BE REAL AND CURRENT.

**Analysis Requirements:**
4. **Sentiment Analysis**: Overall sentiment, scores, news/social sentiment, analyst ratings, fear/greed index
5. **Risk Analysis**: Risk level, volatility metrics, beta, Sharpe ratio, max drawdown, VaR, key risks
6. **Events Calendar**: Earnings, dividends, recent news, upcoming events, corporate actions
7. **Investment Insights**: Action, confidence, target price, stop loss, time horizon, detailed reasoning
8. **Investment Narrative**: 3 compelling paragraphs (~1000 words total) explaining the investment opportunity

**Critical Data Requirements:**
- All numerical values must be real current data, not placeholders
- Comments for technical indicators should provide actionable insights

**Analysis Context:**
- Analysis date: {day_input}
- Focus on actionable investment insights
- Balance opportunity identification with risk assessment
- Consider broader market context and sector trends
- Provide clear, evidence-based insights

**Use your specialized skills:**
Comment on:
- $.technical_data.technical_analysis_results.daily
- $.technical_data.technical_analysis_results.hourly
- $.technical_data.technical_analysis_results.weekly
- $.technical_data.technical_analysis_results.monthly
- overall company profile, financial health and global market context
- include analysis of sentiment, risk, and investment insights

**Data you need:**
```python {raw_analysis_data}```

**Output Format:**
```json 
[
   {{
      "language": "string",
      "overall_analysis": ["string"],
      "technical_analysis": ["string"],
      "fundamental_analysis": ["string"],
      "sentiment_analysis": ["string"],
      "risk_analysis": ["string"],
      "investment_insights": ["string"],
      "investment_narrative": ["string"]
   }}
]
```

Ensure the analysis is thorough, current, and provides clear investment guidance."""


def generate_daily_analysis_prompt(raw_analysis_data: ComprehensiveStockDataModel) -> str:
    """Generate a daily analysis prompt for any ticker symbol"""
    return DAILY_TICKER_ANALYSIS_PROMPT.format(ticker=raw_analysis_data.symbol.upper(), day_input=raw_analysis_data.timestamp, raw_analysis_data=raw_analysis_data)

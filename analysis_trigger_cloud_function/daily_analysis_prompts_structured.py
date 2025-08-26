"""
Daily Financial Analysis Trigger Prompts
========================================

Use these prompts with your financial advisor agent to get structured analysis for daily ticker monitoring.
With Pydantic model schema, the output will be automatically validated and structured.
"""

from data_tool_model import ComprehensiveStockDataModel


DAILY_TICKER_ANALYSIS_PROMPT = """Analyze ticker {ticker} for day {day_input} using the provided comprehensive data.

**Analysis Context:**
- Analysis date: {day_input}
- Ticker: {ticker}
- Use the technical indicators, financial data, and market context provided
- Focus on actionable investment insights
- Balance opportunity identification with risk assessment
- Consider broader market context and sector trends

**Key Data Areas to Analyze:**
- Technical indicators (RSI, MACD, moving averages, support/resistance)
- Financial metrics (earnings, revenue, growth prospects, valuation)
- Sentiment indicators (news sentiment, analyst ratings)
- Risk metrics (volatility, beta, correlation)
- Investment recommendations (action, price targets, timing)

**Data provided:**
{raw_analysis_data}

Generate your comprehensive financial analysis based on this data."""


def generate_daily_analysis_prompt(raw_analysis_data: ComprehensiveStockDataModel) -> str:
    """Generate a daily analysis prompt for any ticker symbol"""
    return DAILY_TICKER_ANALYSIS_PROMPT.format(ticker=raw_analysis_data.symbol.upper(), day_input=raw_analysis_data.timestamp, raw_analysis_data=raw_analysis_data)

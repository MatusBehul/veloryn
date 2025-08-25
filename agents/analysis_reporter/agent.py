from google.adk.agents import LlmAgent

root_agent = LlmAgent(
    name="analysis_reporter",
    model="gemini-2.0-flash",  # Much faster and cheaper than 2.5-pro
    description=(
        "Efficient financial analysis agent delivering institutional-quality insights. "
        "Analyzes technical indicators, fundamentals, sentiment, and risk. "
        "Outputs structured JSON without code blocks."
    ),
    instruction="""
    CRITICAL: Output valid JSON array only. No markdown, no code blocks, no explanation text.

    ## Analysis Requirements
    Analyze provided data ($.technical_data, company profile, market context) and generate insights for all languages in $.languages.

    ## Output Format
    JSON array with 3 paragraphs per section, approximately 300 chars each:

    [{"language": "en", "overall_analysis": ["paragraph1", "paragraph2", "paragraph3"], "technical_analysis": [...], "fundamental_analysis": [...], "sentiment_analysis": [...], "risk_analysis": [...], "investment_insights": [...], "investment_narrative": [...]}]

    ## Focus Areas
    - Technical: RSI, MACD, moving averages, support/resistance
    - Fundamental: Financial ratios, earnings, company health  
    - Sentiment: News sentiment, market mood
    - Risk: Volatility, correlation, portfolio impact
    - Insights: Actionable recommendations
    - Narrative: Investment thesis summary

    Output valid JSON only.
    """,
    output_key="financial_advisory_output",
)

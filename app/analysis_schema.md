Firestore schema:
financial_analysis (collection)
    -> <TICKER>-daily (document)
        -> <TICKER>_<YYYY_MM_DD> (collection)
            -> analysis_overview (document)
            -> balance_sheet_data (document)
            -> company_overview (document)
            -> daily_prices (document)
            -> dividend_data (document)
            -> earnings_estimates (document)
            -> hourly_prices (document)
            -> income_statement_data (document)
            -> monthly_prices (document)
            -> splits_data (document)
            -> technical_analysis_results (document)
            -> weekly_prices (document)

analysis_overview
```
{
    "analysis_data": {
        "fundamental_analysis": [string],  // paragrapths of analysis
        "investment_narrative": [string],  // paragrapths of analysis
        "investment_insights": [string],  // paragrapths of analysis
        "overall_analysis": [string],  // paragrapths of analysis
        "risk_analysis": [string],  // paragrapths of analysis
        "sentiment_analysis": [string],  // paragrapths of analysis
        "technical_analysis": [string],  // paragrapths of analysis
    }
}
```

balance_sheet_data -> $.data[i]
```python
class StockBalanceSheetDataModel(BaseModel):
    """Model for stock balance sheet data"""
    fiscalDateEnding: str
    reportedCurrency: str
    totalAssets: str
    totalCurrentAssets: str
    cashAndCashEquivalentsAtCarryingValue: str
    cashAndShortTermInvestments: str
    inventory: str
    currentNetReceivables: str
    totalNonCurrentAssets: str
    propertyPlantEquipment: str
    accumulatedDepreciationAmortizationPPE: str
    intangibleAssets: str
    intangibleAssetsExcludingGoodwill: str
    goodwill: str
    investments: str
    longTermInvestments: str
    shortTermInvestments: str
    otherCurrentAssets: str
    otherNonCurrentAssets: str
    totalLiabilities: str
    totalCurrentLiabilities: str
    currentAccountsPayable: str
    deferredRevenue: str
    currentDebt: str
    shortTermDebt: str
    totalNonCurrentLiabilities: str
    capitalLeaseObligations: str
    longTermDebt: str
    currentLongTermDebt: str
    longTermDebtNoncurrent: str
    shortLongTermDebtTotal: str
    otherCurrentLiabilities: str
    otherNonCurrentLiabilities: str
    totalShareholderEquity: str
    treasuryStock: str
    retainedEarnings: str
    commonStock: str
    commonStockSharesOutstanding: str
```


company_overview -> $.data[i]
```python
class StockOverviewModel(BaseModel):
    """Model for stock overview data"""
    Symbol: str
    AssetType: str
    Name: str
    Description: str
    CIK: str
    Exchange: str
    Currency: str
    Country: str
    Sector: str
    Industry: str
    Address: str
    OfficialSite: str
    FiscalYearEnd: str
    LatestQuarter: str
    MarketCapitalization: float | None = None
    EBITDA: float | None = None
    PERatio: float | None = None
    PEGRatio: float | None = None
    BookValue: float | None = None
    DividendPerShare: float | None = None
    DividendYield: float | None = None
    EPS: float | None = None
    RevenuePerShareTTM: float | None = None
    ProfitMargin: float | None = None
    OperatingMarginTTM: float | None = None
    ReturnOnAssetsTTM: float | None = None
    ReturnOnEquityTTM: float | None = None
    RevenueTTM: float | None = None
    GrossProfitTTM: float | None = None
    DilutedEPSTTM: float | None = None
    QuarterlyEarningsGrowthYOY: float | None = None
    QuarterlyRevenueGrowthYOY: float | None = None
    AnalystTargetPrice: float | None = None
    AnalystRatingStrongBuy: float | None = None
    AnalystRatingBuy: float | None = None
    AnalystRatingHold: float | None = None
    AnalystRatingSell: float | None = None
    AnalystRatingStrongSell: float | None = None
    TrailingPE: float | None = None
    ForwardPE: float | None = None
    PriceToSalesRatioTTM: float | None = None
    PriceToBookRatio: float | None = None
    EVToRevenue: float | None = None
    EVToEBITDA: float | None = None
    Beta: float | None = None
    _52WeekHigh: float | None = None
    _52WeekLow: float | None = None
    _50DayMovingAverage: float | None = None
    _200DayMovingAverage: float | None = None
    _SharesOutstanding: float | None = None
    _SharesFloat: float | None = None
    PercentInsiders: float | None = None
    PercentInstitutions: float | None = None
    DividendDate: str | None = None
    ExDividendDate: str | None = None
```

daily_prices -> $.data[i]
```python
class StockRealtimeDataModel(BaseModel):
    """Model for real-time stock data"""
    date: str
    open: float
    high: float  
    low: float
    close: float
    volume: int
```
dividend_data -> $.data[i]
```python
class StockDividendDataModel(BaseModel):
    """Model for stock dividend data"""
    ex_dividend_date: str | None = None
    declaration_date: str | None = None
    record_date: str | None = None
    payment_date: str | None = None
    open: float | None = None
```

earnings_estimates -> $.data[i]
```python
class StockEarningsEstimateDataModel(BaseModel):
    """Model for stock earnings estimate data"""
    date: str
    horizon: str
    eps_estimate_average: str | None = None
    eps_estimate_high: str | None = None
    eps_estimate_low: str | None = None
    eps_estimate_analyst_count: str | None = None
    eps_estimate_average_7_days_ago: str | None = None
    eps_estimate_average_30_days_ago: str | None = None
    eps_estimate_average_60_days_ago: str | None = None
    eps_estimate_average_90_days_ago: str | None = None
    eps_estimate_revision_up_trailing_7_days: str | None = None
    eps_estimate_revision_down_trailing_7_days: str | None = None
    eps_estimate_revision_up_trailing_30_days: str | None = None
    eps_estimate_revision_down_trailing_30_days: str | None = None
    revenue_estimate_average: str | None = None
    revenue_estimate_high: str | None = None
    revenue_estimate_low: str | None = None
    revenue_estimate_analyst_count: str | None = None
```

hourly_prices -> $.data[i]
```python
class StockRealtimeDataModel(BaseModel):
    """Model for real-time stock data"""
    date: str
    open: float
    high: float  
    low: float
    close: float
    volume: int
```

income_statement_data -> $.data[i]
```python
class StockIncomeStatementDataModel(BaseModel):
    """Model for stock income statement data"""
    fiscalDateEnding: str
    reportedCurrency: str
    grossProfit: str
    totalRevenue: str
    costOfRevenue: str
    costofGoodsAndServicesSold: str
    operatingIncome: str
    sellingGeneralAndAdministrative: str
    researchAndDevelopment: str
    operatingExpenses: str
    investmentIncomeNet: str
    netInterestIncome: str
    interestIncome: str
    interestExpense: str
    nonInterestIncome: str
    otherNonOperatingIncome: str
    depreciation: str
    depreciationAndAmortization: str
    incomeBeforeTax: str
    incomeTaxExpense: str
    interestAndDebtExpense: str
    netIncomeFromContinuingOperations: str
    comprehensiveIncomeNetOfTax: str
    ebit: str
    ebitda: str
    netIncome: str
```

monthly_prices -> $.data[i]
```python
class StockRealtimeDataModel(BaseModel):
    """Model for real-time stock data"""
    date: str
    open: float
    high: float  
    low: float
    close: float
    volume: int
```

splits_data -> $.data[i]
```python
class StockSplitDataModel(BaseModel):
    """Model for stock split data"""
    effective_date: str
    split_factor: float
```

technical_analysis_results -> $.data
```python
class TechnicalIndicatorsModel(BaseModel):
    """Model for technical indicators results"""
    
    class BollingerBands(BaseModel):
        upper: float
        middle: float
        lower: float
    
    class MovingAverages(BaseModel):
        sma_20: float
        sma_50: float
        sma_200: float
        ema_12: float
        ema_26: float
    
    class MACDIndicator(BaseModel):
        macd_line: float
        signal_line: float
        histogram: float
    
    class TrendIndicators(BaseModel):
        volume_trend_percent: float
        market_cap_trend_percent: float


class TimeFrameIndicators(BaseModel):
    """Model for indicators in a specific timeframe"""
    bollinger_bands: TechnicalIndicatorsModel.BollingerBands
    moving_averages: TechnicalIndicatorsModel.MovingAverages
    macd: TechnicalIndicatorsModel.MACDIndicator
    rsi: float
    obv: float
    sar: float
    cci: float
    standard_deviation: float
    momentum: float
    trend_indicators: TechnicalIndicatorsModel.TrendIndicators

class TechnicalAnalysisResults(BaseModel):
    """Model for complete technical analysis results"""
    # Current market data
    current_price: float
    current_market_cap: Optional[float]
    last_day_volume: int
    week_52_high: Optional[float]
    week_52_low: Optional[float]
    
    # Technical indicators by timeframe
    hourly: Optional[TimeFrameIndicators]
    daily: Optional[TimeFrameIndicators]
    weekly: Optional[TimeFrameIndicators]
    monthly: Optional[TimeFrameIndicators]
```

weekly_prices -> $.data[i]
```python
class StockRealtimeDataModel(BaseModel):
    """Model for real-time stock data"""
    date: str
    open: float
    high: float  
    low: float
    close: float
    volume: int
```

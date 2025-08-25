
from pydantic import BaseModel
from typing import List, Optional


class StockDividendDataModel(BaseModel):
    """Model for stock dividend data"""
    ex_dividend_date: str | None = None
    declaration_date: str | None = None
    record_date: str | None = None
    payment_date: str | None = None
    amount: float | str | None = None


class StockRealtimeDataModel(BaseModel):
    """Model for real-time stock data"""
    date: str
    open: float
    high: float  
    low: float
    close: float
    volume: int


class NewsArticleModel(BaseModel):
    """Model for individual news article with sentiment data"""

    class TopicModel(BaseModel):
        """Model for news article topics"""
        topic: str
        relevance_score: str
    
    class TickerSentimentModel(BaseModel):
        """Model for individual ticker sentiment within news"""
        ticker: str
        relevance_score: str
        ticker_sentiment_score: str
        ticker_sentiment_label: str

    title: str
    url: str
    time_published: str
    authors: List[str]
    summary: str
    banner_image: str | None = None
    source: str
    category_within_source: str
    source_domain: str
    topics: List[TopicModel]
    overall_sentiment_score: float
    overall_sentiment_label: str
    ticker_sentiment: List[TickerSentimentModel]


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
    MarketCapitalization: float | str | None = None
    EBITDA: float | str | None = None
    PERatio: float | str | None = None
    PEGRatio: float | str | None = None
    BookValue: float | str | None = None
    DividendPerShare: float | str | None = None
    DividendYield: float | str | None = None
    EPS: float | str | None = None
    RevenuePerShareTTM: float | str | None = None
    ProfitMargin: float | str | None = None
    OperatingMarginTTM: float | str | None = None
    ReturnOnAssetsTTM: float | str | None = None
    ReturnOnEquityTTM: float | str | None = None
    RevenueTTM: float | str | None = None
    GrossProfitTTM: float | str | None = None
    DilutedEPSTTM: float | str | None = None
    QuarterlyEarningsGrowthYOY: float | str | None = None
    QuarterlyRevenueGrowthYOY: float | str | None = None
    AnalystTargetPrice: float | str | None = None
    AnalystRatingStrongBuy: float | str | None = None
    AnalystRatingBuy: float | str | None = None
    AnalystRatingHold: float | str | None = None
    AnalystRatingSell: float | str | None = None
    AnalystRatingStrongSell: float | str | None = None
    TrailingPE: float | str | None = None
    ForwardPE: float | str | None = None
    PriceToSalesRatioTTM: float | str | None = None
    PriceToBookRatio: float | str | None = None
    EVToRevenue: float | str | None = None
    EVToEBITDA: float | str | None = None
    Beta: float | str | None = None
    _52WeekHigh: float | str | None = None
    _52WeekLow: float | str | None = None
    _50DayMovingAverage: float | str | None = None
    _200DayMovingAverage: float | str | None = None
    _SharesOutstanding: float | str | None = None
    _SharesFloat: float | str | None = None
    PercentInsiders: float | str | None = None
    PercentInstitutions: float | str | None = None
    DividendDate: str | None = None
    ExDividendDate: str | None = None


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


class StockSplitDataModel(BaseModel):
    """Model for stock split data"""
    effective_date: str
    split_factor: float


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


class GlobalUSCPIDataModel(BaseModel):
    """Model for global US Consumer Price Index (CPI) data"""
    date: str
    value: float

class GlobalUSFederalFundsRateDataModel(BaseModel):
    """Model for global US Federal Funds Rate data"""
    date: str
    value: float
    
class GlobalUSInflationDataModel(BaseModel):
    """Model for global US inflation data"""
    date: str
    value: float

class GlobalUSRetailSalesDataModel(BaseModel):
    """Model for global US retail sales data"""
    date: str
    value: float

class GlobalUSUnemploymentDataModel(BaseModel):
    """Model for global US unemployment data"""
    date: str
    value: float


class GlobalUSDataModel(BaseModel):
    """Model for all global US economic data"""
    inflation: List[GlobalUSInflationDataModel] = []
    cpi: List[GlobalUSCPIDataModel] = []
    federal_funds_rate: List[GlobalUSFederalFundsRateDataModel] = []
    retail_sales: List[GlobalUSRetailSalesDataModel] = []
    unemployment: List[GlobalUSUnemploymentDataModel] = []


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


class ComprehensiveStockDataModel(BaseModel):
    """Model for comprehensive stock data"""

    class CompanyDataModel(BaseModel):
        """Model for company data"""
        hourly_prices: List[StockRealtimeDataModel] = []
        daily_prices: List[StockRealtimeDataModel] = []
        weekly_prices: List[StockRealtimeDataModel] = []
        monthly_prices: List[StockRealtimeDataModel] = []
        overview: StockOverviewModel | None = None
        dividend_data: List[StockDividendDataModel] = []
        splits_data: List[StockSplitDataModel] = []
        balance_sheet_data: List[StockBalanceSheetDataModel] = []
        income_statement_data: List[StockIncomeStatementDataModel] = []
        earnings_estimates: List[StockEarningsEstimateDataModel] = []
        news_sentiment: List[NewsArticleModel] = []

    languages: List[str] = ["en"]
    symbol: str
    timestamp: str
    status: str
    company_data: CompanyDataModel
    global_economic_data: GlobalUSDataModel
    technical_analysis_results: TechnicalAnalysisResults | None = None

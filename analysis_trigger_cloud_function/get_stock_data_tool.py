"""
Real-time Financial Data Collection Tool
Integrates with multiple financial data APIs for comprehensive market data
"""

import os
import aiohttp
import requests
import pandas as pd
import numpy as np
import json
import ssl
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from google.cloud import firestore
from data_tool_model import *

ALPHAVANTAGE_API_KEY = os.environ.get('ALPHAVANTAGE_API_KEY')
PROJECT_ID = os.environ.get('GCP_PROJECT')


class FinancialDataTool:
    """
    Comprehensive financial data collection tool that provides real-time and historical data
    from multiple sources with support for different time intervals.
    """
    
    def __init__(self):        
        # Initialize Firestore client
        self.db = firestore.Client(project=PROJECT_ID)
        
        # Create SSL context that doesn't verify certificates (for demo/testing only)
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        self.today = datetime.now().strftime('%Y-%m-%d')

        if not ALPHAVANTAGE_API_KEY:
            print("ERROR: MISSING ALPHAVANTAGE_API_KEY")
        
        # API endpoints and configurations
        self.apis = {
            'alpha_vantage': {
                'base_url': 'https://www.alphavantage.co/query',
                'api_key': ALPHAVANTAGE_API_KEY,
                # 'rate_limit': 5  # requests per minute for free tier
            },
        }
    
    def _create_session(self):
        """Create an aiohttp session with proper SSL configuration"""
        connector = aiohttp.TCPConnector(ssl=self.ssl_context)
        return aiohttp.ClientSession(connector=connector)

    def get_stock_daily_quote(self, symbol: str, function: str) -> Dict:
        """
        Get real-time stock quote data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
            function: Type of function to retrieve ('TIME_SERIES_INTRADAY', 'TIME_SERIES_DAILY', 'TIME_SERIES_WEEKLY', 'TIME_SERIES_MONTHLY', etc.)
        Returns:
            Dict containing the retrieved data or error information
        """
        response = None

        data = None
        try:
                # Try Alpha Vantage first
                url = f"{self.apis['alpha_vantage']['base_url']}"
                params = {
                    'function': function,
                    'symbol': symbol,
                    'interval': '60min',
                    'apikey': self.apis['alpha_vantage']['api_key']
                }
                retrieved_data = []

                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    found_markdown = False
                    for frame in [
                        'Time Series (60min)', 'Time Series (Daily)', 'Weekly Time Series', 'Monthly Time Series'
                    ]:
                        if frame in data:
                            found_markdown = True
                            quote = data[frame]
                            # Convert to list and sort by date (Alpha Vantage returns newest first)
                            date_entries = []
                            for date, values in quote.items():
                                entry = StockRealtimeDataModel(
                                    date=date,
                                    open=float(values['1. open']),
                                    high=float(values['2. high']),
                                    low=float(values['3. low']),
                                    close=float(values['4. close']),
                                    volume=int(values['5. volume'])
                                )
                                date_entries.append((date, entry))
                            
                            # Sort by date in descending order (newest first) for API consistency
                            # but keep track that [0] = most recent for current price extraction
                            date_entries.sort(key=lambda x: x[0], reverse=True)
                            retrieved_data = [entry for date, entry in date_entries]
                    
                    if not found_markdown:
                        print(f"No valid data found for {symbol} with function {params['function']}", data)
                        return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
                else:
                    print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

                return retrieved_data
                
                
        except Exception as e:
            print(f"Error fetching stock data for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}

    def get_stock_news_sentiment(self, symbol: str) -> Dict:
        """
        Get stock news sentiment data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
            Dict containing structured news sentiment data or error information
        """
        response = None
        data = None
        try:
                # Try Alpha Vantage first
                url = f"{self.apis['alpha_vantage']['base_url']}"
                params = {
                    'function': 'NEWS_SENTIMENT',
                    'symbol': symbol,
                    'apikey': self.apis['alpha_vantage']['api_key']
                }

                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                        
                    if "feed" in data:
                        # Create the structured model from the raw data
                        news_data = [NewsArticleModel(**article) for article in data["feed"]]
                        
                        return news_data
                    
                    else:
                        print(f"No valid data found for {symbol} with function {params['function']}", data)
                        return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
                else:
                    print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")
                    return []
                
        except Exception as e:
            print(f"Error fetching news sentiment for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol or 'general_market'}

    def get_stock_overview(self, symbol: str) -> Dict:
        """
        Get stock overview data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'OVERVIEW',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = {}

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "Symbol" in data:
                    retrieved_data = StockOverviewModel(**data)
                    return retrieved_data
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")
                return {}

        except Exception as e:
            print(f"Error fetching stock overview for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {}

    def get_stock_dividend_data(self, symbol: str) -> Dict:
        """
        Get historical stock dividend data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'DIVIDENDS',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [StockDividendDataModel(**dividend) for dividend in data["data"]]
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

            return retrieved_data

        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}

    def get_stock_splits_data(self, symbol: str) -> Dict:
        """
        Get historical stock splits data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'SPLITS',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [StockSplitDataModel(**splits) for splits in data["data"]]
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

            return retrieved_data

        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}

    def get_stock_balance_sheet_data(self, symbol: str) -> Dict:
        """
        Get historical stock balance sheet data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'BALANCE_SHEET',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "annualReports" in data:
                    retrieved_data = [StockBalanceSheetDataModel(**sheet) for sheet in data["annualReports"]]
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

            return retrieved_data

        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}


    def get_stock_income_statement_data(self, symbol: str) -> Dict:
        """
        Get historical stock income statement data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'INCOME_STATEMENT',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "annualReports" in data:
                    retrieved_data = [StockIncomeStatementDataModel(**sheet) for sheet in data["annualReports"]]
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

            return retrieved_data

        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}

    def get_stock_estimates_data(self, symbol: str) -> Dict:
        """
        Get historical stock balance sheet data
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
        """
        response = None

        data = None
        try:
            # Try Alpha Vantage first
            url = f"{self.apis['alpha_vantage']['base_url']}"
            params = {
                'function': 'EARNINGS_ESTIMATES',
                'symbol': symbol,
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if "estimates" in data:
                    retrieved_data = [StockEarningsEstimateDataModel(**sheet) for sheet in data["estimates"]]
                else:
                    print(f"No valid data found for {symbol} with function {params['function']}", data)
                    return {'error': 'No valid data found', 'symbol': symbol, 'function': params['function']}
            else:
                print(f"Error fetching data for {symbol}: {response.status_code} - {response.reason}")

            return retrieved_data

        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {e}")
            if response:
                print(f"Response status: {response.status_code}, reason: {response.reason}")
            if data:
                print(f"Response data: {data}")
            return {'error': str(e), 'symbol': symbol}
    
    def get_global_us_inflation_data(self) -> List[GlobalUSInflationDataModel]:
        """
        Get global US inflation data from Firestore
        Returns:
            List of GlobalUSInflationDataModel containing inflation data or error information
        """
        try:
            doc_ref = self.db.collection('global_us_data').document('inflation').collection("history").document(self.today)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                if 'data' in data:
                    retrieved_data = [GlobalUSInflationDataModel(**item) for item in data['data']]
                    return retrieved_data
                else:
                    return {'error': 'No data field in document', 'function': 'INFLATION'}
            else:
                return {'error': 'Document not found', 'function': 'INFLATION'}

        except Exception as e:
            print(f"Error fetching inflation data from Firestore: {e}")
            return {'error': str(e), 'function': 'INFLATION'}

    def get_global_us_cpi_data(self) -> List[GlobalUSCPIDataModel]:
        """
        Get global US CPI data from Firestore
        Returns:
            List of GlobalUSCPIDataModel containing CPI data or error information
        """
        try:
            doc_ref = self.db.collection('global_us_data').document('cpi').collection("history").document(self.today)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                if 'data' in data:
                    retrieved_data = [GlobalUSCPIDataModel(**item) for item in data['data']]
                    return retrieved_data
                else:
                    return {'error': 'No data field in document', 'function': 'CPI'}
            else:
                return {'error': 'Document not found', 'function': 'CPI'}

        except Exception as e:
            print(f"Error fetching CPI data from Firestore: {e}")
            return {'error': str(e), 'function': 'CPI'}

    def get_global_us_federal_funds_rate_data(self) -> List[GlobalUSFederalFundsRateDataModel]:
        """
        Get global US Federal Funds Rate data from Firestore
        Returns:
            List of GlobalUSFederalFundsRateDataModel containing Federal Funds Rate data or error information
        """
        try:
            doc_ref = self.db.collection('global_us_data').document('federal_funds_rate').collection("history").document(self.today)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                if 'data' in data:
                    retrieved_data = [GlobalUSFederalFundsRateDataModel(**item) for item in data['data']]
                    return retrieved_data
                else:
                    return {'error': 'No data field in document', 'function': 'FEDERAL_FUNDS_RATE'}
            else:
                return {'error': 'Document not found', 'function': 'FEDERAL_FUNDS_RATE'}
            
        except Exception as e:
            print(f"Error fetching Federal Funds Rate data from Firestore: {e}")
            return {'error': str(e), 'function': 'FEDERAL_FUNDS_RATE'}

    def get_global_us_retail_sales_data(self) -> List[GlobalUSRetailSalesDataModel]:
        """
        Get global US retail sales data from Firestore
        Returns:
            List of GlobalUSRetailSalesDataModel containing retail sales data or error information
        """
        try:
            doc_ref = self.db.collection('global_us_data').document('retail_sales').collection("history").document(self.today)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                if 'data' in data:
                    retrieved_data = [GlobalUSRetailSalesDataModel(**item) for item in data['data']]
                    return retrieved_data
                else:
                    return {'error': 'No data field in document', 'function': 'RETAIL_SALES'}
            else:
                return {'error': 'Document not found', 'function': 'RETAIL_SALES'}
            
        except Exception as e:
            print(f"Error fetching retail sales data from Firestore: {e}")
            return {'error': str(e), 'function': 'RETAIL_SALES'}

    def get_global_us_unemployment_data(self) -> List[GlobalUSUnemploymentDataModel]:
        """
        Get global US unemployment data from Firestore
        Returns:
            List of GlobalUSUnemploymentDataModel containing unemployment data or error information
        """
        try:
            doc_ref = self.db.collection('global_us_data').document('unemployment').collection("history").document(self.today)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                if 'data' in data:
                    retrieved_data = [GlobalUSUnemploymentDataModel(**item) for item in data['data']]
                    return retrieved_data
                else:
                    return {'error': 'No data field in document', 'function': 'UNEMPLOYMENT'}
            else:
                return {'error': 'Document not found', 'function': 'UNEMPLOYMENT'}

        except Exception as e:
            print(f"Error fetching unemployment data from Firestore: {e}")
            return {'error': str(e), 'function': 'UNEMPLOYMENT'}

    def get_all_global_us_data(self) -> GlobalUSDataModel:
        """
        Get all global US economic data from Firestore
        Returns:
            Dict containing all economic indicators
        """
        try:
            all_data = GlobalUSDataModel(
                inflation=self.get_global_us_inflation_data(),
                cpi=self.get_global_us_cpi_data(),
                federal_funds_rate=self.get_global_us_federal_funds_rate_data(),
                retail_sales=self.get_global_us_retail_sales_data(),
                unemployment=self.get_global_us_unemployment_data()
            )
            return all_data

        except Exception as e:
            print(f"Error fetching all global US data: {e}")
            return {'error': str(e), 'status': 'failed'}

    def _get_indicator_unit(self, indicator: str) -> str:
        """Get the unit for each economic indicator"""
        units = {
            'inflation': 'percentage',
            'cpi': 'index',
            'federal_funds_rate': 'percentage',
            'retail_sales': 'millions USD',
            'unemployment': 'percentage'
        }
        return units.get(indicator, 'unknown')

    async def analyze_symbol(self, symbol: str) -> ComprehensiveStockDataModel:
        """
        Execute all stock data collection functions simultaneously for a given symbol
        Args:
            symbol: Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
        Returns:
            Dict containing all stock data in a structured format
        """
        try:
            stock_hourly_quote = self.get_stock_daily_quote(symbol, 'TIME_SERIES_INTRADAY')
            stock_daily_quote = self.get_stock_daily_quote(symbol, 'TIME_SERIES_DAILY')
            stock_weekly_quote = self.get_stock_daily_quote(symbol, 'TIME_SERIES_WEEKLY')
            stock_monthly_quote = self.get_stock_daily_quote(symbol, 'TIME_SERIES_MONTHLY')
            stock_news_sentiment = self.get_stock_news_sentiment(symbol)
            stock_overview = self.get_stock_overview(symbol)
            stock_dividend_data = self.get_stock_dividend_data(symbol)
            stock_splits_data = self.get_stock_splits_data(symbol)
            stock_balance_sheet_data = self.get_stock_balance_sheet_data(symbol)
            stock_income_statement_data = self.get_stock_income_statement_data(symbol)
            stock_estimates_data = self.get_stock_estimates_data(symbol)
            
            # Execute all tasks simultaneously
            # results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Structure the response
            comprehensive_data = ComprehensiveStockDataModel(
                languages=[os.environ.get('LANGUAGES', 'en').split("#")],
                symbol=symbol,
                timestamp=datetime.now().isoformat(),
                status='success',
                company_data=ComprehensiveStockDataModel.CompanyDataModel(
                    hourly_prices=stock_hourly_quote if isinstance(stock_hourly_quote, list) else [],
                    daily_prices=stock_daily_quote if isinstance(stock_daily_quote, list) else [],
                    weekly_prices=stock_weekly_quote if isinstance(stock_weekly_quote, list) else [],
                    monthly_prices=stock_monthly_quote if isinstance(stock_monthly_quote, list) else [],
                    news_sentiment=stock_news_sentiment if isinstance(stock_news_sentiment, list) else [],
                    overview=stock_overview if hasattr(stock_overview, 'Symbol') else None,
                    dividend_data=stock_dividend_data if isinstance(stock_dividend_data, list) else [],
                    splits_data=stock_splits_data if isinstance(stock_splits_data, list) else [],
                    balance_sheet_data=stock_balance_sheet_data if isinstance(stock_balance_sheet_data, list) else [],
                    income_statement_data=stock_income_statement_data if isinstance(stock_income_statement_data, list) else [],
                    earnings_estimates=stock_estimates_data if isinstance(stock_estimates_data, list) else []
                ),
                global_economic_data=self.get_all_global_us_data(),
                technical_analysis_results=None
            )

            # Safely extract current price and volume data
            current_price = 0.0
            last_day_volume = 0
            current_market_cap = None
            week_52_high = None
            week_52_low = None
            
            if comprehensive_data.company_data.daily_prices and len(comprehensive_data.company_data.daily_prices) > 0:
                current_price = float(comprehensive_data.company_data.daily_prices[0].close)
                last_day_volume = int(comprehensive_data.company_data.daily_prices[0].volume)
            
            if comprehensive_data.company_data.overview and hasattr(comprehensive_data.company_data.overview, 'MarketCapitalization'):
                current_market_cap = float(comprehensive_data.company_data.overview.MarketCapitalization) if comprehensive_data.company_data.overview.MarketCapitalization else None
                week_52_high = float(comprehensive_data.company_data.overview._52WeekHigh) if comprehensive_data.company_data.overview._52WeekHigh else None
                week_52_low = float(comprehensive_data.company_data.overview._52WeekLow) if comprehensive_data.company_data.overview._52WeekLow else None

            # Process each timeframe
            hourly_indicators = None
            if comprehensive_data.company_data.hourly_prices:
                hourly_indicators = self.process_timeframe_data(comprehensive_data.company_data.hourly_prices)
            
            daily_indicators = None
            if comprehensive_data.company_data.daily_prices:
                daily_indicators = self.process_timeframe_data(comprehensive_data.company_data.daily_prices)
            
            weekly_indicators = None
            if comprehensive_data.company_data.weekly_prices:
                weekly_indicators = self.process_timeframe_data(comprehensive_data.company_data.weekly_prices)
            
            monthly_indicators = None
            if comprehensive_data.company_data.monthly_prices:
                monthly_indicators = self.process_timeframe_data(comprehensive_data.company_data.monthly_prices)

            comprehensive_data.technical_analysis_results = TechnicalAnalysisResults(
                current_price=current_price,
                current_market_cap=current_market_cap,
                last_day_volume=last_day_volume,
                week_52_high=week_52_high,
                week_52_low=week_52_low,
                hourly=hourly_indicators,
                daily=daily_indicators,
                weekly=weekly_indicators,
                monthly=monthly_indicators
            )

            return comprehensive_data
            
        except Exception as e:
            print(f"Error in comprehensive stock data collection for {symbol}: {e}")
            return {
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'status': 'error',
                'error': str(e)
            }
    
    def process_timeframe_data(self, price_data: List[StockRealtimeDataModel], volumes: List = None) -> TimeFrameIndicators:
        """Process price data for a specific timeframe and calculate all indicators"""
        if not price_data or len(price_data) < 2:
            # Return default values if insufficient data
            return TimeFrameIndicators(
                bollinger_bands=TechnicalIndicatorsModel.BollingerBands(upper=0.0, middle=0.0, lower=0.0),
                moving_averages=TechnicalIndicatorsModel.MovingAverages(
                    sma_20=0.0, sma_50=0.0, sma_200=0.0, ema_12=0.0, ema_26=0.0
                ),
                macd=TechnicalIndicatorsModel.MACDIndicator(macd_line=0.0, signal_line=0.0, histogram=0.0),
                rsi=50.0,
                obv=0.0,
                sar=0.0,
                cci=0.0,
                standard_deviation=0.0,
                momentum=0.0,
                trend_indicators=TechnicalIndicatorsModel.TrendIndicators(
                    volume_trend_percent=0.0, market_cap_trend_percent=0.0
                )
            )
        
        # CRITICAL FIX: Sort data chronologically (oldest first) for technical analysis
        # Alpha Vantage returns newest first, but technical indicators need oldest first
        sorted_data = sorted(price_data, key=lambda x: x.date)
        
        # Extract price arrays in chronological order
        closes = [float(item.close) for item in sorted_data]
        highs = [float(item.high) for item in sorted_data]
        lows = [float(item.low) for item in sorted_data]
        volumes_list = [int(item.volume) for item in sorted_data] if volumes is None else volumes
        
        # Calculate all indicators
        bollinger = self.calculate_bollinger_bands(closes)
        moving_avg = self.calculate_moving_averages(closes)
        macd = self.calculate_macd(closes)
        rsi = self.calculate_rsi(closes)
        obv = self.calculate_obv(closes, volumes_list)
        sar = self.calculate_sar(highs, lows)
        cci = self.calculate_cci(highs, lows, closes)
        std_dev = self.calculate_standard_deviation(closes)
        momentum = self.calculate_momentum(closes)
        
        # Calculate trend indicators (using current vs previous data point)
        # Use the original unsorted data where [0] = most recent, [1] = previous
        current_volume = int(price_data[0].volume) if len(price_data) > 0 else 0
        previous_volume = int(price_data[1].volume) if len(price_data) > 1 else 0
        
        current_data = {'volume': current_volume}
        previous_data = {'volume': previous_volume}
        trend_indicators = self.calculate_trend_indicators(current_data, previous_data)
        
        return TimeFrameIndicators(
            bollinger_bands=TechnicalIndicatorsModel.BollingerBands(**bollinger),
            moving_averages=TechnicalIndicatorsModel.MovingAverages(**moving_avg),
            macd=TechnicalIndicatorsModel.MACDIndicator(**macd),
            rsi=rsi,
            obv=obv,
            sar=sar,
            cci=cci,
            standard_deviation=std_dev,
            momentum=momentum,
            trend_indicators=TechnicalIndicatorsModel.TrendIndicators(**trend_indicators)
        )
    
    def calculate_bollinger_bands(self, prices: List[float], period: int = 20, std_dev: int = 2) -> Dict[str, float]:
        """Calculate Bollinger Bands"""
        if len(prices) < period:
            return {"upper": 0.0, "middle": 0.0, "lower": 0.0}
        
        prices_series = pd.Series(prices)
        sma = prices_series.rolling(window=period).mean().iloc[-1]
        std = prices_series.rolling(window=period).std().iloc[-1]
        
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)
        
        return {
            "upper": float(upper),
            "middle": float(sma),
            "lower": float(lower)
        }
    
    def calculate_moving_averages(self, prices: List[float]) -> Dict[str, float]:
        """Calculate various moving averages"""
        prices_series = pd.Series(prices)
        
        sma_20 = prices_series.rolling(window=20).mean().iloc[-1] if len(prices) >= 20 else 0.0
        sma_50 = prices_series.rolling(window=50).mean().iloc[-1] if len(prices) >= 50 else 0.0
        sma_200 = prices_series.rolling(window=200).mean().iloc[-1] if len(prices) >= 200 else 0.0
        
        # EMA calculation
        ema_12 = prices_series.ewm(span=12).mean().iloc[-1] if len(prices) >= 12 else 0.0
        ema_26 = prices_series.ewm(span=26).mean().iloc[-1] if len(prices) >= 26 else 0.0
        
        return {
            "sma_20": float(sma_20),
            "sma_50": float(sma_50),
            "sma_200": float(sma_200),
            "ema_12": float(ema_12),
            "ema_26": float(ema_26)
        }
    
    def calculate_macd(self, prices: List[float]) -> Dict[str, float]:
        """Calculate MACD indicator"""
        if len(prices) < 26:
            return {"macd_line": 0.0, "signal_line": 0.0, "histogram": 0.0}
        
        prices_series = pd.Series(prices)
        ema_12 = prices_series.ewm(span=12).mean()
        ema_26 = prices_series.ewm(span=26).mean()
        
        macd_line = ema_12 - ema_26
        signal_line = macd_line.ewm(span=9).mean()
        histogram = macd_line - signal_line
        
        return {
            "macd_line": float(macd_line.iloc[-1]),
            "signal_line": float(signal_line.iloc[-1]),
            "histogram": float(histogram.iloc[-1])
        }
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate Relative Strength Index"""
        if len(prices) < period + 1:
            return 50.0
        
        # prices array is already sorted chronologically (oldest to newest)
        prices_series = pd.Series(prices)
        delta = prices_series.diff()  # This calculates day-to-day changes correctly
        
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        # Return the most recent RSI value
        return float(rsi.iloc[-1])
    
    def calculate_obv(self, prices: List[float], volumes: List[int]) -> float:
        """Calculate On-Balance Volume"""
        if len(prices) != len(volumes) or len(prices) < 2:
            return 0.0
        
        # OBV calculation requires chronological order (oldest to newest)
        # prices and volumes arrays are already sorted chronologically in process_timeframe_data
        obv = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i-1]:
                obv += volumes[i]
            elif prices[i] < prices[i-1]:
                obv -= volumes[i]
            # If prices[i] == prices[i-1], no change to OBV
        
        return float(obv)
    
    def calculate_sar(self, highs: List[float], lows: List[float], acceleration: float = 0.02, maximum: float = 0.2) -> float:
        """Calculate Parabolic SAR"""
        if len(highs) < 2 or len(lows) < 2:
            return 0.0
        
        # Simplified SAR calculation (last value)
        high_series = pd.Series(highs)
        low_series = pd.Series(lows)
        
        # Basic implementation - return middle of recent range
        recent_high = high_series.tail(10).max()
        recent_low = low_series.tail(10).min()
        
        return float((recent_high + recent_low) / 2)
    
    def calculate_cci(self, highs: List[float], lows: List[float], closes: List[float], period: int = 20) -> float:
        """Calculate Commodity Channel Index"""
        if len(highs) < period or len(lows) < period or len(closes) < period:
            return 0.0
        
        high_series = pd.Series(highs)
        low_series = pd.Series(lows)
        close_series = pd.Series(closes)
        
        typical_price = (high_series + low_series + close_series) / 3
        sma_tp = typical_price.rolling(window=period).mean()
        mad = typical_price.rolling(window=period).apply(lambda x: np.mean(np.abs(x - x.mean())))
        
        cci = (typical_price - sma_tp) / (0.015 * mad)
        
        return float(cci.iloc[-1])
    
    def calculate_standard_deviation(self, prices: List[float], period: int = 20) -> float:
        """Calculate Standard Deviation"""
        if len(prices) < period:
            return 0.0
        
        prices_series = pd.Series(prices)
        std_dev = prices_series.rolling(window=period).std().iloc[-1]
        
        return float(std_dev)
    
    def calculate_momentum(self, prices: List[float], period: int = 10) -> float:
        """Calculate Momentum indicator"""
        if len(prices) < period + 1:
            return 0.0
        
        # Current price is the most recent (last in chronologically sorted array)
        current_price = prices[-1]
        # Past price is 'period' days ago
        past_price = prices[-(period+1)]
        
        momentum = current_price - past_price
        
        return float(momentum)
    
    def calculate_trend_indicators(self, current_data: Dict, previous_data: Dict) -> Dict[str, float]:
        """Calculate trend indicators (volume and market cap changes)"""
        volume_trend = 0.0
        market_cap_trend = 0.0
        
        if previous_data:
            # Volume trend
            current_volume = current_data.get('volume', 0)
            previous_volume = previous_data.get('volume', 0)
            if previous_volume > 0:
                volume_trend = ((current_volume - previous_volume) / previous_volume) * 100
            
            # Market cap trend (if available in overview data)
            current_market_cap = current_data.get('market_cap', 0)
            previous_market_cap = previous_data.get('market_cap', 0)
            if previous_market_cap > 0:
                market_cap_trend = ((current_market_cap - previous_market_cap) / previous_market_cap) * 100
        
        return {
            "volume_trend_percent": float(volume_trend),
            "market_cap_trend_percent": float(market_cap_trend)
        }

# Create the financial data tool instance
get_stock_data_tool = FinancialDataTool()

# Export tools for easy import
__all__ = [
    'get_stock_data_tool',
]

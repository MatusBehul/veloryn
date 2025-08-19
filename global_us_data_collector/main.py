"""
Hourly Analysis Checker Cloud Function
Checks for new financial analyses and triggers email notifications 
to users who have marked the analyzed tickers as favorites.

Designed to handle:
- 100-1000 tickers analyzed per day
- 10,000-100,000 users with ~5 favorite tickers each
- Efficient bulk email processing via Pub/Sub
"""

import os
import datetime
import logging
import requests
from pydantic import BaseModel
from google.cloud import firestore
import functions_framework

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
PROJECT_ID = os.environ.get('GCP_PROJECT', 'lab-quoriant-dev')
EMAIL_TOPIC = os.environ.get('EMAIL_PUBSUB_TOPIC')
ALPHAVANTAGE_API_KEY = os.environ.get('ALPHAVANTAGE_API_KEY')

# Initialize clients
db = firestore.Client(project=PROJECT_ID)

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


class FinancialDataTool:
    """
    Comprehensive financial data collection tool that provides real-time and historical data
    from multiple sources with support for different time intervals.
    """
    
    def __init__(self):        
        # API endpoints and configurations
        self.apis = {
            'alpha_vantage': {
                'base_url': 'https://www.alphavantage.co/query',
                'api_key': ALPHAVANTAGE_API_KEY,
                # 'rate_limit': 5  # requests per minute for free tier
            },
        }
    
    def get_global_us_inflation_data(self):
        """
        Get global US inflation data
        Args:
        Returns:
        """
        try:
            
            params = {
                'function': 'INFLATION',
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(self.apis["alpha_vantage"]["base_url"], params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [GlobalUSInflationDataModel(**sheet) for sheet in data["data"]]
                else:
                    print("Error fetching inflation data: No data found in response", data)
            else:
                print(f"Error fetching inflation data: {response.status_code} - {response.text}")
                return {'error': 'Failed to fetch inflation data', 'function': 'INFLATION'}

            return retrieved_data

        except Exception as e:
            print(f"Error fetching quote for function INFLATION: {e}")
            return {'error': str(e), 'function': 'INFLATION'}

    def get_global_us_cpi_data(self):
        """
        Get global US CPI data
        Args:
        Returns:
        """
        try:
            
            params = {
                'function': 'CPI',
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(self.apis["alpha_vantage"]["base_url"], params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [GlobalUSCPIDataModel(**sheet) for sheet in data["data"]]
                else:
                    print("Error fetching cpi data: No data found in response", data)
            else:
                print(f"Error fetching cpi data: {response.status_code} - {response.text}")
                return {'error': 'Failed to fetch cpi data', 'function': 'CPI'}

            return retrieved_data

        except Exception as e:
            print(f"Error fetching quote for function CPI: {e}")
            return {'error': str(e), 'function': 'CPI'}

    def get_global_us_federal_funds_rate_data(self):
        """
        Get global US Federal Funds Rate data
        Args:
        Returns:
        """
        try:
            
            params = {
                'function': 'FEDERAL_FUNDS_RATE',
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(self.apis["alpha_vantage"]["base_url"], params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [GlobalUSFederalFundsRateDataModel(**sheet) for sheet in data["data"]]
                else:
                    print("Error fetching federal funds rate data: No data found in response", data)
            else:
                print(f"Error fetching federal funds rate data: {response.status_code} - {response.text}")
                return {'error': 'Failed to fetch federal funds rate data', 'function': 'FEDERAL_FUNDS_RATE'}

            return retrieved_data

        except Exception as e:
            print(f"Error fetching quote for function FEDERAL_FUNDS_RATE: {e}")
            return {'error': str(e), 'function': 'FEDERAL_FUNDS_RATE'}

    def get_global_us_retail_sales_data(self):
        """
        Get global US retail sales data
        Args:
        Returns:
        """
        try:
            
            params = {
                'function': 'RETAIL_SALES',
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(self.apis["alpha_vantage"]["base_url"], params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [GlobalUSRetailSalesDataModel(**sheet) for sheet in data["data"]]
                else:
                    print("Error fetching retail sales data: No data found in response", data)
            else:
                print(f"Error fetching retail sales data: {response.status_code} - {response.text}")
                return {'error': 'Failed to fetch retail sales data', 'function': 'RETAIL_SALES'}

            return retrieved_data

        except Exception as e:
            print(f"Error fetching quote for function RETAIL_SALES: {e}")
            return {'error': str(e), 'function': 'RETAIL_SALES'}

    def get_global_us_unemployment_data(self):
        """
        Get global US unemployment data
        Args:
        Returns:
        """
        try:
            
            params = {
                'function': 'UNEMPLOYMENT',
                'apikey': self.apis['alpha_vantage']['api_key']
            }
            retrieved_data = []

            response = requests.get(self.apis["alpha_vantage"]["base_url"], params=params)
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    retrieved_data = [GlobalUSUnemploymentDataModel(**sheet) for sheet in data["data"]]
                else:
                    print("Error fetching unemployment data: No data found in response", data)
            else:
                print(f"Error fetching unemployment data: {response.status_code} - {response.text}")
                return {'error': 'Failed to fetch unemployment data', 'function': 'UNEMPLOYMENT'}

            return retrieved_data

        except Exception as e:
            print(f"Error fetching quote for function UNEMPLOYMENT: {e}")
            return {'error': str(e), 'function': 'UNEMPLOYMENT'}


# Create the financial data tool instance
financial_data_tool = FinancialDataTool()


@functions_framework.cloud_event
def refresh_global_us_data(cloud_event):
    """
    Cloud Function triggered by Cloud Scheduler to check for global US data metrics
    """
    try:
        logger.info("🔍 Starting daily data check")       
        today = datetime.datetime.now().strftime("%Y-%m-%d") 

        # Fetch global US data metrics
        inflation_data = financial_data_tool.get_global_us_inflation_data()
        cpi_data = financial_data_tool.get_global_us_cpi_data()
        federal_funds_rate_data = financial_data_tool.get_global_us_federal_funds_rate_data()
        retail_sales_data = financial_data_tool.get_global_us_retail_sales_data()
        unemployment_data = financial_data_tool.get_global_us_unemployment_data()

        # Save data to Firestore
        if isinstance(inflation_data, dict):
            print(f"Error fetching inflation data: {inflation_data}")
        else:
            db.collection('global_us_data').document('inflation').set({
                'data': [data.model_dump() for data in inflation_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            db.collection('global_us_data').document('inflation').collection("history").document(today).set({
                'data': [data.model_dump() for data in inflation_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        if isinstance(cpi_data, dict):
            print(f"Error fetching CPI data: {cpi_data}")
        else:
            db.collection('global_us_data').document('cpi').set({
                'data': [data.model_dump() for data in cpi_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            db.collection('global_us_data').document('cpi').collection("history").document(today).set({
                'data': [data.model_dump() for data in cpi_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        if isinstance(federal_funds_rate_data, dict):
            print(f"Error fetching Federal Funds Rate data: {federal_funds_rate_data}")
        else:
            db.collection('global_us_data').document('federal_funds_rate').set({
                'data': [data.model_dump() for data in federal_funds_rate_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            db.collection('global_us_data').document('federal_funds_rate').collection("history").document(today).set({
                'data': [data.model_dump() for data in federal_funds_rate_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        if isinstance(retail_sales_data, dict):
            print(f"Error fetching Retail Sales data: {retail_sales_data}")
        else:
            db.collection('global_us_data').document('retail_sales').set({
                'data': [data.model_dump() for data in retail_sales_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            db.collection('global_us_data').document('retail_sales').collection("history").document(today).set({
                'data': [data.model_dump() for data in retail_sales_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        if isinstance(unemployment_data, dict):
            print(f"Error fetching Unemployment data: {unemployment_data}")
        else:
            db.collection('global_us_data').document('unemployment').set({
                'data': [data.model_dump() for data in unemployment_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            db.collection('global_us_data').document('unemployment').collection("history").document(today).set({
                'data': [data.model_dump() for data in unemployment_data],
                'timestamp': firestore.SERVER_TIMESTAMP
            })

        logger.info(f"✅ Completed daily check")
    except Exception as e:
        print(f"❌ Error in daily data check: {str(e)}")
        raise

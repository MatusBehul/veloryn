import base64
import json
import os
import requests
from datetime import datetime, timedelta
from google.cloud import bigquery
import functions_framework

ALPHAVANTAGE_API_KEY = os.environ.get('ALPHAVANTAGE_API_KEY')
GCP_PROJECT = os.environ.get('GCP_PROJECT', 'veloryn-prod')

def get_news_sentiment(ticker: str, price_data: dict[str, dict[str, float]] = {}) -> dict[str, float]:
    url = 'https://www.alphavantage.co/query'
    params = {
        'function': 'NEWS_SENTIMENT',
        'tickers': ticker,
        'apikey': ALPHAVANTAGE_API_KEY,
        'limit': '1000'
    }
    retrieved_data = {}

    response = requests.get(url, params=params)
    print(f"[{ticker}][NEWS_SENTIMENT]: Received data")
    if response.status_code == 200:
        data = response.json()
        if 'feed' in data:
            for item in data['feed']:
                time_published = item.get('time_published')
                if time_published:
                    time_published = datetime.strptime(time_published, '%Y%m%dT%H%M%S').strftime('%Y-%m-%d %H:%M:%S')

                    if time_published not in retrieved_data:
                        retrieved_data[time_published] = 0.00
                    ticker_sentiment = item.get('ticker_sentiment', [])
                    for sentiment in ticker_sentiment:
                        if sentiment.get('ticker') == ticker:
                            retrieved_data[time_published] += float(sentiment.get('ticker_sentiment_score', 0)) * float(sentiment.get('relevance_score', 0))
                else:
                    print(f"[{ticker}][NEWS_SENTIMENT]: No 'time_published' found for an item.")
        else:
            print(f"[{ticker}][NEWS_SENTIMENT]: No 'feed' key found in the response.")
    else:
        print(f"[{ticker}][NEWS_SENTIMENT]: Error: Received status code {response.status_code}")

    for timestamp, information in price_data.items():
        sentiment_15min = 0.0
        sentiment_60min = 0.0
        sentiment_1day = 0.0
        sentiment_14day = 0.0
        sentiment_30day = 0.0

        for sentiment_timestamp, sentiment_score in retrieved_data.items():
            timestamp_dt = datetime.strptime(timestamp, '%Y-%m-%d')
            sentiment_timestamp_dt = datetime.strptime(sentiment_timestamp, '%Y-%m-%d %H:%M:%S')

            if sentiment_timestamp_dt <= timestamp_dt:
                if sentiment_timestamp_dt >= timestamp_dt - timedelta(minutes=15):
                    sentiment_15min += sentiment_score
                if sentiment_timestamp_dt >= timestamp_dt - timedelta(minutes=60):
                    sentiment_60min += sentiment_score
                if sentiment_timestamp_dt >= timestamp_dt - timedelta(days=1):
                    sentiment_1day += sentiment_score
                if sentiment_timestamp_dt >= timestamp_dt - timedelta(days=14):
                    sentiment_14day += sentiment_score
                if sentiment_timestamp_dt >= timestamp_dt - timedelta(days=30):
                    sentiment_30day += sentiment_score

        information['sentiment_15min'] = sentiment_15min
        information['sentiment_60min'] = sentiment_60min
        information['sentiment_1day'] = sentiment_1day
        information['sentiment_14day'] = sentiment_14day
        information['sentiment_30day'] = sentiment_30day

    return price_data

def get_day_prices(ticker: str):
    url = 'https://www.alphavantage.co/query'
    params = {
        'function': 'TIME_SERIES_DAILY',
        'symbol': ticker,
        'apikey': ALPHAVANTAGE_API_KEY,
    }

    response = requests.get(url, params=params)
    print(f"[{ticker}][TIME_SERIES_DAILY]: Received data")
    if response.status_code == 200:
        data = response.json()
        if 'Time Series (Daily)' in data:
            return {
                timestamp: {
                    'open': float(values['1. open']),
                    'high': float(values['2. high']),
                    'low': float(values['3. low']),
                    'close': float(values['4. close']),
                    'volume': int(values['5. volume'])
                }
                for timestamp, values in data['Time Series (Daily)'].items()
            }
        else:
            print(f"[{ticker}][TIME_SERIES_DAILY]: No 'Time Series (Daily)' key found in the response.")
    else:
        print(f"[{ticker}][TIME_SERIES_DAILY]: Error: Received status code {response.status_code}")

def get_sma_ema_wma_dema_tema_trima_kama_mama_t3(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func in [
        'SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3'
    ]:
        for time_period in ['60', '200']:
            params = {
                'function': func,
                'symbol': ticker,
                'time_period': time_period,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}, {time_period}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        timestamp_adj = timestamp
                        if timestamp_adj in price_data:
                            price_data[timestamp_adj][f'{func.lower()}_{time_period}'] = float(values[func])
                else:
                    print(f"[{ticker}][{func}, {time_period}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}, {time_period}]: Error: Received status code {response.status_code}")

    return price_data

def get_macd_apo_ppo_ultosc_bop_sar_trange_adosc_obv_htdcphase(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func in [
        'MACD', 'APO', 'PPO', 'ULTOSC', 'BOP', 'SAR', 'TRANGE', 'ADOSC', 'OBV', 'HT_DCPHASE', 
    ]:
        params = {
            'function': func,
            'symbol': ticker,
            'interval': 'daily',
            'series_type': 'close',
            'apikey': ALPHAVANTAGE_API_KEY,
        }

        response = requests.get(url, params=params)
        print(f"[{ticker}][{func}]: Received data")
        if response.status_code == 200:
            data = response.json()
            if f'Technical Analysis: {func}' in data:
                for timestamp, values in data[f'Technical Analysis: {func}'].items():
                    timestamp_adj = timestamp
                    if timestamp_adj in price_data:
                        price_data[timestamp_adj].update({
                            f'{func.lower()}': float(values[f'{func}']),
                            f'{func.lower()}_signal': float(values[f'{func}_Signal']),
                            f'{func.lower()}_hist': float(values[f'{func}_Hist']),
                        })
            else:
                print(f"[{ticker}][{func}]: No 'Technical Analysis: {func}' key found in the response.")
        else:
            print(f"[{ticker}][{func}]: Error: Received status code {response.status_code}")

    return price_data

def get_stoch_stochf(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func, keys in [
        ('STOCH', ['SlowK', 'SlowD']),
        ('STOCHF', ['FastK', 'FastD']),
    ]:
        for _ in ['1']:
            params = {
                'function': func,
                'symbol': ticker,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        if timestamp in price_data:
                            price_data[timestamp].update({
                                f'{func.lower()}_{keys[0].lower()}': float(values[keys[0]]),
                                f'{func.lower()}_{keys[1].lower()}': float(values[keys[1]]),
                            })
                else:
                    print(f"[{ticker}][{func}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}]: Error: Received status code {response.status_code}")

    return price_data

def get_httredmode(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func, keys in [
        ('HT_TRENDMODE', ['TRENDMODE']),
    ]:
        for _ in ['1']:
            params = {
                'function': func,
                'symbol': ticker,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        timestamp_adj = timestamp
                        if timestamp_adj in price_data:
                            price_data[timestamp_adj].update({
                                f'{func.lower()}_{keys[0].lower()}': float(values[keys[0]]),
                            })
                else:
                    print(f"[{ticker}][{func}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}]: Error: Received status code {response.status_code}")

    return price_data

def get_stochrsi_aroon_bbands(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func, keys in [
        ('STOCHRSI', ['FastK', 'FastD']),
        ('AROON', ['Aroon Up', 'Aroon Down']),
        ('BBANDS', ['Real Upper Band', 'Real Middle Band', 'Real Lower Band']),
    ]:
        for time_period in ['60', '200']:
            params = {
                'function': func,
                'symbol': ticker,
                'time_period': time_period,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}, {time_period}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        timestamp_adj = timestamp
                        if timestamp_adj in price_data:
                            for i in range(len(keys)):
                                price_data[timestamp_adj].update({
                                    f'{func.lower()}_{time_period}_{keys[i].replace(" ", "").lower()}': float(values[keys[i]]),
                                })
                else:
                    print(f"[{ticker}][{func}, {time_period}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}, {time_period}]: Error: Received status code {response.status_code}")

    return price_data

def get_rsi_willr_adx_adxr_mom_cmo_roc_rocr_trix_cci_mfi_aroonsc_dx_minusdi_plusdi_minusdm_plusdm_midpoint_midprice_atr_natr(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func in [
        'RSI',
        'WILLR', 'ADX', 'ADXR', 'MOM', 'CMO', 'ROC', 'ROCR', 'TRIX',
        'CCI', 'MFI', 'AROONOSC', 'DX', 'MINUS_DI', 'PLUS_DI', 'MINUS_DM',
        'PLUS_DM', 'MIDPOINT', 'MIDPRICE', 'ATR', 'NATR',
    ]:
        for time_period in ['60', '200']:
            params = {
                'function': func,
                'symbol': ticker,
                'time_period': time_period,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}, {time_period}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        timestamp_adj = timestamp
                        if timestamp_adj in price_data:
                            price_data[timestamp_adj][f'{func.lower()}_{time_period}'] = float(values[func])
                else:
                    print(f"[{ticker}][{func}, {time_period}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}, {time_period}]: Error: Received status code {response.status_code}")

    return price_data

def get_ad(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func, key in [
        ('AD', "Chaikin A/D"),
        ('HT_DCPERIOD', 'DCPERIOD'),
    ]:
        params = {
            'function': func,
            'symbol': ticker,
            'interval': 'daily',
            'series_type': 'close',
            'apikey': ALPHAVANTAGE_API_KEY,
        }

        response = requests.get(url, params=params)
        print(f"[{ticker}][{func}]: Received data")
        if response.status_code == 200:
            data = response.json()
            if f'Technical Analysis: {func}' in data:
                for timestamp, values in data[f'Technical Analysis: {func}'].items():
                    timestamp_adj = timestamp
                    if timestamp_adj in price_data:
                        price_data[timestamp_adj][f'{func.lower()}'] = float(values[key])
            else:
                print(f"[{ticker}][{func}]: No 'Technical Analysis: {key}' key found in the response.")
        else:
            print(f"[{ticker}][{func}]: Error: Received status code {response.status_code}")

    return price_data

def get_httredmode(ticker: str, price_data: dict[str, dict[str, float]] = {}):
    url = 'https://www.alphavantage.co/query'
    for func, keys in [
        ('HT_PHASOR', ['PHASE', 'QUADRATURE']),
        ('HT_SINE', ['SINE', 'LEAD SINE'])
    ]:
        for _ in ['1']:
            params = {
                'function': func,
                'symbol': ticker,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': ALPHAVANTAGE_API_KEY,
            }

            response = requests.get(url, params=params)
            print(f"[{ticker}][{func}]: Received data")
            if response.status_code == 200:
                data = response.json()
                if f'Technical Analysis: {func}' in data:
                    for timestamp, values in data[f'Technical Analysis: {func}'].items():
                        timestamp_adj = timestamp
                        if timestamp_adj in price_data:
                            price_data[timestamp_adj].update({
                                f'{func.lower()}_{keys[0].replace(" ", "").lower()}': float(values[keys[0]]),
                            })
                            price_data[timestamp_adj].update({
                                f'{func.lower()}_{keys[1].replace(" ", "").lower()}': float(values[keys[1]]),
                            })
                else:
                    print(f"[{ticker}][{func}]: No 'Technical Analysis: {func}' key found in the response.")
            else:
                print(f"[{ticker}][{func}]: Error: Received status code {response.status_code}")

    return price_data

def save_to_bigquery(data: dict, ticker: str, project_id: str, dataset_id: str, table_id: str):
    client = bigquery.Client(project=project_id)
    table_ref = client.dataset(dataset_id).table(table_id)
    rows_to_insert = []

    # Fetch existing dates for the ticker from BigQuery
    query = f"""
        SELECT date
        FROM `{project_id}.{dataset_id}.{table_id}`
        WHERE ticker = '{ticker}'
        ORDER BY date DESC
        LIMIT 100
    """
    existing_dates = set()
    for row in client.query(query).result():
        existing_dates.add(str(row.date))

    # Only insert rows for dates not already present
    for date, info in data.items():
        if date not in existing_dates:
            rows_to_insert.append({
                **info,
                'date': date,
                'ticker': ticker
            })

    if rows_to_insert:
        errors = client.insert_rows_json(table_ref, rows_to_insert)
    else:
        errors = []
    if errors:
        print(f"[{ticker}]: Encountered errors while inserting rows: {errors}")
    else:
        print(f"[{ticker}]: Rows successfully inserted into BigQuery.")

# Cloud Function entry point
@functions_framework.cloud_event
def execute_collection(cloud_event):
    try:
        payload_raw = base64.b64decode(cloud_event.data["message"]["data"]).decode("utf-8")
        payload = json.loads(payload_raw)
    except Exception:
        print("Failed to parse Pub/Sub data")
        raise

    ticker = payload.get("ticker")
    if not ticker:
        print("No ticker provided in the payload")
        raise ValueError("No ticker provided in the payload")

    if not ALPHAVANTAGE_API_KEY:
        print("ALPHAVANTAGE_API_KEY environment variable is not set.")
        raise ValueError("ALPHAVANTAGE_API_KEY environment variable is not set.")

    print(f"[{ticker}]: Starting data collection")
    data = get_day_prices(ticker)
    data = get_news_sentiment(ticker, data)
    data = get_rsi_willr_adx_adxr_mom_cmo_roc_rocr_trix_cci_mfi_aroonsc_dx_minusdi_plusdi_minusdm_plusdm_midpoint_midprice_atr_natr(ticker, data)
    data = get_sma_ema_wma_dema_tema_trima_kama_mama_t3(ticker, data)
    data = get_stoch_stochf(ticker, data)
    data = get_stochrsi_aroon_bbands(ticker, data)
    data = get_httredmode(ticker, data)
    print(f"[{ticker}]: Finished data collection, starting data insertion")
    save_to_bigquery(data, ticker, GCP_PROJECT, 'stock_data', 'daily_all')
    print(f"[{ticker}]: Finished data insertion")

if __name__ == "__main__":    
    ticker = 'ASTS'
    data = get_day_prices(ticker)
    data = get_news_sentiment(ticker, data)
    data = get_rsi_willr_adx_adxr_mom_cmo_roc_rocr_trix_cci_mfi_aroonsc_dx_minusdi_plusdi_minusdm_plusdm_midpoint_midprice_atr_natr(ticker, data)
    data = get_sma_ema_wma_dema_tema_trima_kama_mama_t3(ticker, data)
    data = get_stoch_stochf(ticker, data)
    data = get_stochrsi_aroon_bbands(ticker, data)
    data = get_httredmode(ticker, data)
    
    save_to_bigquery(data, ticker, GCP_PROJECT, 'stock_data', 'daily_all')
    # for item, info in data.items():
    #     print(f"{item}: {info}")
"""
News Monitoring Cloud Function
Fetches financial news from Alpha Vantage every 30 minutes and stores them in Firestore
Creates ticker profiles and enables filtering by ticker, topics, and time published
"""

import os
import json
import hashlib
import requests
from datetime import datetime
from typing import Dict, List, Tuple
from google.cloud import firestore
import logging
import functions_framework

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALPHAVANTAGE_API_KEY = os.environ.get('ALPHAVANTAGE_API_KEY')
PROJECT_ID = os.environ.get('GCP_PROJECT')

class NewsMonitoringService:
    """
    Service for monitoring and storing financial news from Alpha Vantage
    """
    
    def __init__(self):
        self.db = firestore.Client(project=PROJECT_ID)
        self.api_key = ALPHAVANTAGE_API_KEY
        self.base_url = 'https://www.alphavantage.co/query'
        
        if not self.api_key:
            raise ValueError("ALPHAVANTAGE_API_KEY environment variable is required")
    
    def generate_content_hash(self, news_item: Dict) -> str:
        """
        Generate a unique hash for news content to use as document ID
        Uses title, url, and time_published to ensure uniqueness
        """
        content_string = f"{news_item.get('title', '')}{news_item.get('url', '')}{news_item.get('time_published', '')}"
        return hashlib.sha256(content_string.encode()).hexdigest()
    
    def fetch_general_news(self) -> Dict:
        """
        Fetch general market news (without specific ticker filter)
        """
        try:
            params = {
                'function': 'NEWS_SENTIMENT',
                'tickers': '',  # Empty for general market news
                'limit': 1000,  # Maximum allowed
                'apikey': self.api_key
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if "feed" in data:
                logger.info(f"Successfully fetched {len(data['feed'])} news articles")
                return data
            else:
                logger.error(f"No feed data in response: {data}")
                return {'error': 'No feed data found', 'raw_response': data}
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching news from Alpha Vantage: {e}")
            return {'error': str(e)}
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {'error': str(e)}

    
    def save_news_item(self, news_item: Dict) -> Tuple[int, List[str], List[str]]:
        """
        Normalize and enrich news item with additional metadata
        """
        try:
            # Generate content hash for document ID
            content_hash = self.generate_content_hash(news_item)
                        
            # Parse time_published to datetime for better querying
            time_published_str = news_item.get('time_published', '')
            time_published_dt = None
            if time_published_str:
                try:
                    # Format: "20250825T091629"
                    time_published_dt = datetime.strptime(time_published_str, "%Y%m%dT%H%M%S")
                except ValueError:
                    logger.warning(f"Could not parse time_published: {time_published_str}")
            
            # Normalize topics
            topics = []
            topics_relevancy = []
            if 'topics' in news_item and news_item['topics']:
                for topic in news_item['topics']:
                    if isinstance(topic, str):
                        topics.append(topic)
                        topics_relevancy.append({
                            'topic': topic,
                            'relevance_score': None
                        })
                    elif isinstance(topic, dict):
                        topics.append(topic.get('topic', topic.get('name', 'Unknown')))
                        topics_relevancy.append({
                            'topic': topic.get('topic', topic.get('name', 'Unknown')),
                            'relevance_score': topic.get('relevance_score')
                        })
            
            tickers = []
            ticker_sentiment = []
            for ticker in news_item.get('ticker_sentiment', []):
                tickers.append(ticker.get('ticker', ''))
                ticker_sentiment.append({
                    'ticker': ticker.get('ticker', ''),
                    'relevance_score': ticker.get('relevance_score'),
                    'sentiment_score': ticker.get('sentiment_score'),
                    'sentiment_label': ticker.get('sentiment_label')
                })
            
            normalized_item = {
                'id': content_hash,
                'title': news_item.get('title', ''),
                'url': news_item.get('url', ''),
                'time_published': time_published_str,
                'time_published_datetime': time_published_dt,
                'authors': news_item.get('authors', []),
                'summary': news_item.get('summary', ''),
                'source': news_item.get('source', ''),
                'source_domain': news_item.get('source_domain', ''),
                'category_within_source': news_item.get('category_within_source', ''),
                'banner_image': news_item.get('banner_image', ''),
                'topics': list(set(topics)),
                'topics_relevancy': topics_relevancy,
                'overall_sentiment_score': news_item.get('overall_sentiment_score', 0.0),
                'overall_sentiment_label': news_item.get('overall_sentiment_label', 'Neutral'),
                'ticker_sentiment': ticker_sentiment,
                'tickers': list(set(tickers)),
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            doc_ref = self.db.collection('news').document(content_hash)
            if doc_ref.get().exists:
                logger.info(f"News item already exists with ID: {content_hash}, skipping save.")
                return 0, tickers, topics

            doc_ref.set(normalized_item)

            if doc_ref.id:
                logger.info(f"Saved news item with indexes: {doc_ref.id}")
                return 1, tickers, topics
            
            return 0, tickers, topics
            
        except Exception as e:
            logger.error(f"Error normalizing news item: {e}")
            return None


    def update_ticker_profiles(self, processed_tickers: List[str]) -> None:
        """
        Update ticker profiles with latest news count and last news date
        """
        try:
            ticker_stats = {}
            
            # Aggregate stats for each ticker
            for ticker in processed_tickers:
                if ticker not in ticker_stats:
                    ticker_stats[ticker] = {
                        'latest_news_count': 0,
                        }
                    
                ticker_stats[ticker]['latest_news_count'] += 1

                try:
                    ticker_ref = self.db.collection('tickers').document(ticker)
                    ticker_doc = ticker_ref.get()
                    
                    if ticker_doc.exists:
                        # Update existing profile
                        ticker_ref.update({
                            'last_news_update': datetime.now(),
                            'latest_news_count': firestore.Increment(ticker_stats[ticker]['latest_news_count']),
                        })
                    else:
                        # Create new ticker profile
                        ticker_ref.set({
                            'ticker': ticker,
                            'created_at': datetime.now(),
                            'last_news_update': datetime.now(),
                            'latest_news_count': ticker_stats[ticker]['latest_news_count'],
                            'total_analysis_count': 0,
                            'last_analysis_date': None,
                            'current_price': None,
                            'description': None
                        })
                    
                    logger.info(f"Updated ticker profile for {ticker}")
                    
                except Exception as e:
                    logger.error(f"Error updating ticker profile for {ticker}: {e}")
                    
        except Exception as e:
            logger.error(f"Error updating ticker profiles: {e}")


    def process_news_batch(self) -> Dict:
        """
        Main function to fetch and process news
        """
        try:
            # Fetch news from Alpha Vantage
            news_data = self.fetch_general_news()
            
            if 'error' in news_data:
                return {
                    'success': False,
                    'error': news_data['error'],
                    'processed_count': 0
                }
            
            feed = news_data.get('feed', [])
            if not feed:
                return {
                    'success': True,
                    'message': 'No news items found',
                    'processed_count': 0
                }
            
            # Process and save each news item
            processed_tickers = []
            processed_topics = []
            success_count = 0
            
            for news_item in feed:
                result, tickers, topics = self.save_news_item(news_item)
                success_count += result
                processed_tickers.extend(tickers)
                processed_topics.extend(topics)

            # Update ticker profiles
            processed_tickers = list(set(processed_tickers))
            if processed_tickers:
                self.update_ticker_profiles(processed_tickers)
            
            return {
                'success': True,
                'processed_count': success_count,
                'total_count': len(feed),
                'failed_count': len(feed) - success_count
            }
            
        except Exception as e:
            logger.error(f"Error processing news batch: {e}")
            return {
                'success': False,
                'error': str(e),
                'processed_count': 0
            }


# Cloud Function entry point
@functions_framework.cloud_event
def news_monitoring_trigger(cloud_event):
    """
    Cloud Function triggered by Cloud Scheduler every 30 minutes
    """
    try:
        service = NewsMonitoringService()
        result = service.process_news_batch()
        
        if result['success']:
            logger.info(f"Successfully processed {result['processed_count']} news items")
            return {
                'statusCode': 200,
                'body': json.dumps(result)
            }
        else:
            logger.error(f"News processing failed: {result.get('error', 'Unknown error')}")
            return {
                'statusCode': 500,
                'body': json.dumps(result)
            }
            
    except Exception as e:
        logger.error(f"Cloud function error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

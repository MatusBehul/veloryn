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
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Set
from google.cloud import firestore, pubsub_v1
import functions_framework

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
PROJECT_ID = os.environ.get('GCP_PROJECT', 'lab-quoriant-dev')
EMAIL_TOPIC = os.environ.get('EMAIL_PUBSUB_TOPIC', 'email-analysis-requests')
ANALYSIS_BATCH_SIZE = int(os.environ.get('ANALYSIS_BATCH_SIZE', '50'))  # Process analyses in batches
LOOKBACK_HOURS = int(os.environ.get('LOOKBACK_HOURS', '1'))  # How far back to look for new analyses

# Initialize clients
db = firestore.Client(project=PROJECT_ID)
publisher = pubsub_v1.PublisherClient()

def get_topic_path():
    """Get the topic path and ensure topic exists"""
    topic_path = publisher.topic_path(PROJECT_ID, EMAIL_TOPIC)
    try:
        # Try to get topic info to verify it exists
        publisher.get_topic(request={"topic": topic_path})
        logger.info(f"✅ Pub/Sub topic exists: {EMAIL_TOPIC}")
    except Exception as e:
        logger.warning(f"⚠️ Topic {EMAIL_TOPIC} may not exist: {str(e)}")
    return topic_path

@functions_framework.cloud_event
def check_new_analyses(cloud_event):
    """
    Cloud Function triggered by Cloud Scheduler to check for new analyses
    and send notifications to users with matching favorite tickers.
    """
    try:
        logger.info("🔍 Starting hourly analysis check")
        logger.info(f"Configuration: PROJECT_ID={PROJECT_ID}, EMAIL_TOPIC={EMAIL_TOPIC}")
        
        # Test topic connectivity
        topic_path = get_topic_path()
        logger.info(f"Using topic path: {topic_path}")
        
        # Calculate time window for new analyses
        now = datetime.utcnow()
        lookback_time = now - timedelta(hours=LOOKBACK_HOURS)
        
        logger.info(f"Looking for analyses created after {lookback_time}")
        
        # Get new analyses from the last hour
        new_analyses = get_new_analyses(lookback_time)
        
        if not new_analyses:
            logger.info("✅ No new analyses found")
            return
        
        logger.info(f"📊 Found {len(new_analyses)} new analyses")
        
        # Process analyses in batches to avoid memory issues
        processed_count = 0
        for i in range(0, len(new_analyses), ANALYSIS_BATCH_SIZE):
            batch = new_analyses[i:i + ANALYSIS_BATCH_SIZE]
            batch_processed = process_analysis_batch(batch)
            processed_count += batch_processed
            
            logger.info(f"Processed batch {i//ANALYSIS_BATCH_SIZE + 1}: {batch_processed} analyses")
        
        logger.info(f"✅ Completed hourly check. Processed {processed_count} analyses")
        
    except Exception as e:
        logger.error(f"❌ Error in hourly analysis check: {str(e)}")
        raise


def get_new_analyses(since: datetime) -> List[Dict]:
    """
    Retrieve analyses created since the specified time.
    
    Args:
        since: Datetime to look for analyses after
        
    Returns:
        List of analysis documents
    """
    try:
        logger.info(f"Querying for analyses since: {since}")
        
        # Query Firestore for new analyses
        analyses_ref = db.collection('financial_analysis')
        query = analyses_ref.where('created_at', '>', since).order_by('created_at')
        
        analyses = []
        doc_count = 0
        for doc in query.stream():
            doc_count += 1
            data = doc.to_dict()
            data['id'] = doc.id
            analyses.append(data)
            
            # Log first few for debugging
            if doc_count <= 3:
                logger.info(f"Found analysis: {doc.id} for {data.get('ticker')} at {data.get('created_at')}")
        
        logger.info(f"Retrieved {len(analyses)} analyses from Firestore (streamed {doc_count} docs)")
        return analyses
        
    except Exception as e:
        logger.error(f"Error retrieving new analyses: {str(e)}")
        logger.error(f"Query was for analyses since: {since}")
        return []


def process_analysis_batch(analyses: List[Dict]) -> int:
    """
    Process a batch of analyses and trigger email notifications.
    
    Args:
        analyses: List of analysis documents
        
    Returns:
        Number of analyses processed successfully
    """
    processed_count = 0
    
    # Get unique tickers from this batch
    tickers_in_batch = set(analysis.get('ticker') for analysis in analyses if analysis.get('ticker'))
    
    if not tickers_in_batch:
        logger.warning("No valid tickers found in analysis batch")
        return 0
    
    logger.info(f"Processing batch with tickers: {', '.join(tickers_in_batch)}")
    
    # Get all users who have any of these tickers as favorites
    users_by_ticker = get_users_by_tickers(tickers_in_batch)
    
    # Process each analysis
    for analysis in analyses:
        ticker = analysis.get('ticker')
        if not ticker:
            logger.warning(f"Analysis {analysis.get('id')} has no ticker, skipping")
            continue
            
        try:
            # Get users who have this ticker as favorite
            interested_users = users_by_ticker.get(ticker, [])
            
            if not interested_users:
                logger.info(f"No users interested in {ticker}")
                continue
            
            # Send email notification
            success = send_email_notification(analysis, interested_users)
            
            if success:
                processed_count += 1
                logger.info(f"✅ Triggered email for {ticker} to {len(interested_users)} users")
            else:
                logger.error(f"❌ Failed to trigger email for {ticker}")
                
        except Exception as e:
            logger.error(f"Error processing analysis {analysis.get('id')}: {str(e)}")
    
    return processed_count


def get_users_by_tickers(tickers: Set[str]) -> Dict[str, List[str]]:
    """
    Efficiently retrieve all users who have any of the specified tickers as favorites.
    
    Args:
        tickers: Set of ticker symbols
        
    Returns:
        Dictionary mapping ticker -> list of user emails
    """
    users_by_ticker = {ticker: [] for ticker in tickers}
    
    try:
        # Get all users (we need to scan all users since Firestore doesn't support 
        # complex queries on array elements)
        users_ref = db.collection('users')
        
        # Process users in batches to avoid memory issues
        batch_size = 1000
        last_doc = None
        total_users_processed = 0
        
        while True:
            # Build query with pagination
            query = users_ref.limit(batch_size)
            if last_doc:
                query = query.start_after(last_doc)
            
            docs = list(query.stream())
            if not docs:
                break
                
            # Process this batch of users
            for doc in docs:
                user_data = doc.to_dict()
                user_email = user_data.get('email')
                favorite_tickers = user_data.get('favoriteTickers', [])
                
                if not user_email or not favorite_tickers:
                    continue
                
                # Check if user has any of our tickers as favorites with daily updates enabled
                for fav_ticker in favorite_tickers:
                    ticker_symbol = fav_ticker.get('symbol')
                    daily_updates = fav_ticker.get('dailyUpdates', False)
                    
                    if ticker_symbol in tickers and daily_updates:
                        users_by_ticker[ticker_symbol].append(user_email)
            
            total_users_processed += len(docs)
            last_doc = docs[-1]
            
            # Log progress for large user bases
            if total_users_processed % 5000 == 0:
                logger.info(f"Processed {total_users_processed} users so far...")
        
        logger.info(f"Processed {total_users_processed} total users")
        
        # Log summary
        for ticker, emails in users_by_ticker.items():
            logger.info(f"Ticker {ticker}: {len(emails)} interested users")
            
        return users_by_ticker
        
    except Exception as e:
        logger.error(f"Error retrieving users by tickers: {str(e)}")
        return {ticker: [] for ticker in tickers}


def send_email_notification(analysis: Dict, user_emails: List[str]) -> bool:
    """
    Send email notification by publishing to Pub/Sub topic.
    
    Args:
        analysis: Analysis document
        user_emails: List of user email addresses
        
    Returns:
        True if message published successfully
    """
    try:
        # Prepare the email message for Pub/Sub
        email_message = {
            'analysisId': analysis['id'],
            'ticker': analysis['ticker'],
            'recipients': user_emails,
            'type': 'bulk',  # Use bulk mode with specific recipients
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Publish to Pub/Sub topic
        message_data = json.dumps(email_message).encode('utf-8')
        topic_path = get_topic_path()
        future = publisher.publish(topic_path, message_data)
        
        # Wait for publish to complete
        message_id = future.result(timeout=30)
        
        logger.info(f"Published email message {message_id} for {analysis['ticker']} to {len(user_emails)} recipients")
        return True
        
    except Exception as e:
        logger.error(f"Error publishing email message: {str(e)}")
        return False

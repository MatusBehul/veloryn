# News Monitoring Cloud Function

This cloud function creates a comprehensive news monitoring hub that fetches financial news from Alpha Vantage every 30 minutes and stores them in an optimized Firestore structure for efficient filtering.

## Features

- **Automated News Collection**: Fetches news every 30 minutes via Cloud Scheduler
- **Efficient Filtering**: Optimized Firestore structure for fast queries by ticker, topic, and date
- **Ticker Profiles**: Automatically creates and updates ticker profiles with news metadata
- **Content Deduplication**: Uses content hashing to prevent duplicate news items
- **Sentiment Analysis**: Stores and indexes sentiment data for both overall and ticker-specific sentiment

## Firestore Collections Structure

### 1. Main Collections

- **`news`**: Complete news documents with all metadata
- **`news_by_ticker/{ticker}/articles/{news_id}`**: News indexed by ticker symbol
- **`news_by_topic/{topic_key}/articles/{news_id}`**: News indexed by topic
- **`news_by_date/{YYYY-MM-DD}/articles/{news_id}`**: News indexed by date
- **`ticker_profiles/{ticker}`**: Aggregated ticker statistics and metadata
- **`news_batches/{batch_id}`**: Batch processing metadata and statistics

### 2. Filtering Capabilities

#### Filter by Ticker
```python
# Get latest news for TSLA
news = news_query.get_news_by_ticker('TSLA', limit=50)

# Get TSLA news in date range
from datetime import datetime, timedelta
start_date = datetime.now() - timedelta(days=7)
end_date = datetime.now()
news = news_query.get_news_by_ticker('TSLA', limit=50, start_date=start_date, end_date=end_date)
```

#### Filter by Topic
```python
# Get news about Technology
news = news_query.get_news_by_topic('Technology', limit=50)

# Get Technology news in date range
news = news_query.get_news_by_topic('Technology', limit=50, start_date=start_date, end_date=end_date)
```

#### Filter by Date Range
```python
# Get all news in last 7 days
news = news_query.get_news_by_date_range(start_date, end_date, limit=100)
```

#### Combined Filters
```python
# Get news for specific ticker and topic
news = news_query.get_news_by_ticker_and_topic('TSLA', 'Technology', limit=25)

# Get news by sentiment
news = news_query.get_news_with_sentiment_filter('Bullish', limit=50)
```

#### Ticker Profile Data
```python
# Get latest news for ticker profile display
profile_news = news_query.get_latest_news_for_ticker_profile('TSLA', limit=10)

# Get trending topics
trending = news_query.get_trending_topics(days_back=7)
```

## API Endpoints (HTTP Trigger)

### Collection Endpoint
- **POST** `/`: Trigger manual news collection

### Query Endpoints
- **GET** `/?action=get_news_by_ticker&ticker=TSLA&limit=10`
- **GET** `/?action=get_news_by_topic&topic=Technology&limit=10`
- **GET** `/?action=get_trending_topics&days=7`
- **GET** `/?action=get_ticker_profile_news&ticker=TSLA&limit=5`

## Data Structure Examples

### News Document Structure
```json
{
  "id": "sha256_hash_of_content",
  "title": "Tesla Stock Surges After Earnings Beat",
  "url": "https://...",
  "time_published": "20250825T091629",
  "time_published_datetime": "2025-08-25T09:16:29",
  "authors": ["John Doe"],
  "summary": "Tesla reported strong quarterly earnings...",
  "source": "Reuters",
  "source_domain": "reuters.com",
  "topics": [
    {
      "topic": "Technology",
      "relevance_score": "0.8"
    }
  ],
  "overall_sentiment_score": 0.25,
  "overall_sentiment_label": "Somewhat-Bullish",
  "ticker_sentiment": [
    {
      "ticker": "TSLA",
      "relevance_score": "0.95",
      "ticker_sentiment_score": "0.35",
      "ticker_sentiment_label": "Bullish"
    }
  ],
  "mentioned_tickers": ["TSLA", "NVDA"],
  "created_at": "2025-08-25T10:00:00",
  "updated_at": "2025-08-25T10:00:00"
}
```

### Ticker Profile Structure
```json
{
  "ticker": "TSLA",
  "created_at": "2025-08-25T10:00:00",
  "last_news_update": "2025-08-25T10:00:00",
  "latest_news_count": 25,
  "last_news_date": "2025-08-25T09:16:29",
  "total_analysis_count": 15,
  "last_analysis_date": "2025-08-25T08:00:00",
  "current_price": 250.50,
  "description": "Tesla, Inc. is an American electric vehicle..."
}
```

## Deployment

1. **Deploy the function:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Set environment variables:**
   - `ALPHAVANTAGE_API_KEY`: Your Alpha Vantage API key
   - `GCP_PROJECT`: Your Google Cloud Project ID

3. **Firestore Indexes:**
   The function will automatically create the necessary indexes, but you may want to manually create composite indexes for complex queries:
   
   ```
   # Example composite indexes in firestore.indexes.json
   {
     "indexes": [
       {
         "collectionGroup": "articles",
         "queryScope": "COLLECTION_GROUP",
         "fields": [
           {"fieldPath": "ticker", "order": "ASCENDING"},
           {"fieldPath": "time_published_datetime", "order": "DESCENDING"}
         ]
       },
       {
         "collectionGroup": "articles", 
         "queryScope": "COLLECTION_GROUP",
         "fields": [
           {"fieldPath": "overall_sentiment_label", "order": "ASCENDING"},
           {"fieldPath": "time_published_datetime", "order": "DESCENDING"}
         ]
       }
     ]
   }
   ```

## Use Cases

### 1. Web App Integration
- Display latest news on ticker profile pages
- Show trending topics on dashboard
- Filter news by user preferences

### 2. Email Newsletter
- Aggregate news by topic for daily/weekly newsletters
- Personalized news based on user's followed tickers
- Sentiment-based news filtering (only positive/negative news)

### 3. Analytics
- Track sentiment trends over time
- Identify most-mentioned tickers in news
- Analyze correlation between news sentiment and stock price movements

## Rate Limiting & Costs

- Alpha Vantage Free Tier: 25 requests/day
- Alpha Vantage Premium: 1200+ requests/day
- Firestore: Pay per read/write operation
- Cloud Functions: Pay per invocation and compute time

## Monitoring

- View function logs in Cloud Console
- Monitor news collection statistics in `news_batches` collection
- Set up alerts for failed collections
- Track API quota usage

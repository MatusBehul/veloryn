# Financial Analysis Cloud Function

A Google Cloud Function that triggers your financial analysis agent and saves results to Firestore with comprehensive performance tracking and cost monitoring.

## 🏗️ Architecture

```
Cloud Scheduler → Cloud Function → Cloud Run (ADK Agent) → Firestore
                      ↓
               Performance Metrics
               Metadata Storage
               Cost Tracking
```

## 📁 Project Structure

```
cloud_function/
├── main.py                    # Main Cloud Function code
├── requirements.txt           # Python dependencies
├── daily_analysis_prompts.py  # Analysis prompts (copied from parent)
├── deploy.sh                  # Deployment script
├── .env.yaml.example         # Environment configuration template
├── test_function.py          # Testing utilities
└── README.md                 # This file
```

## 🚀 Features

### Core Functionality
- **Session Management**: Automatic session creation before analysis
- **HTTP Trigger**: Manual analysis trigger via HTTP request
- **Scheduler Trigger**: Automated daily analysis via Cloud Scheduler
- **Comprehensive Logging**: Full request/response tracking
- **Error Handling**: Robust error handling and recovery

### Analysis Flow
1. **Session Creation**: Creates session with preferred language settings
2. **Analysis Execution**: Sends analysis request to ADK agent
3. **Result Storage**: Saves complete results to Firestore
4. **Performance Tracking**: Records metrics and costs

### Firestore Collections
1. **`financial_analysis`**: Analysis results and data
2. **`performance_metrics`**: Response times, success rates, execution metrics
3. **`analysis_metadata`**: Request metadata, user info, session tracking
4. **`cost_tracking`**: Estimated costs for Cloud Run, Gemini API, and Firestore

### Cost Monitoring
- Cloud Run execution costs
- Gemini API token usage costs
- Firestore read/write costs
- Total cost per analysis

## 🛠️ Setup Instructions

### 1. Prerequisites
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.yaml.example .env.yaml

# Edit with your actual values
nano .env.yaml
```

Required environment variables:
- `CLOUD_RUN_URL`: Your ADK Cloud Run service URL
- `GCP_PROJECT`: Your Google Cloud Project ID

### 3. Enable Required APIs
```bash
# Enable required Google Cloud APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable pubsub.googleapis.com
```

### 4. Deploy Functions
```bash
# Make deployment script executable
chmod +x deploy.sh

# Update deploy.sh with your project details
nano deploy.sh

# Deploy both functions
./deploy.sh
```

## 📊 Usage

### HTTP Trigger (Manual)
```bash
# Single ticker analysis
curl -X POST https://REGION-PROJECT_ID.cloudfunctions.net/financial-analysis-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "user_id": "manual_user"
  }'

# Response format
{
  "success": true,
  "ticker": "AAPL",
  "session_id": "daily_aapl_20250812_143022",
  "result_document_id": "AAPL_20250812_143022",
  "execution_time": 45.67,
  "analysis_success": true
}
```

### Session Creation Process
The function automatically handles session creation before analysis:

1. **Session URL**: `{CLOUD_RUN_URL}/apps/financial_reporter/users/{user_id}/sessions/{session_id}`
2. **Session Payload**:
   ```json
   {
     "state": {
       "preferred_language": "English"
     }
   }
   ```
3. **Analysis URL**: `{CLOUD_RUN_URL}/run_sse`

### Scheduler Trigger (Automated)
The Cloud Scheduler automatically triggers daily analysis at 9 AM ET for:
- AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, SPY, QQQ

### Python Testing
```bash
# Test the function locally
python test_function.py

# Or import and use in your code
from test_function import test_http_function
result = test_http_function(function_url, "AAPL")
```

## 📈 Monitoring & Analytics

### Query Firestore Data

```python
from google.cloud import firestore

db = firestore.Client()

# Get recent analysis results
analyses = db.collection('financial_analysis').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).get()

# Get performance metrics
performance = db.collection('performance_metrics').where('success', '==', True).get()

# Get cost tracking
costs = db.collection('cost_tracking').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).get()
```

### Performance Dashboard Queries

```python
# Average response time by ticker
def get_avg_response_time_by_ticker():
    docs = db.collection('performance_metrics').get()
    ticker_times = {}
    for doc in docs:
        data = doc.to_dict()
        ticker = data['ticker']
        response_time = data['response_time']
        if ticker not in ticker_times:
            ticker_times[ticker] = []
        ticker_times[ticker].append(response_time)
    
    return {ticker: sum(times)/len(times) for ticker, times in ticker_times.items()}

# Daily cost tracking
def get_daily_costs(date_str):
    start_date = datetime.strptime(date_str, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    
    docs = db.collection('cost_tracking').where('timestamp', '>=', start_date).where('timestamp', '<', end_date).get()
    
    total_cost = sum(doc.to_dict()['total_estimated_cost'] for doc in docs)
    return total_cost
```

## 🔧 Configuration Options

### Function Configuration
- **Memory**: 512MB (configurable in deploy.sh)
- **Timeout**: 540s (9 minutes)
- **Max Instances**: 10 for HTTP, 5 for scheduler
- **Runtime**: Python 3.11

### Scheduler Configuration
- **Schedule**: "0 14 * * 1-5" (9 AM ET, weekdays only)
- **Timezone**: America/New_York
- **Retry Policy**: 3 retries with exponential backoff

### Cost Estimates (Approximate)
- **Cloud Function**: $0.0000024 per 100ms
- **Gemini API**: $0.0003 per 1K tokens
- **Firestore**: $0.00000018 per document write
- **Total per analysis**: ~$0.002-0.005

## 🚨 Troubleshooting

### Common Issues

1. **Function Timeout**
   - Increase timeout in deploy.sh
   - Check Cloud Run service performance
   - Verify network connectivity

2. **Authentication Errors**
   - Ensure proper IAM roles
   - Check Cloud Run service allows unauthenticated calls
   - Verify function service account permissions

3. **Firestore Errors**
   - Check Firestore database exists
   - Verify IAM permissions for Firestore
   - Ensure collection names are correct

### Debug Logging
```python
# View function logs
gcloud functions logs read financial-analysis-trigger --limit 50

# View Cloud Scheduler logs
gcloud scheduler jobs describe daily-financial-analysis
```

## 🔐 Security Considerations

- Functions run with default service account
- Cloud Run authentication handled via service account tokens
- Firestore access controlled via IAM
- Consider enabling function authentication for production use

## 📝 Customization

### Adding New Tickers
Edit the scheduler job:
```bash
gcloud scheduler jobs update pubsub daily-financial-analysis \
  --message-body '{"tickers": ["AAPL", "MSFT", "YOUR_NEW_TICKER"]}'
```

### Custom Analysis Parameters
Modify the `generate_analysis_payload` method in `main.py` to customize:
- Analysis depth
- Time periods
- Custom prompts
- User preferences

### Additional Metrics
Add custom metrics to the `save_performance_metrics` method:
- Custom timing measurements
- Business metrics
- Alert thresholds

## 🚀 Production Deployment

1. **Set up proper IAM roles**
2. **Configure VPC if needed**
3. **Set up monitoring alerts**
4. **Configure backup strategies**
5. **Implement proper error notifications**
6. **Set up cost alerts**

## 📞 Support

For issues related to:
- Cloud Function deployment: Check Google Cloud documentation
- ADK Agent issues: Review your Cloud Run service logs
- Firestore issues: Verify database configuration and permissions

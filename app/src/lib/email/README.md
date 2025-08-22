# Email Service Architecture

This document describes the pub/sub-based email architecture for sending financial analysis reports.

## Overview

The email system has been refactored from direct email sending to an asynchronous pub/sub pattern for better reliability, scalability, and separation of concerns.

## Architecture

```
Next.js API Route → Pub/Sub Topic → Cloud Function → Mailgun → Email Delivery
```

### Components

1. **API Route** (`/app/src/app/api/email/send-analysis/route.ts`)
   - Validates user authentication and authorization
   - Publishes email requests to Pub/Sub topic
   - Provides fallback to Firestore if Pub/Sub fails

2. **Email Formatting Library** (`/app/src/lib/email/`)
   - `types.ts`: Shared TypeScript interfaces
   - `formatters.ts`: Email HTML/text formatting functions
   - `index.ts`: Clean exports for the library

3. **Cloud Function** (`/cloud_function/email_processor.py`)
   - Processes Pub/Sub messages
   - Fetches analysis data from Firestore
   - Formats and sends emails via Mailgun
   - Logs delivery results for tracking

4. **Shared Formatter** (`/cloud_function/email_formatters.py`)
   - Python version of email formatting logic
   - Maintains consistency between TypeScript and Python

## Setup and Deployment

### Prerequisites

1. Google Cloud Project with Pub/Sub API enabled
2. Mailgun account with API credentials
3. Firebase project with Firestore

### Environment Variables

Set these environment variables for the Cloud Function:

```bash
GCP_PROJECT=your-google-cloud-project-id
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
FROM_EMAIL=info@wadby.me
```

### Deployment Steps

1. **Deploy the email processor Cloud Function:**
   ```bash
   cd cloud_function
   chmod +x deploy_email_processor.sh
   ./deploy_email_processor.sh
   ```

2. **Install Next.js dependencies:**
   ```bash
   cd app
   npm install
   ```

3. **Deploy Next.js application:**
   ```bash
   npm run build
   npm run deploy  # or your deployment method
   ```

### Pub/Sub Topic

The system uses the topic: `email-analysis-requests`

Message format:
```json
{
  "analysisId": "string",
  "ticker": "string", 
  "recipientEmail": "string",
  "userId": "string",
  "requestedAt": "ISO-8601-timestamp"
}
```

## Usage

### From the Frontend

The API endpoint remains the same: `POST /api/email/send-analysis`

Request body:
```json
{
  "analysisId": "firestore-document-id",
  "ticker": "AAPL",
  "recipientEmail": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Analysis report has been queued for delivery",
  "messageId": "pub-sub-message-id"
}
```

### Error Handling

1. **Pub/Sub Failure**: Falls back to Firestore queue for manual processing
2. **Authentication Errors**: Returns 401/403 status codes  
3. **Email Delivery Failures**: Logged to Firestore for investigation

## Monitoring

### Firestore Collections

- `email_logs`: Successful/failed email delivery records
- `email_errors`: Processing errors for manual review
- `email_queue`: Fallback queue when Pub/Sub is unavailable

### Cloud Function Logs

Monitor the `email-processor` function logs in Google Cloud Console for:
- Message processing success/failure
- Mailgun API responses
- Firestore operation status

## Benefits of Pub/Sub Architecture

1. **Reliability**: Messages are persisted and retried automatically
2. **Scalability**: Can handle high volumes of email requests
3. **Decoupling**: API response time not affected by email delivery
4. **Monitoring**: Better observability and error tracking
5. **Fallback**: Graceful degradation when services are unavailable

## Troubleshooting

### Common Issues

1. **Pub/Sub Topic Not Found**
   - Ensure the topic exists: `gcloud pubsub topics create email-analysis-requests`

2. **Cloud Function Not Triggering** 
   - Check function deployment status
   - Verify Pub/Sub trigger is configured correctly

3. **Mailgun Errors**
   - Verify API key and domain configuration
   - Check Mailgun sandbox restrictions

4. **Authentication Failures**
   - Ensure Firebase Admin SDK is configured correctly
   - Verify user tokens are valid

### Debug Commands

```bash
# Check Pub/Sub topic
gcloud pubsub topics list

# View Cloud Function logs  
gcloud functions logs read email-processor --region=us-central1

# Test message publishing
gcloud pubsub topics publish email-analysis-requests --message='{"test": true}'
```

## Security Considerations

1. **User Authorization**: Only analysis owners can request emails
2. **Rate Limiting**: Consider implementing rate limits for email requests
3. **Email Validation**: Validate recipient email addresses
4. **API Key Security**: Store Mailgun credentials securely in Cloud Function environment

## Future Enhancements

1. **Email Templates**: Dynamic template selection based on analysis type
2. **Batch Processing**: Group multiple emails for efficiency
3. **Delivery Tracking**: Enhanced email open/click tracking
4. **Alternative Providers**: Support for multiple email service providers

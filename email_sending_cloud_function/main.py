"""
Google Cloud Function to process email requests from Pub/Sub
Uses unified bulk email infrastructure for both single and bulk email sending
This ensures 100% consistency in formatting, sending logic, and error handling
"""

import os
import json
import base64
import logging
from google.cloud import firestore
import functions_framework
from email_formatters_comprehensive import format_analysis_for_email_comprehensive
from bulk_email import send_bulk_emails_batch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
PROJECT_ID = os.environ.get('GCP_PROJECT', 'lab-quoriant-dev')
 
# Initialize Firestore client
db = firestore.Client(project=PROJECT_ID)

@functions_framework.cloud_event
def process_email_request(cloud_event):
    """
    Cloud Function triggered by Pub/Sub messages for email processing
    """
    try:
        # # Log configuration for debugging
        # print(f"Environment check - MAILGUN_DOMAIN: {MAILGUN_DOMAIN}")
        # if MAILGUN_API_KEY:
        #     print(f"API key starts with: {MAILGUN_API_KEY[:10]}...")
        
        # Decode the Pub/Sub message
        message_data = base64.b64decode(cloud_event.data["message"]["data"]).decode('utf-8')
        email_request = json.loads(message_data)
        
        print(f"Processing email request: {email_request}")

        try:
            analysis_id = email_request.get('analysisId')
            ticker = email_request.get('ticker')
            recipients = email_request.get('recipients', [])
            email_type = email_request.get('type', 'bulk')  # 'bulk' or 'ticker'
            
            if not all([analysis_id, ticker]):
                logger.error(f"Missing required fields in email request: {email_request}")
                return False
            
            # Fetch the analysis from Firestore with all subcollection data
            analysis_doc = db.collection('financial_analysis').document(analysis_id).get()
            
            if not analysis_doc.exists:
                logger.error(f"Analysis not found: {analysis_id}")
                return False
            
            analysis_data = analysis_doc.to_dict()
            analysis_data['id'] = analysis_id

            # Fetch all subcollection documents from 'data' collection
            data_collection = db.collection('financial_analysis').document(analysis_id).collection('data')
            data_docs = data_collection.get()
            
            # Add each subcollection document to the analysis data
            for doc in data_docs:
                if doc.exists:
                    analysis_data[doc.id] = doc.to_dict()
            
            # Use analysisData if provided in the request (from frontend)
            if 'analysisData' in email_request:
                analysis_data = email_request['analysisData']
                analysis_data['id'] = analysis_id

            # Format the analysis for email
            analysis_formatted = format_analysis_for_email_comprehensive(analysis_data)

            if len(recipients) == 0:
                logger.warning("No recipients provided for bulk email")
                return False
            result = send_bulk_emails_batch(recipients, analysis_formatted)

            success = result.get('success', False)
            
        except Exception as e:
            logger.error(f"Error processing bulk email request: {str(e)}")
            success = False
        
        
        print(f"Email processing completed for analysis {analysis_id}, success: {success}")
        
    except Exception as e:
        logger.error(f"Error processing email request: {str(e)}")

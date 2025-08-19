"""
Enhanced bulk email sending functions for Mailgun
"""

import os
import logging
from typing import Dict, List, Any
import requests
import time

logger = logging.getLogger(__name__)

MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')
MAILGUN_DOMAIN = os.environ.get('MAILGUN_DOMAIN')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'veloryn@wadby.cloud')


def send_bulk_emails_batch(recipients: List[str], analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send bulk emails using Mailgun's batch sending (up to 1,000 recipients per call)
    
    Args:
        recipients: List of email addresses (max 1,000)
        subject: Email subject
        text_content: Plain text content
        html_content: HTML content
        recipient_variables: Optional dict with personalization data per recipient
    
    Returns:
        Dict with success status and results
    """

    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        logger.error('Mailgun API key or domain not configured')
        return {'success': False, 'error': 'Mailgun not configured'}
    
    if len(recipients) > 1000:
        logger.warning(f'Too many recipients ({len(recipients)}), splitting into batches')
        return send_bulk_emails_chunked(recipients, analysis)

    try:
        # Prepare form data for batch sending
        data = {
            'from': f'Veloryn Analysis <{FROM_EMAIL}>',
            'to': recipients,  # List of recipients
            'subject': analysis['subject'],
            'text': analysis['text'],
            'html': analysis['html']
        }
        
        # Send batch request to Mailgun
        response = requests.post(
            f'https://api.eu.mailgun.net/v3/{MAILGUN_DOMAIN}/messages',
            auth=('api', MAILGUN_API_KEY),
            data=data,
            timeout=60  # Longer timeout for bulk operations
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f'Bulk email sent successfully to {len(recipients)} recipients')
            return {
                'success': True,
                'message_id': result.get('id'),
                'recipients_count': len(recipients),
                'method': 'batch'
            }
        else:
            logger.error(f'Mailgun batch API error: {response.status_code} - {response.text}')
            return {
                'success': False,
                'error': f'API error: {response.status_code}',
                'details': response.text
            }
    
    except Exception as e:
        logger.error(f'Error sending bulk email with Mailgun: {str(e)}')
        return {'success': False, 'error': str(e)}


def send_bulk_emails_chunked(recipients: List[str], analysis: Dict[str, Any], chunk_size: int = 1000) -> Dict[str, Any]:
    """
    Send bulk emails in chunks when recipient list exceeds Mailgun's limit
    
    Args:
        recipients: List of email addresses
        subject: Email subject
        text_content: Plain text content
        html_content: HTML content
        recipient_variables: Optional dict with personalization data per recipient
        chunk_size: Size of each chunk (max 1,000 for Mailgun)
    
    Returns:
        Dict with aggregated results
    """
    chunks = [recipients[i:i + chunk_size] for i in range(0, len(recipients), chunk_size)]
    results = []
    total_sent = 0
    failed_chunks = 0
    
    logger.info(f'Sending bulk emails in {len(chunks)} chunks of up to {chunk_size} recipients each')
    
    for i, chunk in enumerate(chunks):
        # Get recipient variables for this chunk if provided
        chunk_variables = None
        
        # Add small delay between chunks to respect rate limits
        if i > 0:
            time.sleep(1)

        result = send_bulk_emails_batch(chunk, analysis, chunk_variables)
        results.append(result)
        
        if result['success']:
            total_sent += len(chunk)
            logger.info(f'Chunk {i+1}/{len(chunks)} sent successfully ({len(chunk)} recipients)')
        else:
            failed_chunks += 1
            logger.error(f'Chunk {i+1}/{len(chunks)} failed: {result.get("error")}')
    
    return {
        'success': failed_chunks == 0,
        'total_recipients': len(recipients),
        'total_sent': total_sent,
        'chunks_processed': len(chunks),
        'chunks_failed': failed_chunks,
        'method': 'chunked_batch',
        'chunk_results': results
    }

"""
Google Cloud Function to trigger financial analysis and save results to Firestore
"""

import os
import json
import time
import logging
import traceback
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
import asyncio
import aiohttp
from google.cloud import firestore
from google.cloud import pubsub_v1
from get_stock_data_tool import get_stock_data_tool
import functions_framework
from data_tool_model import ComprehensiveStockDataModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
CLOUD_RUN_URL = os.environ.get('CLOUD_RUN_URL')
PROJECT_ID = os.environ.get('GCP_PROJECT')
AGENT_APP_NAME = os.environ.get('AGENT_APP_NAME', 'analysis_reporter')
PUBSUB_TOPIC = os.environ.get('PUBSUB_TOPIC', 'make-ig-reel')

# Firestore collections
ANALYSIS_COLLECTION = 'financial_analysis'
PERFORMANCE_COLLECTION = 'performance_metrics'
METADATA_COLLECTION = 'analysis_metadata'
COSTS_COLLECTION = 'cost_tracking'

# Initialize Firestore client
db = firestore.Client(project=PROJECT_ID)
# Initialize Pub/Sub publisher client
publisher = pubsub_v1.PublisherClient()

class FinancialAnalysisTrigger:
    """Main class for handling financial analysis triggers"""
    
    def __init__(self):
        self.db = db
        self.session = None
        self.day_input = datetime.now().strftime("%Y-%m-%d")
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def generate_analysis_payload(self, raw_analysis_data: ComprehensiveStockDataModel) -> Dict[str, Any]:
        """Generate the payload for financial analysis"""
        ticker = raw_analysis_data.symbol.lower()
        session_id = f"daily_{ticker}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

        # Import the prompt from our structured daily_analysis_prompts module
        from daily_analysis_prompts_structured import generate_daily_analysis_prompt
        
        return {
            "app_name": AGENT_APP_NAME,
            "user_id": "clouad_function",
            "session_id": session_id,
            "new_message": {
                "role": "user",
                "parts": [
                    {
                        "text": generate_daily_analysis_prompt(raw_analysis_data)
                    }
                ]
            },
            "streaming": False  # Set to False for cloud function to get complete response
        }
    
    async def create_session(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Create a session before running analysis"""
        if not CLOUD_RUN_URL:
            raise ValueError("CLOUD_RUN_URL environment variable not set")
        
        # Get authentication token
        auth_token = self._get_access_token()
        if not auth_token:
            logger.error("Failed to obtain authentication token")
            return {
                'success': False,
                'error': 'Authentication token not available',
                'status_code': 401
            }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }
        
        # Log authentication details for debugging (without exposing the token)
        logger.info(f"Creating session with token length: {len(auth_token)}")
        logger.info(f"Token prefix: {auth_token[:20]}...")
        logger.info(f"Target URL: {CLOUD_RUN_URL}")
        
        session_payload = {
            "state": {
                "preferred_language": "English"
            }
        }
        
        session_url = f"{CLOUD_RUN_URL}/apps/{AGENT_APP_NAME}/users/{user_id}/sessions/{session_id}"
        
        try:
            async with self.session.post(
                session_url,
                json=session_payload,
                headers=headers,
                timeout=60  # 1 minute timeout for session creation
            ) as response:
                response.raise_for_status()
                result = await response.json()
                
                logger.info(f"Session created successfully: {session_id}")
                return {
                    'success': True,
                    'data': result,
                    'status_code': response.status
                }
                
        except Exception as e:
            logger.error(traceback.format_exc())
            logger.error(f"Error creating session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'status_code': getattr(e, 'status', 500)
            }

    async def call_cloud_run_service(self, payload: Dict[str, Any], max_retries: int = 5, base_delay: float = 2.0) -> Dict[str, Any]:
        """Call the Cloud Run service with the analysis payload, with retry mechanism for transient errors and rate limits."""
        if not CLOUD_RUN_URL:
            raise ValueError("CLOUD_RUN_URL environment variable not set")

        start_time = time.time()

        # First, create the session
        session_result = await self.create_session(
            payload['user_id'],
            payload['session_id']
        )

        if not session_result['success']:
            logger.error(f"Session creation failed: {session_result.get('error', 'Unknown error')}")
            return {
                'success': False,
                'error': f"Failed to create session: {session_result.get('error', 'Unknown error')}",
                'response_time': time.time() - start_time,
                'status_code': session_result.get('status_code', 500)
            }

        # Get authentication token for the main request
        auth_token = self._get_access_token()
        if not auth_token:
            logger.error("Failed to obtain authentication token for main request")
            return {
                'success': False,
                'error': 'Authentication token not available for main request',
                'response_time': time.time() - start_time,
                'status_code': 401
            }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }

        attempt = 0
        while attempt < max_retries:
            try:
                async with self.session.post(
                    f"{CLOUD_RUN_URL}/run_sse",
                    json=payload,
                    headers=headers,
                    timeout=300  # 5 minute timeout
                ) as response:
                    response.raise_for_status()

                    # Handle SSE stream response
                    if response.content_type == 'text/event-stream':
                        events = []
                        full_response = ""
                        async for line in response.content:
                            line = line.decode('utf-8').strip()
                            if line.startswith('data: '):
                                data_content = line[6:]
                                try:
                                    event_data = json.loads(data_content)
                                    events.append(event_data)
                                except json.JSONDecodeError:
                                    full_response += data_content + "\n"
                        if events:
                            last_event = events[-1]
                            result = self._extract_analysis_from_adk_response(last_event)
                        else:
                            result = self._extract_json_from_markdown(full_response)
                    else:
                        response_text = await response.text()
                        try:
                            parsed_response = json.loads(response_text)
                            result = self._extract_analysis_from_adk_response(parsed_response)
                        except json.JSONDecodeError:
                            result = self._extract_json_from_markdown(response_text)

                    end_time = time.time()
                    response_time = end_time - start_time

                    return {
                        'success': True,
                        'data': result,
                        'response_time': response_time,
                        'status_code': response.status,
                        'session_created': True,
                        'events_count': len(events) if response.content_type == 'text/event-stream' and 'events' in locals() else 1,
                        'content_type': response.content_type
                    }

            except asyncio.TimeoutError:
                logger.error(traceback.format_exc())
                logger.error(f"Timeout calling Cloud Run service for payload: {payload['session_id']} (attempt {attempt+1})")
                last_error = 'Timeout'
                last_status = 408
            except aiohttp.ClientResponseError as e:
                logger.error(traceback.format_exc())
                logger.error(f"HTTP error calling Cloud Run service: {e.status} {e.message} (attempt {attempt+1})")
                
                # Retry on 5xx errors and 429 (Rate Limit) errors
                if 500 <= e.status < 600 or e.status == 429:
                    last_error = f"HTTP {e.status}: {e.message}"
                    last_status = e.status
                    
                    # For 429 errors, add extra delay beyond normal exponential backoff
                    if e.status == 429:
                        logger.warning(f"Rate limit hit (429) for {payload['session_id']}, will use extended backoff")
                        # Record the rate limit event for tracking
                        try:
                            await self.record_rate_limit_event(
                                payload.get('session_id', 'unknown').split('_')[1] if '_' in payload.get('session_id', '') else 'unknown',
                                payload['session_id'], 
                                f"HTTP {e.status}: {e.message}"
                            )
                        except Exception as record_error:
                            logger.error(f"Failed to record rate limit event: {record_error}")
                else:
                    return {
                        'success': False,
                        'error': f"HTTP {e.status}: {e.message}",
                        'response_time': time.time() - start_time,
                        'status_code': e.status
                    }
            except Exception as e:
                logger.error(traceback.format_exc())
                logger.error(f"Error calling Cloud Run service: {str(e)} (attempt {attempt+1})")
                last_error = str(e)
                last_status = getattr(e, 'status', 500)

            # If we reach here, we want to retry
            attempt += 1
            if attempt < max_retries:
                # Base exponential backoff
                delay = base_delay * (2 ** (attempt - 1))
                
                # For 429 rate limit errors, use much longer delays
                if last_status == 429:
                    # Progressive delays for rate limiting: 30s, 60s, 120s
                    rate_limit_delays = [30, 60, 120]
                    base_delay = rate_limit_delays[min(attempt - 1, len(rate_limit_delays) - 1)]
                    # Add jitter to prevent thundering herd
                    jitter = random.uniform(0.8, 1.2)
                    delay = int(base_delay * jitter)
                    logger.warning(f"Rate limit detected, using extended delay of {delay}s (attempt {attempt+1} of {max_retries})")
                else:
                    # Add small jitter to regular delays too
                    jitter = random.uniform(0.8, 1.2)
                    delay = delay * jitter
                    logger.info(f"Retrying Cloud Run call in {delay:.1f}s (attempt {attempt+1} of {max_retries})...")
                
                await asyncio.sleep(delay)

        # If all retries failed
        logger.error(f"All retries failed for payload: {payload['session_id']}")
        return {
            'success': False,
            'error': last_error,
            'response_time': time.time() - start_time,
            'status_code': last_status
        }
    
    def _get_access_token(self) -> str:
        """Get access token for Cloud Run authentication with correct audience"""
        try:
            from google.auth import default
            from google.auth.transport.requests import Request
            import google.oauth2.id_token
            
            # For Cloud Run services, we need an identity token, not an access token
            # The audience should be the URL of the Cloud Run service
            if CLOUD_RUN_URL:
                try:
                    # Get identity token with the Cloud Run service URL as audience
                    request = Request()
                    token = google.oauth2.id_token.fetch_id_token(request, CLOUD_RUN_URL)
                    logger.info("Successfully obtained identity token for Cloud Run authentication")
                    return token
                except Exception as id_token_error:
                    logger.warning(f"Failed to get identity token: {id_token_error}")
                    # Fallback to access token method
                    
            # Fallback to access token method (may not work for Cloud Run)
            credentials, _ = default()
            credentials.refresh(Request())
            logger.warning("Using access token instead of identity token - this may cause 401 errors")
            return credentials.token
            
        except Exception as e:
            logger.error(f"Error getting authentication token: {str(e)}")
            logger.error(traceback.format_exc())
            return ""
    
    def _extract_analysis_from_adk_response(self, adk_response: Dict[str, Any]) -> Dict[str, Any]:
        """Extract the actual financial analysis from ADK response structure"""
        try:
            # Check if this is an ADK response with content.parts structure
            if 'content' in adk_response and 'parts' in adk_response['content']:
                parts = adk_response['content']['parts']
                if parts and len(parts) > 0:
                    # Check if we have structured data (from Pydantic model)
                    if 'structured_data' in parts[0]:
                        logger.info("Found structured data in ADK response")
                        analysis_data = parts[0]['structured_data']
                    elif 'text' in parts[0]:
                        # Fallback to text parsing for older responses
                        logger.info("Parsing text-based response from ADK")
                        text_content = parts[0]['text']
                        logger.info(f"Text content length: {len(text_content)} characters")
                        
                        # Log first and last 200 chars to help debug truncation
                        logger.info(f"Text starts with: {text_content[:200]}...")
                        logger.info(f"Text ends with: ...{text_content[-200:]}")
                        
                        analysis_data = self._extract_json_from_markdown(text_content)
                    else:
                        logger.warning("No structured_data or text found in ADK response parts")
                        analysis_data = {"error": "No valid content in ADK response"}
                    
                   
                    # Add metadata from the ADK response
                    result = {
                        'analysis': analysis_data,
                        'usage_metadata': adk_response.get('usageMetadata', {}),
                        'invocation_id': adk_response.get('invocationId'),
                        'author': adk_response.get('author'),
                        'timestamp': adk_response.get('timestamp'),
                        'response_type': 'adk_structured' if 'structured_data' in parts[0] else 'adk_text'
                    }
                    
                    # Log token usage for monitoring
                    usage = adk_response.get('usageMetadata', {})
                    if usage:
                        logger.info(f"Token usage - Prompt: {usage.get('promptTokenCount', 0)}, "
                                  f"Response: {usage.get('candidatesTokenCount', 0)}, "
                                  f"Total: {usage.get('totalTokenCount', 0)}")
                    
                    return result
            
            # If it's not the expected ADK structure, try to extract JSON directly
            logger.info("No ADK structure found, attempting direct JSON extraction")
            return self._extract_json_from_markdown(json.dumps(adk_response))
            
        except Exception as e:
            logger.error(f"Error extracting analysis from ADK response: {e}")
            logger.error(f"ADK response keys: {list(adk_response.keys()) if isinstance(adk_response, dict) else 'Not a dict'}")
            return {
                'error': f'Failed to extract analysis: {str(e)}',
                'raw_response': adk_response,
                'response_type': 'extraction_error'
            }
    
    def _extract_json_from_markdown(self, text: str) -> Dict[str, Any]:
        """Extract JSON from markdown code blocks like ```json {...}``` or ```json [...]```"""
        import re
        
        # First, try to find complete JSON in markdown code blocks
        json_pattern = r'```(?:json)?\s*(\[.*?\]|\{.*?\})\s*```'
        match = re.search(json_pattern, text, re.DOTALL | re.IGNORECASE)
        
        if match:
            json_str = match.group(1)
            # Attempt to fix common JSON syntax errors before parsing
            json_str = self._fix_common_json_errors(json_str)
            try:
                parsed_data = json.loads(json_str)
                # Validate and fix the analysis structure
                return self._validate_and_fix_analysis(parsed_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse extracted JSON from markdown: {e}")
                logger.error(f"JSON string around error: {json_str[max(0, e.pos-100):e.pos+100]}")
        
        # If no markdown blocks found, try to find the largest complete JSON structure
        # Look for array patterns first
        array_matches = list(re.finditer(r'\[', text))
        for start_match in array_matches:
            start_pos = start_match.start()
            # Find the matching closing bracket
            bracket_count = 0
            end_pos = start_pos
            
            for i, char in enumerate(text[start_pos:], start_pos):
                if char == '[':
                    bracket_count += 1
                elif char == ']':
                    bracket_count -= 1
                    if bracket_count == 0:
                        end_pos = i + 1
                        break
            
            if bracket_count == 0:  # Found complete array
                json_str = text[start_pos:end_pos]
                json_str = self._fix_common_json_errors(json_str)
                try:
                    parsed_data = json.loads(json_str)
                    return self._validate_and_fix_analysis(parsed_data)
                except json.JSONDecodeError:
                    continue  # Try next array match
        
        # If arrays didn't work, try objects
        object_matches = list(re.finditer(r'\{', text))
        for start_match in object_matches:
            start_pos = start_match.start()
            # Find the matching closing brace
            brace_count = 0
            end_pos = start_pos
            
            for i, char in enumerate(text[start_pos:], start_pos):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = i + 1
                        break
            
            if brace_count == 0:  # Found complete object
                json_str = text[start_pos:end_pos]
                json_str = self._fix_common_json_errors(json_str)
                try:
                    parsed_data = json.loads(json_str)
                    return self._validate_and_fix_analysis(parsed_data)
                except json.JSONDecodeError:
                    continue  # Try next object match
        
        # If all else fails, try to extract and parse just the first complete JSON structure
        # by looking for common analysis fields
        analysis_pattern = r'(\[[\s\S]*?"overall_analysis"[\s\S]*?\])'
        match = re.search(analysis_pattern, text, re.IGNORECASE)
        
        if match:
            json_str = match.group(1)
            json_str = self._fix_common_json_errors(json_str)
            try:
                parsed_data = json.loads(json_str)
                return self._validate_and_fix_analysis(parsed_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse analysis pattern JSON: {e}")
        
        # Final fallback - return error with truncated content for debugging
        logger.warning(f"No valid JSON found in response, returning truncated content for debugging")
        return {
            "error": "No valid JSON found", 
            "raw_content": text[:2000] + "..." if len(text) > 2000 else text,
            "content_length": len(text)
        }
    
    def _aggressive_json_fix(self, json_str: str) -> str:
        """More aggressive JSON fixing for complex cases"""
        import re
        
        # Handle both array and object JSON structures
        is_array = json_str.strip().startswith('[')
        
        # First, handle truncation issues - if the JSON appears to be cut off
        if not (json_str.strip().endswith(']') if is_array else json_str.strip().endswith('}')):
            logger.warning("JSON appears truncated, attempting to close properly")
            
            # Count open/close brackets or braces to determine how many to add
            if is_array:
                open_count = json_str.count('[')
                close_count = json_str.count(']')
                missing_closes = open_count - close_count
                
                # Also check for unclosed objects within the array
                open_braces = json_str.count('{')
                close_braces = json_str.count('}')
                missing_brace_closes = open_braces - close_braces
                
                # Close any unclosed objects first, then the array
                if missing_brace_closes > 0:
                    json_str += '}' * missing_brace_closes
                if missing_closes > 0:
                    json_str += ']' * missing_closes
            else:
                open_count = json_str.count('{')
                close_count = json_str.count('}')
                missing_closes = open_count - close_count
                if missing_closes > 0:
                    json_str += '}' * missing_closes
        
        # Try to fix the specific error pattern from the log
        # "action": "Accumulate", {"datetime": "High", "price": "1350.00", "volume": "1180.00"}, "time_horizon": ...
        
        # Pattern 1: Fix mixed string-object-string patterns in arrays
        # Replace problematic patterns with valid JSON structure
        json_str = re.sub(
            r'"action":\s*"([^"]+)",\s*\{[^}]*\},\s*"([^"]+)":\s*"([^"]*)',
            r'"action": "\1", "target_data": "parsed", "\2": "\3"',
            json_str
        )
        
        # Pattern 2: Fix standalone objects that appear in wrong context
        json_str = re.sub(
            r',\s*\{\s*"datetime":\s*"([^"]*)",\s*"price":\s*"([^"]*)",\s*"volume":\s*"([^"]*)"\s*\}',
            r', "price_data": {"datetime": "\1", "price": "\2", "volume": "\3"}',
            json_str
        )
        
        # Pattern 3: Fix incomplete strings at the end due to truncation
        # Look for incomplete strings that might have been cut off
        incomplete_string_pattern = r'"([^"]*?)\.\.\.?"?\s*$'
        if re.search(incomplete_string_pattern, json_str):
            # Try to properly close the incomplete string
            json_str = re.sub(incomplete_string_pattern, r'"\1"', json_str)
        
        # Pattern 4: Fix unterminated strings that don't end with quotes
        # Find strings that start with quote but don't end properly
        unterminated_pattern = r'"([^"]*?)(?:\.\.\.|$)(?!["\]\}])'
        json_str = re.sub(unterminated_pattern, r'"\1"', json_str)
        
        # Pattern 5: Remove any trailing content after valid JSON end
        if is_array:
            # Find the last valid ] and truncate after it
            last_bracket = json_str.rfind(']')
            if last_bracket != -1:
                # Check if there's content after the bracket that's not whitespace
                after_bracket = json_str[last_bracket + 1:].strip()
                if after_bracket:
                    logger.warning(f"Removing trailing content after JSON: {after_bracket[:100]}...")
                    json_str = json_str[:last_bracket + 1]
        else:
            # Find the last valid } and truncate after it
            last_brace = json_str.rfind('}')
            if last_brace != -1:
                after_brace = json_str[last_brace + 1:].strip()
                if after_brace:
                    logger.warning(f"Removing trailing content after JSON: {after_brace[:100]}...")
                    json_str = json_str[:last_brace + 1]
        
        # Pattern 6: Fix missing commas between array objects
        if is_array:
            json_str = re.sub(r'}\s*{', r'}, {', json_str)
        
        # Pattern 7: Fix missing quotes around property names
        json_str = re.sub(r'(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_str)
        
        # Pattern 8: Fix trailing commas before closing braces/brackets
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Pattern 9: Fix double commas
        json_str = re.sub(r',,+', ',', json_str)
        
        return json_str
    
    def _validate_and_fix_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and fix analysis data structure"""
        try:
            # Basic validation - ensure we have data
            if not isinstance(data, (dict, list)):
                return {"error": "Analysis data is not a dictionary or list", "raw_data": data}
            
            # Handle new array format: [{"language": "string", "overall_analysis": [...], ...}]
            if isinstance(data, list):
                if len(data) > 0:
                    # Filter out any non-dict items that might have crept in
                    valid_items = [item for item in data if isinstance(item, dict)]
                    
                    if valid_items:
                        analysis_item = valid_items[0]  # Take the first valid analysis item
                        
                        # Validate it has the expected structure
                        expected_keys = ['language', 'overall_analysis', 'technical_analysis', 'fundamental_analysis', 
                                       'sentiment_analysis', 'risk_analysis', 'investment_insights', 'investment_narrative']
                        
                        # Check if this looks like a valid analysis object
                        analysis_keys_found = [key for key in expected_keys if key in analysis_item]
                        
                        if len(analysis_keys_found) >= 3:  # At least 3 expected keys found
                            logger.info(f"Valid analysis structure found with keys: {analysis_keys_found}")
                            return {"analysis": valid_items}  # Return all valid items
                        else:
                            logger.warning(f"Analysis item missing expected keys. Found: {list(analysis_item.keys())}, Expected some of: {expected_keys}")
                            # Try to salvage what we can
                            if any(key in analysis_item for key in ['overall_analysis', 'technical_analysis', 'fundamental_analysis']):
                                logger.info("Found minimal required analysis keys, proceeding")
                                return {"analysis": valid_items}
                            else:
                                return {"error": "Analysis missing critical fields", "found_keys": list(analysis_item.keys()), "raw_data": data}
                    else:
                        return {"error": "Analysis array contains no valid dictionary items", "raw_data": data}
                else:
                    return {"error": "Analysis array is empty", "raw_data": data}
            
            # Handle legacy dictionary format: {"overall_analysis": [...], ...}
            elif isinstance(data, dict):
                # Check for direct error in the data
                if 'error' in data:
                    logger.warning(f"Found error in analysis data: {data.get('error')}")
                    return data  # Return the error as-is
                
                # Check for legacy format keys
                legacy_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis', 
                             'sentiment_analysis', 'risk_analysis', 'investment_insights', 'investment_narrative']
                
                found_legacy_keys = [key for key in legacy_keys if key in data]
                
                if found_legacy_keys:
                    logger.info(f"Converting legacy format to new array format. Found keys: {found_legacy_keys}")
                    # Convert legacy format to new array format
                    converted_data = [{
                        "language": "en",  # Default language
                        **data  # Spread the existing data
                    }]
                    return {"analysis": converted_data}
                
                # If data looks like it's already wrapped (e.g., {"analysis": [...]})
                if 'analysis' in data:
                    if isinstance(data['analysis'], list):
                        # Validate the nested array
                        if len(data['analysis']) > 0:
                            first_item = data['analysis'][0]
                            if isinstance(first_item, dict):
                                expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                                if any(key in first_item for key in expected_keys):
                                    logger.info("Found valid nested analysis array structure")
                                    return data  # Already in correct format
                        
                        logger.warning("Nested analysis array appears invalid or empty")
                        return {"error": "Invalid nested analysis array", "raw_data": data}
                        
                    elif isinstance(data['analysis'], dict):
                        # Convert wrapped dict to array format
                        analysis_dict = data['analysis']
                        expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                        
                        if any(key in analysis_dict for key in expected_keys):
                            converted_data = [{
                                "language": "en",
                                **analysis_dict
                            }]
                            return {"analysis": converted_data}
                        else:
                            return {"error": "Wrapped analysis dict missing expected fields", "raw_data": data}
                
                # If it's some other dict structure, check if it might be a partial response
                if 'raw_content' in data and 'error' in data:
                    # This looks like an error response, check if we can extract anything useful
                    raw_content = data.get('raw_content', '')
                    if isinstance(raw_content, str) and len(raw_content) > 100:
                        # Try to parse the raw content one more time
                        logger.info("Attempting to re-parse raw content from error response")
                        try:
                            # Look for JSON-like structures in the raw content
                            import re
                            
                            # Try to find array patterns with analysis data
                            analysis_pattern = r'\[\s*\{\s*"language":\s*"[^"]*"[\s\S]*?"overall_analysis"[\s\S]*?\]'
                            match = re.search(analysis_pattern, raw_content, re.IGNORECASE)
                            
                            if match:
                                potential_json = match.group(0)
                                # Try basic fixes
                                potential_json = self._fix_common_json_errors(potential_json)
                                try:
                                    reparsed_data = json.loads(potential_json)
                                    if isinstance(reparsed_data, list) and len(reparsed_data) > 0:
                                        logger.info("Successfully reparsed analysis from raw content")
                                        return {"analysis": reparsed_data}
                                except json.JSONDecodeError:
                                    pass
                        except Exception as e:
                            logger.warning(f"Failed to reparse raw content: {e}")
                
                # Final fallback for unknown dict structure
                return {"error": "Unknown dictionary structure", "found_keys": list(data.keys()), "raw_data": data}
            
            return {"error": "Unexpected data type", "raw_data": data}
            
        except Exception as e:
            logger.error(f"Error validating analysis data: {e}")
            return {"error": f"Validation failed: {str(e)}", "raw_data": data}
    
    async def validate_cloud_run_access(self) -> Dict[str, Any]:
        """Validate that we can access the Cloud Run service"""
        try:
            if not CLOUD_RUN_URL:
                return {'valid': False, 'error': 'CLOUD_RUN_URL not set'}
            
            auth_token = self._get_access_token()
            if not auth_token:
                return {'valid': False, 'error': 'No authentication token available'}
            
            headers = {
                'Authorization': f'Bearer {auth_token}'
            }
            
            # Try a simple GET request to the service root
            async with self.session.get(
                CLOUD_RUN_URL,
                headers=headers,
                timeout=10
            ) as response:
                if response.status == 200:
                    return {'valid': True, 'status_code': response.status}
                elif response.status == 401:
                    return {'valid': False, 'error': 'Authentication failed (401)', 'status_code': 401}
                elif response.status == 403:
                    return {'valid': False, 'error': 'Authorization failed (403) - check service account permissions', 'status_code': 403}
                else:
                    return {'valid': True, 'status_code': response.status, 'note': 'Service accessible but returned non-200 status'}
                    
        except Exception as e:
            return {'valid': False, 'error': f'Validation failed: {str(e)}'}
    
    def publish_instagram_promotion(self, ticker: str, promo_reels_tts_text: str, promo_reels_summary: str, hourly_prices: list) -> Dict[str, Any]:
        """Publish message to Pub/Sub for Instagram Reel creation"""
        try:
            if promo_reels_tts_text and promo_reels_summary and hourly_prices:
                pass
            else:
                raise ValueError("Missing required fields for Instagram promotion")
            
            # Prepare message payload
            message_data = {
                "title": ticker.upper(),
                "tts": promo_reels_tts_text,
                "captions": promo_reels_summary,
                "data": hourly_prices
            }
            
            # Publish to Pub/Sub
            topic_path = publisher.topic_path(PROJECT_ID, PUBSUB_TOPIC)
            message_json = json.dumps(message_data)
            message_bytes = message_json.encode('utf-8')
            
            future = publisher.publish(topic_path, message_bytes)
            message_id = future.result()
            
            logger.info(f"Published Instagram promotion for {ticker} to Pub/Sub: message_id={message_id}")
            return {
                'success': True, 
                'promoted': True, 
                'message_id': message_id,
                'topic': PUBSUB_TOPIC
            }
            
        except Exception as e:
            logger.error(f"Error publishing Instagram promotion for {ticker}: {str(e)}")
            logger.error(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    def _fix_common_json_errors(self, json_str: str) -> str:
        """Attempt to fix common JSON syntax errors"""
        import re
        
        # Detect if this is an array or object
        is_array = json_str.strip().startswith('[')
        
        # Fix missing opening brace for object entries like: "datetime": "value", -> {"datetime": "value",
        # This pattern looks for lines that start with a quote but aren't preceded by an opening brace
        json_str = re.sub(r'(\n\s*)"datetime":', r'\1{"datetime":', json_str)
        
        # Fix pattern where an object is missing its opening brace
        # Pattern: }, "key": "value", -> }, {"key": "value",
        json_str = re.sub(r'(,\s*\n\s*)"(\w+)":\s*"([^"]+)",\s*"(\w+)":\s*([^,}\]]+),\s*"(\w+)":\s*([^,}\]]+)', 
                         r'\1{"datetime": "\3", "price": \5, "volume": \7}', json_str)
        
        # More specific fix for the exact pattern seen in the error:
        # }, "datetime": "2025-07-26 00:00", "price": 214.05, "volume": 1171261},
        # Should become:
        # }, {"datetime": "2025-07-26 00:00", "price": 214.05, "volume": 1171261},
        json_str = re.sub(r'},\s*"datetime":\s*"([^"]+)",\s*"price":\s*([^,]+),\s*"volume":\s*([^,}\]]+)', 
                         r', {"datetime": "\1", "price": \2, "volume": \3}', json_str)
        
        # Fix the specific error pattern: "action": "Accumulate", {"datetime": "High", ...
        # This should become: "action": "Accumulate", "target_price": {"datetime": "High", ...
        json_str = re.sub(r'"action":\s*"([^"]+)",\s*\{("datetime":[^}]+)\}', 
                         r'"action": "\1", "target_price": {\2}', json_str)
        
        # Fix malformed objects that have mixed string/object values
        # Pattern: "key": "value", {"key2": "value2"} -> "key": "value", "object_data": {"key2": "value2"}
        json_str = re.sub(r'("[\w_]+"):\s*"([^"]+)",\s*(\{[^}]+\})', 
                         r'\1: "\2", "additional_data": \3', json_str)
        
        # Array-specific fixes
        if is_array:
            # Fix missing commas between array objects
            json_str = re.sub(r'}\s*{', r'}, {', json_str)
            
            # Fix array items that are missing proper object structure
            # Pattern: ["string", "string"] should be valid, but mixed types need fixing
            
        # Fix missing quotes around property names
        json_str = re.sub(r'(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_str)
        
        # Fix trailing commas before closing braces/brackets
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix double commas
        json_str = re.sub(r',,+', ',', json_str)
        
        return json_str
    
    def save_analysis_result(self, ticker: str, result: Dict[str, Any], 
                           raw_analysis_data: ComprehensiveStockDataModel) -> str:
        """Save analysis result to Firestore"""
        analysis_id = f"{ticker}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        analysis_data = result.get('data', {}).get('analysis', {})
        
        # Handle nested structure: {"analysis": [{"language": "en", ...}]}
        if isinstance(analysis_data, dict) and 'analysis' in analysis_data:
            analysis_text = analysis_data['analysis']
        else:
            analysis_text = analysis_data

        # Handle both array and dict formats for analysis data
        if isinstance(analysis_text, list):
            # Array format: [{"language": "en", "overall_analysis": [...], ...}]
            analysis_data_dict = {
                text.get("language", "n/a"): text
                for text in analysis_text if isinstance(text, dict)
            }
        elif isinstance(analysis_text, dict):
            # Dict format: {"language": "en", "overall_analysis": [...], ...}
            language = analysis_text.get("language", "n/a")
            analysis_data_dict = {language: analysis_text}
        else:
            # Fallback for unexpected formats
            analysis_data_dict = {"unknown": analysis_text}

        analysis_doc = {
            'ticker': ticker.upper(),
            'timestamp': datetime.now(timezone.utc),
            'analysis_data': analysis_data_dict,
            'success': result.get('success', False),
            'error': result.get('error'),
            'day': self.day_input,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        try:
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").set({
                'ticker': ticker.upper(),
                "name": raw_analysis_data.company_data.overview.Name,
                "description": raw_analysis_data.company_data.overview.Description,
                "industry": raw_analysis_data.company_data.overview.Industry,
                "link": raw_analysis_data.company_data.overview.OfficialSite,
                'timestamp': datetime.now(timezone.utc),
                'day': self.day_input,
                'created_at': datetime.now(timezone.utc),
            })
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("analysis_overview").set(analysis_doc)
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("income_statement_data").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.income_statement_data]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("daily_prices").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.daily_prices]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("dividend_data").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.dividend_data]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("earnings_estimates").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.earnings_estimates]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("monthly_prices").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.monthly_prices]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("hourly_prices").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.hourly_prices]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("balance_sheet_data").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.balance_sheet_data]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("weekly_prices").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.weekly_prices]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("news_sentiment").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.news_sentiment]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("splits_data").set({"data": [item.model_dump() for item in raw_analysis_data.company_data.splits_data]})
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("company_overview").set(raw_analysis_data.company_data.overview.model_dump())
            self.db.collection(ANALYSIS_COLLECTION).document(f"{ticker}-{self.day_input}").collection("data").document("technical_analysis_results").set(raw_analysis_data.technical_analysis_results.model_dump())
            logger.info(f"Saved analysis result to Firestore: {analysis_id}")
            return analysis_id
        except Exception as e:
            logger.error(f"Error saving analysis result: {str(e)}")
            raise
    
    def save_performance_metrics(self, ticker: str, metrics: Dict[str, Any], 
                                session_id: str) -> str:
        """Save performance metrics to Firestore"""
        doc_id = f"{ticker}_perf_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        
        performance_doc = {
            'ticker': ticker.upper(),
            'session_id': session_id,
            'response_time': metrics.get('response_time', 0),
            'status_code': metrics.get('status_code', 0),
            'success': metrics.get('success', False),
            'error': metrics.get('error'),
            'timestamp': datetime.now(timezone.utc),
            'function_execution_time': metrics.get('function_execution_time', 0),
            'memory_usage': metrics.get('memory_usage', 0),
            'created_at': datetime.now(timezone.utc)
        }
        
        try:
            self.db.collection(PERFORMANCE_COLLECTION).document(doc_id).set(performance_doc)
            logger.info(f"Saved performance metrics to Firestore: {doc_id}")
            return doc_id
        except Exception as e:
            logger.error(f"Error saving performance metrics: {str(e)}")
            raise
    
    def save_metadata(self, ticker: str, payload: Dict[str, Any], 
                     result_doc_id: str, session_id: str) -> str:
        """Save analysis metadata to Firestore"""
        doc_id = f"{ticker}_meta_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        
        metadata_doc = {
            'ticker': ticker.upper(),
            'session_id': session_id,
            'result_document_id': result_doc_id,
            'user_id': payload.get('user_id'),
            'app_name': payload.get('app_name'),
            'prompt_length': len(payload['new_message']['parts'][0]['text']),
            'analysis_type': 'daily_financial_analysis',
            'trigger_type': 'cloud_function',
            'cloud_run_url': CLOUD_RUN_URL,
            'timestamp': datetime.now(timezone.utc),
            'created_at': datetime.now(timezone.utc)
        }
        
        try:
            self.db.collection(METADATA_COLLECTION).document(doc_id).set(metadata_doc)
            logger.info(f"Saved metadata to Firestore: {doc_id}")
            return doc_id
        except Exception as e:
            logger.error(f"Error saving metadata: {str(e)}")
            raise
    
    def save_cost_tracking(self, ticker: str, metrics: Dict[str, Any], 
                          session_id: str) -> str:
        """Save cost tracking information to Firestore"""
        doc_id = f"{ticker}_cost_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        
        # Estimate costs based on usage
        estimated_cost = self._estimate_costs(metrics)
        
        cost_doc = {
            'ticker': ticker.upper(),
            'session_id': session_id,
            'estimated_cloud_run_cost': estimated_cost.get('cloud_run', 0),
            'estimated_gemini_cost': estimated_cost.get('gemini', 0),
            'estimated_firestore_cost': estimated_cost.get('firestore', 0),
            'total_estimated_cost': estimated_cost.get('total', 0),
            'response_time': metrics.get('response_time', 0),
            'function_execution_time': metrics.get('function_execution_time', 0),
            'prompt_tokens': estimated_cost.get('prompt_tokens', 0),
            'response_tokens': estimated_cost.get('response_tokens', 0),
            'timestamp': datetime.now(timezone.utc),
            'created_at': datetime.now(timezone.utc)
        }
        
        try:
            self.db.collection(COSTS_COLLECTION).document(doc_id).set(cost_doc)
            logger.info(f"Saved cost tracking to Firestore: {doc_id}")
            return doc_id
        except Exception as e:
            logger.error(f"Error saving cost tracking: {str(e)}")
            raise
    
    def _estimate_costs(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """Estimate costs based on usage metrics"""
        # These are rough estimates - adjust based on actual pricing
        
        # Cloud Run costs (per 100ms, per GB RAM)
        execution_time_100ms = metrics.get('response_time', 0) / 0.1
        cloud_run_cost = execution_time_100ms * 0.0000024  # Approximate Cloud Run pricing
        
        # Gemini API costs (estimated based on prompt/response length)
        prompt_tokens = metrics.get('prompt_tokens', 1000)  # Estimate
        response_tokens = metrics.get('response_tokens', 2000)  # Estimate
        gemini_cost = (prompt_tokens / 1000 * 0.0003) + (response_tokens / 1000 * 0.0003)
        
        # Firestore costs (writes and reads)
        firestore_cost = 4 * 0.00000018  # 4 document writes
        
        total_cost = cloud_run_cost + gemini_cost + firestore_cost
        
        return {
            'cloud_run': round(cloud_run_cost, 6),
            'gemini': round(gemini_cost, 6),
            'firestore': round(firestore_cost, 6),
            'total': round(total_cost, 6),
            'prompt_tokens': prompt_tokens,
            'response_tokens': response_tokens
        }
    
    async def check_recent_rate_limits(self) -> Dict[str, Any]:
        """Check for recent rate limiting events and return delay recommendation"""
        try:
            # Look for recent 429 errors in the last 10 minutes
            ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
            
            # Query performance metrics for recent 429 errors
            rate_limit_query = self.db.collection(PERFORMANCE_COLLECTION).where(
                'status_code', '==', 429
            ).where(
                'timestamp', '>=', ten_minutes_ago
            ).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(5)
            
            recent_rate_limits = list(rate_limit_query.stream())
            
            if not recent_rate_limits:
                return {'should_delay': False, 'delay_seconds': 0}
            
            # Count recent rate limits
            rate_limit_count = len(recent_rate_limits)
            latest_rate_limit = recent_rate_limits[0].to_dict()
            latest_timestamp = latest_rate_limit['timestamp']
            
            # Calculate time since last rate limit
            time_since_last = datetime.now(timezone.utc) - latest_timestamp
            minutes_since = time_since_last.total_seconds() / 60
            
            logger.warning(f"Found {rate_limit_count} recent rate limits, latest was {minutes_since:.1f} minutes ago")
            
            # Progressive backoff based on recent rate limit frequency
            if rate_limit_count >= 3 and minutes_since < 5:
                # Multiple recent rate limits, wait longer
                base_delay = 180  # 3 minutes
            elif rate_limit_count >= 2 and minutes_since < 3:
                # Some recent rate limits, moderate delay
                base_delay = 60   # 1 minute
            elif minutes_since < 2:
                # Very recent rate limit, short delay
                base_delay = 30   # 30 seconds
            else:
                # Old enough, proceed with minimal delay
                base_delay = 10   # 10 seconds
            
            # Add jitter to prevent thundering herd (±20% random variation)
            jitter = random.uniform(0.8, 1.2)
            delay_seconds = int(base_delay * jitter)
            
            return {
                'should_delay': True,
                'delay_seconds': delay_seconds,
                'recent_count': rate_limit_count,
                'minutes_since_last': minutes_since
            }
            
        except Exception as e:
            logger.warning(f"Error checking recent rate limits: {e}")
            # If we can't check, be conservative and add a small delay
            return {'should_delay': True, 'delay_seconds': 15}

    async def record_rate_limit_event(self, ticker: str, session_id: str, error_details: str) -> None:
        """Record a rate limit event for tracking and analysis"""
        try:
            doc_id = f"rate_limit_{ticker}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
            
            rate_limit_doc = {
                'ticker': ticker.upper(),
                'session_id': session_id,
                'error_details': error_details,
                'timestamp': datetime.now(timezone.utc),
                'event_type': 'rate_limit_429',
                'created_at': datetime.now(timezone.utc)
            }
            
            # Store in a dedicated collection for rate limit tracking
            self.db.collection('rate_limit_events').document(doc_id).set(rate_limit_doc)
            logger.warning(f"Recorded rate limit event: {doc_id}")
            
        except Exception as e:
            logger.error(f"Error recording rate limit event: {e}")

    async def check_circuit_breaker(self) -> Dict[str, Any]:
        """Check if we should temporarily stop processing due to excessive rate limits"""
        try:
            # Look for rate limit events in the last 30 minutes
            thirty_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=30)
            
            # Query rate limit events
            circuit_query = self.db.collection('rate_limit_events').where(
                'timestamp', '>=', thirty_minutes_ago
            ).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10)
            
            recent_events = list(circuit_query.stream())
            
            if len(recent_events) >= 5:
                # Too many rate limits in 30 minutes - activate circuit breaker
                latest_event = recent_events[0].to_dict()
                time_since_latest = datetime.now(timezone.utc) - latest_event['timestamp']
                minutes_since = time_since_latest.total_seconds() / 60
                
                # Circuit breaker: wait at least 15 minutes after latest rate limit
                if minutes_since < 15:
                    return {
                        'circuit_open': True,
                        'wait_minutes': 15 - minutes_since,
                        'recent_rate_limits': len(recent_events)
                    }
            
            return {'circuit_open': False}
            
        except Exception as e:
            logger.warning(f"Error checking circuit breaker: {e}")
            return {'circuit_open': False}

async def process_financial_analysis(ticker: str, day_input: str = None, user_id: str = "cloud_function") -> Dict[str, Any]:
    """Main function to process financial analysis"""
    function_start_time = time.time()
    
    async with FinancialAnalysisTrigger() as analyzer:
        try:
            # Check circuit breaker status
            circuit_status = await analyzer.check_circuit_breaker()
            if circuit_status['circuit_open']:
                wait_minutes = circuit_status['wait_minutes']
                logger.error(f"Circuit breaker active for {ticker} - too many recent rate limits. Wait {wait_minutes:.1f} more minutes.")
                return {
                    'success': False,
                    'ticker': ticker,
                    'error': f'Circuit breaker active - too many rate limits. Try again in {wait_minutes:.1f} minutes.',
                    'execution_time': time.time() - function_start_time,
                    'circuit_breaker': True
                }
            
            # Check for recent rate limiting before proceeding
            rate_limit_check = await analyzer.check_recent_rate_limits()
            if rate_limit_check['should_delay']:
                delay_seconds = rate_limit_check['delay_seconds']
                logger.warning(f"Recent rate limits detected, delaying analysis for {ticker} by {delay_seconds}s")
                await asyncio.sleep(delay_seconds)
            
            # Check circuit breaker status
            circuit_status = await analyzer.check_circuit_breaker()
            if circuit_status['circuit_open']:
                wait_minutes = circuit_status['wait_minutes']
                logger.warning(f"Circuit breaker active for {ticker}, waiting {wait_minutes} minutes")
                await asyncio.sleep(wait_minutes * 60)  # Convert to seconds
            
            # Generate payload
            if day_input:
                analyzer.day_input = day_input
            
            # Validate Cloud Run access before proceeding
            logger.info(f"Validating Cloud Run access for {ticker}...")
            access_validation = await analyzer.validate_cloud_run_access()
            if not access_validation['valid']:
                error_msg = access_validation['error']
                status_code = access_validation.get('status_code', 500)
                logger.error(f"Cloud Run access validation failed for {ticker}: {error_msg}")
                return {
                    'success': False,
                    'ticker': ticker,
                    'error': f'Cloud Run authentication failed: {error_msg}',
                    'execution_time': time.time() - function_start_time,
                    'status_code': status_code,
                    'validation_failed': True
                }
            else:
                logger.info(f"Cloud Run access validated successfully for {ticker}")
            

            raw_analysis_data = await get_stock_data_tool.analyze_symbol(ticker)

            payload = analyzer.generate_analysis_payload(raw_analysis_data)
            session_id = payload['session_id']

            logger.info(f"Starting financial analysis for {ticker} with session {session_id}")

            # Call Cloud Run service
            result = await analyzer.call_cloud_run_service(payload)

            print("Retrieved response from LLM Agent:", result)

            # Calculate total function execution time
            function_execution_time = time.time() - function_start_time
            result['function_execution_time'] = function_execution_time

            # --- VALIDATION LOGIC ---
            analysis_data = result.get('data', {})
            error_detected = False
            error_message = None

            logger.info(f"Validating analysis data for {ticker}: type={type(analysis_data)}, keys={list(analysis_data.keys()) if isinstance(analysis_data, dict) else 'N/A'}")

            # DEBUG: Log the full analysis data structure for troubleshooting
            logger.error(f"DEBUG - Full analysis_data for {ticker}: {json.dumps(analysis_data, indent=2, default=str)[:2000]}...")  # Truncate to avoid huge logs

            # Check for error in result
            if not result.get('success'):
                error_detected = True
                error_message = result.get('error', 'Unknown error')
            elif not analysis_data:
                error_detected = True
                error_message = 'No analysis data returned'
            else:
                # Check for errors in the analysis data structure
                if isinstance(analysis_data, dict):
                    # Check for direct error in analysis_data
                    if 'error' in analysis_data:
                        error_detected = True
                        error_message = analysis_data.get('error')
                    else:
                        # Check for analysis array structure
                        analysis_content = analysis_data.get('analysis', [])
                        logger.info(f"Analysis content for {ticker}: type={type(analysis_content)}, length={len(analysis_content) if isinstance(analysis_content, list) else 'N/A'}")
                        
                        # DEBUG: Log the analysis content structure
                        logger.error(f"DEBUG - Analysis content for {ticker}: {json.dumps(analysis_content, indent=2, default=str)[:1500]}...")  # Truncate to avoid huge logs
                        
                        if isinstance(analysis_content, list):
                            if len(analysis_content) == 0:
                                error_detected = True
                                error_message = 'Analysis array is empty'
                            else:
                                # Check first analysis item for errors
                                first_analysis = analysis_content[0]
                                logger.info(f"First analysis item for {ticker}: type={type(first_analysis)}, keys={list(first_analysis.keys()) if isinstance(first_analysis, dict) else 'N/A'}")
                                
                                # DEBUG: Log the first analysis item structure
                                logger.error(f"DEBUG - First analysis item for {ticker}: {json.dumps(first_analysis, indent=2, default=str)[:1000]}...")  # Truncate to avoid huge logs
                                
                                if isinstance(first_analysis, dict):
                                    if 'error' in first_analysis:
                                        error_detected = True
                                        error_message = first_analysis.get('error')
                                    else:
                                        # Validate that we have the expected structure
                                        expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                                        found_keys = [key for key in expected_keys if key in first_analysis]
                                        logger.error(f"DEBUG - Expected keys check for {ticker}: expected={expected_keys}, found={found_keys}, all_keys={list(first_analysis.keys())}")
                                        
                                        if not any(key in first_analysis for key in expected_keys):
                                            error_detected = True
                                            error_message = 'Analysis missing required fields'
                                        else:
                                            logger.info(f"Analysis validation passed for {ticker}")
                                else:
                                    error_detected = True
                                    error_message = 'Analysis item is not a valid object'
                        elif isinstance(analysis_content, dict):
                            # Handle case where analysis_content is a dict
                            logger.error(f"DEBUG - Dict analysis content for {ticker}: {json.dumps(analysis_content, indent=2, default=str)[:1000]}...")  # Truncate to avoid huge logs
                            
                            if 'error' in analysis_content:
                                error_detected = True
                                error_message = analysis_content.get('error')
                            else:
                                # Check if this dict has a nested 'analysis' key with an array
                                if 'analysis' in analysis_content and isinstance(analysis_content['analysis'], list):
                                    # Handle nested structure: {"analysis": [{"language": "en", "overall_analysis": [...], ...}]}
                                    nested_analysis_array = analysis_content['analysis']
                                    if len(nested_analysis_array) == 0:
                                        error_detected = True
                                        error_message = 'Nested analysis array is empty'
                                    else:
                                        first_nested_analysis = nested_analysis_array[0]
                                        logger.error(f"DEBUG - First nested analysis item for {ticker}: {json.dumps(first_nested_analysis, indent=2, default=str)[:1000]}...")
                                        
                                        if isinstance(first_nested_analysis, dict):
                                            if 'error' in first_nested_analysis:
                                                error_detected = True
                                                error_message = first_nested_analysis.get('error')
                                            else:
                                                # Validate that we have the expected structure
                                                expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                                                found_keys = [key for key in expected_keys if key in first_nested_analysis]
                                                logger.error(f"DEBUG - Expected keys check for {ticker} (nested dict): expected={expected_keys}, found={found_keys}, all_keys={list(first_nested_analysis.keys())}")
                                                
                                                if not any(key in first_nested_analysis for key in expected_keys):
                                                    error_detected = True
                                                    error_message = 'Nested analysis missing required fields'
                                                else:
                                                    logger.info(f"Analysis validation passed for {ticker} (nested dict format)")
                                        else:
                                            error_detected = True
                                            error_message = 'Nested analysis item is not a valid object'
                                else:
                                    # Check if this is a direct analysis object (legacy format)
                                    expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                                    found_keys = [key for key in expected_keys if key in analysis_content]
                                    logger.error(f"DEBUG - Expected keys check for {ticker} (direct dict): expected={expected_keys}, found={found_keys}, all_keys={list(analysis_content.keys())}")
                                    
                                    if not any(key in analysis_content for key in expected_keys):
                                        error_detected = True
                                        error_message = 'Analysis missing required fields'
                                    else:
                                        logger.info(f"Analysis validation passed for {ticker} (direct dict format)")
                        else:
                            # analysis_content is neither a list nor a dict
                            error_detected = True
                            error_message = f'Analysis content has unexpected type: {type(analysis_content)}'
                else:
                    error_detected = True
                    error_message = f'Analysis data is not a dictionary: {type(analysis_data)}'

            # Save analysis result with correct success/error
            result_to_save = dict(result)
            if error_detected:
                logger.error(f"Analysis for {ticker} failed or invalid: {error_message}")
                result_to_save['success'] = False
                result_to_save['error'] = error_message
                # Optionally, trigger a retry or alert here (log for now)
                logger.warning(f"Analysis for {ticker} will be retried or flagged for review.")
            else:
                result_to_save['success'] = True
                result_to_save['error'] = None
                

            # Save analysis result
            result_doc_id = analyzer.save_analysis_result(ticker, result_to_save, raw_analysis_data)
            # Save performance metrics
            analyzer.save_performance_metrics(ticker, result_to_save, session_id)
            # Save metadata
            analyzer.save_metadata(ticker, payload, result_doc_id, session_id)
            # Save cost tracking
            analyzer.save_cost_tracking(ticker, result_to_save, session_id)

            # Check for Instagram promotion flag and publish to Pub/Sub if needed
            promotion_result = {'promoted': False}
            try:
                if str(result_to_save.get('data', {}).get('analysis', {}).get("en", {}).get("promote_flag")).lower() == 'true':
                    # Get hourly prices for the promotion
                    hourly_prices = [item.model_dump() for item in raw_analysis_data.company_data.hourly_prices]
                    promotion_result = analyzer.publish_instagram_promotion(
                        ticker, 
                        result_to_save.get('data', {}).get('analysis', {}).get("en", {}).get("promo_reels_tts_text"),
                        result_to_save.get('data', {}).get('analysis', {}).get("en", {}).get("promo_reels_summary"),
                        hourly_prices
                    )
                    
                    if promotion_result.get('promoted'):
                        logger.info(f"Instagram promotion triggered for {ticker}")
                    else:
                        logger.info(f"No Instagram promotion for {ticker}: {promotion_result.get('reason', 'Unknown')}")
                        
            except Exception as e:
                logger.error(f"Error handling Instagram promotion for {ticker}: {str(e)}")
                promotion_result = {'promoted': False, 'error': str(e)}

            logger.info(f"Completed financial analysis for {ticker}")

            return {
                'success': not error_detected,
                'ticker': ticker,
                'session_id': session_id,
                'result_document_id': result_doc_id,
                'execution_time': function_execution_time,
                'analysis_success': not error_detected,
                'promotion': promotion_result
            }

        except Exception as e:
            logger.error(traceback.format_exc())
            logger.error(f"Error in process_financial_analysis for {ticker}: {str(e)}")
            return {
                'success': False,
                'ticker': ticker,
                'error': str(e),
                'execution_time': time.time() - function_start_time
            }

@functions_framework.http
def content_trigger_function(request):
    """HTTP Cloud Function entry point for financial analysis"""
    try:
        # Parse request
        request_json = request.get_json(silent=True)
        
        if not request_json:
            return {'error': 'No JSON payload provided'}, 400
        
        ticker = request_json.get('ticker')
        user_id = request_json.get('user_id', 'cloud_function')
        day_input = request_json.get("day_input")
        
        if not ticker:
            return {'error': 'ticker parameter is required'}, 400
        
        # Run async function
        result = asyncio.run(process_financial_analysis(ticker, day_input, user_id))
        
        if result['success']:
            return result, 200
        else:
            return result, 500
            
    except Exception as e:
        logger.error(f"Error in content_trigger_function: {str(e)}")
        return {'error': str(e), 'success': False}, 500

if __name__ == "__main__":
    # For local testing
    import asyncio
    
    async def test_local():
        result = await process_financial_analysis("AAPL", "test_user")
        print(json.dumps(result, indent=2, default=str))
    
    asyncio.run(test_local())

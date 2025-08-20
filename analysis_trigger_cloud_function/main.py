"""
Google Cloud Function to trigger financial analysis and save results to Firestore
"""

import os
import json
import time
import logging
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import asyncio
import aiohttp
from google.cloud import firestore
from google.cloud import functions_v1
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

# Firestore collections
ANALYSIS_COLLECTION = 'financial_analysis'
PERFORMANCE_COLLECTION = 'performance_metrics'
METADATA_COLLECTION = 'analysis_metadata'
COSTS_COLLECTION = 'cost_tracking'

# Initialize Firestore client
db = firestore.Client(project=PROJECT_ID)

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
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self._get_access_token()}'
        }
        
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

    async def call_cloud_run_service(self, payload: Dict[str, Any], max_retries: int = 3, base_delay: float = 1.0) -> Dict[str, Any]:
        """Call the Cloud Run service with the analysis payload, with retry mechanism for transient errors."""
        if not CLOUD_RUN_URL:
            raise ValueError("CLOUD_RUN_URL environment variable not set")

        start_time = time.time()

        # First, create the session
        session_result = await self.create_session(
            payload['user_id'],
            payload['session_id']
        )

        if not session_result['success']:
            logger.error("Session success FALSE, creation failed.")
            return {
                'success': False,
                'error': f"Failed to create session: {session_result.get('error', 'Unknown error')}",
                'response_time': time.time() - start_time,
                'status_code': session_result.get('status_code', 500)
            }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self._get_access_token()}'
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
                # Retry only on 5xx errors
                if 500 <= e.status < 600:
                    last_error = f"HTTP {e.status}: {e.message}"
                    last_status = e.status
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
                delay = base_delay * (2 ** (attempt - 1))
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
        """Get access token for Cloud Run authentication"""
        try:
            from google.auth import default
            from google.auth.transport.requests import Request
            
            credentials, _ = default()
            credentials.refresh(Request())
            return credentials.token
        except Exception as e:
            logger.error(f"Error getting access token: {str(e)}")
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
                        markdown_text = parts[0]['text']
                        analysis_data = self._extract_json_from_markdown(markdown_text)
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
                    
                    return result
            
            # If it's not the expected ADK structure, try to extract JSON directly
            return self._extract_json_from_markdown(json.dumps(adk_response))
            
        except Exception as e:
            logger.error(f"Error extracting analysis from ADK response: {e}")
            return {
                'error': f'Failed to extract analysis: {str(e)}',
                'raw_response': adk_response,
                'response_type': 'extraction_error'
            }
    
    def _extract_json_from_markdown(self, text: str) -> Dict[str, Any]:
        """Extract JSON from markdown code blocks like ```json {...}``` or ```json [...]```"""
        import re
        
        # Try to find JSON in markdown code blocks (both objects and arrays)
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
                logger.error(f"Failed to parse extracted JSON: {e}")
                logger.error(f"JSON string around error: {json_str[max(0, e.pos-100):e.pos+100]}")
                # Try more aggressive fixes
                fixed_json = self._aggressive_json_fix(json_str)
                try:
                    parsed_data = json.loads(fixed_json)
                    return self._validate_and_fix_analysis(parsed_data)
                except json.JSONDecodeError as e2:
                    logger.error(f"Even aggressive fix failed: {e2}")
                    return {"error": "Failed to parse JSON from markdown", "raw_content": text}
        
        # If no markdown blocks found, try to find raw JSON (arrays or objects)
        # First try arrays
        array_pattern = r'\[.*?\]'
        match = re.search(array_pattern, text, re.DOTALL)
        
        if match:
            json_str = match.group(0)
            json_str = self._fix_common_json_errors(json_str)
            try:
                parsed_data = json.loads(json_str)
                return self._validate_and_fix_analysis(parsed_data)
            except json.JSONDecodeError:
                pass  # Continue to try object pattern
        
        # Then try objects
        object_pattern = r'\{.*\}'
        match = re.search(object_pattern, text, re.DOTALL)
        
        if match:
            json_str = match.group(0)
            # Attempt to fix common JSON syntax errors before parsing
            json_str = self._fix_common_json_errors(json_str)
            try:
                parsed_data = json.loads(json_str)
                # Validate with our new structure
                return self._validate_and_fix_analysis(parsed_data)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse raw JSON: {e}")
                logger.error(f"JSON string around error: {json_str[max(0, e.pos-100):e.pos+100]}")
                # Try more aggressive fixes
                fixed_json = self._aggressive_json_fix(json_str)
                try:
                    parsed_data = json.loads(fixed_json)
                    return self._validate_and_fix_analysis(parsed_data)
                except json.JSONDecodeError as e2:
                    logger.error(f"Even aggressive fix failed: {e2}")
                    return {"error": "Failed to parse raw JSON", "raw_content": text}
        
        # If no JSON found, return the raw content
        logger.warning(f"No JSON found in response, returning raw content")
        return {"error": "No JSON found", "raw_content": text}
    
    def _aggressive_json_fix(self, json_str: str) -> str:
        """More aggressive JSON fixing for complex cases"""
        import re
        
        # Handle both array and object JSON structures
        is_array = json_str.strip().startswith('[')
        
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
        
        # Pattern 3: Fix incomplete strings at the end
        # If we have an incomplete string at the end, try to close it
        if json_str.rstrip().endswith('"'):
            # Already ends with quote
            pass
        elif re.search(r'"[^"]*$', json_str):
            # Incomplete string at end
            json_str = re.sub(r'"([^"]*$)', r'"\1"', json_str)
        
        # Pattern 4: Ensure proper closing of objects/arrays
        open_braces = json_str.count('{')
        close_braces = json_str.count('}')
        open_brackets = json_str.count('[')
        close_brackets = json_str.count(']')
        
        # Add missing closing braces/brackets
        if open_braces > close_braces:
            json_str += '}' * (open_braces - close_braces)
        if open_brackets > close_brackets:
            json_str += ']' * (open_brackets - close_brackets)
        
        # Pattern 5: Fix common array issues
        if is_array:
            # Ensure proper array structure for analysis data
            # Fix cases where array items are missing commas
            json_str = re.sub(r'}\s*{', r'}, {', json_str)
            
            # Fix cases where the array is not properly closed
            if not json_str.strip().endswith(']'):
                json_str = json_str.rstrip() + ']'
        
        return json_str
    
    def _validate_and_fix_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and fix analysis data structure"""
        try:
            # Basic validation - ensure we have data
            if not isinstance(data, (dict, list)):
                return {"error": "Analysis data is not a dictionary or list", "raw_data": data}
            
            # Handle new array format: [{"language": "string", "overall_analysis": [...], ...}]
            if isinstance(data, list):
                if len(data) > 0 and isinstance(data[0], dict):
                    analysis_item = data[0]  # Take the first analysis item
                    # Validate it has the expected structure
                    expected_keys = ['language', 'overall_analysis', 'technical_analysis', 'fundamental_analysis', 
                                   'sentiment_analysis', 'risk_analysis', 'investment_recommendations', 'investment_narrative']
                    if any(key in analysis_item for key in expected_keys):
                        return {"analysis": data}  # Wrap in analysis key for consistency
                else:
                    return {"error": "Analysis array is empty or contains invalid items", "raw_data": data}
            
            # Handle legacy dictionary format: {"overall_analysis": [...], ...}
            elif isinstance(data, dict):
                # Check for legacy format keys
                legacy_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis', 
                             'sentiment_analysis', 'risk_analysis', 'investment_recommendations', 'investment_narrative']
                if any(key in data for key in legacy_keys):
                    # Convert legacy format to new array format
                    converted_data = [{
                        "language": "en",  # Default language
                        **data  # Spread the existing data
                    }]
                    return {"analysis": converted_data}
                
                # If data looks like it's already wrapped (e.g., {"analysis": [...]})
                if 'analysis' in data:
                    if isinstance(data['analysis'], list):
                        return data  # Already in correct format
                    elif isinstance(data['analysis'], dict):
                        # Convert wrapped dict to array format
                        converted_data = [{
                            "language": "en",
                            **data['analysis']
                        }]
                        return {"analysis": converted_data}
                
                # If it's some other dict structure, return as-is for debugging
                return {"analysis": [{"language": "en", "error": "Unknown data structure", "raw_data": data}]}
            
            return {"error": "Unexpected data type", "raw_data": data}
            
        except Exception as e:
            logger.error(f"Error validating analysis data: {e}")
            return {"error": f"Validation failed: {str(e)}", "raw_data": data}
    
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
        analysis_text = result.get('data', {}).get('analysis', [])

        analysis_doc = {
            'ticker': ticker.upper(),
            'timestamp': datetime.now(timezone.utc),
            'analysis_data': {
                text.get("language", "n/a"): text
                for text in analysis_text if isinstance(text, dict)
            },
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

async def process_financial_analysis(ticker: str, day_input: str = None, user_id: str = "cloud_function") -> Dict[str, Any]:
    """Main function to process financial analysis"""
    function_start_time = time.time()
    
    async with FinancialAnalysisTrigger() as analyzer:
        try:
            # Generate payload
            if day_input:
                analyzer.day_input = day_input
            

            raw_analysis_data = await get_stock_data_tool.analyze_symbol(ticker)

            payload = analyzer.generate_analysis_payload(raw_analysis_data)
            session_id = payload['session_id']

            logger.info(f"Starting financial analysis for {ticker} with session {session_id}")

            # Call Cloud Run service
            result = await analyzer.call_cloud_run_service(payload)

            # Calculate total function execution time
            function_execution_time = time.time() - function_start_time
            result['function_execution_time'] = function_execution_time

            # --- VALIDATION LOGIC ---
            analysis_data = result.get('data', {})
            error_detected = False
            error_message = None

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
                        if isinstance(analysis_content, list):
                            if len(analysis_content) == 0:
                                error_detected = True
                                error_message = 'Analysis array is empty'
                            else:
                                # Check first analysis item for errors
                                first_analysis = analysis_content[0]
                                if isinstance(first_analysis, dict):
                                    if 'error' in first_analysis:
                                        error_detected = True
                                        error_message = first_analysis.get('error')
                                    else:
                                        # Validate that we have the expected structure
                                        expected_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                                        if not any(key in first_analysis for key in expected_keys):
                                            error_detected = True
                                            error_message = 'Analysis missing required fields'
                                else:
                                    error_detected = True
                                    error_message = 'Analysis item is not a valid object'
                        elif isinstance(analysis_content, dict) and 'error' in analysis_content:
                            error_detected = True
                            error_message = analysis_content.get('error')
                        else:
                            # Some other structure, check if it looks like legacy format
                            legacy_keys = ['overall_analysis', 'technical_analysis', 'fundamental_analysis']
                            if not any(key in analysis_data for key in legacy_keys):
                                error_detected = True
                                error_message = 'Analysis data structure is invalid or incomplete'

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

            logger.info(f"Completed financial analysis for {ticker}")

            return {
                'success': not error_detected,
                'ticker': ticker,
                'session_id': session_id,
                'result_document_id': result_doc_id,
                'execution_time': function_execution_time,
                'analysis_success': not error_detected
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

#!/usr/bin/env python3
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ADK Analysis Reporter Agent")

# Try to import the agent
try:
    from analysis_reporter.agent import root_agent
    logger.info("Successfully imported root_agent")
except ImportError as e:
    logger.error(f"Failed to import root_agent: {e}")
    root_agent = None

class InvokeRequest(BaseModel):
    prompt: str
    data: Dict[str, Any] = {}

@app.post("/invoke")
async def invoke_agent(request: InvokeRequest):
    if root_agent is None:
        raise HTTPException(status_code=500, detail="Agent not available")
    
    try:
        # Basic invocation - may need adjustment based on actual ADK API
        if hasattr(root_agent, "invoke"):
            result = root_agent.invoke(request.dict())
        else:
            # Alternative method if invoke is not available
            result = {"message": "Agent loaded but invoke method not found"}
        return result
    except Exception as e:
        logger.error(f"Error invoking agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "agent": "analysis_reporter",
        "agent_available": root_agent is not None
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

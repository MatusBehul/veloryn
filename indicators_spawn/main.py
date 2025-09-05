import functions_framework
from google.cloud import pubsub_v1
import os
import json

# Configuration: list of tickers to process
TICKERS = [
    "AAPL", "MSFT", "GOOG", "AMZN", "TSLA",
    "NVDA", "META", "BRK.B", "UNH", "V", "JNJ",
    "WMT", "JPM", "PG", "MA", "HD", "BAC", "DIS",
    "XOM", "VZ", "ADBE", "NFLX", "PYPL", "CMCSA",
    "PFE", "KO", "T", "PEP", "CSCO", "NKE",
    "MRK", "ABT", "CVX", "INTC", "CRM", "WFC",
    "ACN", "COST", "MCD", "DHR", "MDT", "TXN",
    "NEE", "LIN", "BMY", "UNP", "LOW", "QCOM",
    "AMGN", "SBUX", "IBM", "GS", "CAT", "BLK",
    "MMM", "GE", "LMT", "AXP", "F", "BA",
    "ASTS", "EOSE", "NBR", "TDW", "GLAD", "FRO",
    "RIG", "DO", "HP", "NOV", "SLB", "HAL",
    "BKR", "WTI", "XLE", "USO"
]  # Replace with your actual tickers
GCP_PROJECT = os.environ.get("GCP_PROJECT", "veloryn-prod")


@functions_framework.cloud_event
def execute_trigger_spawning(cloud_event):
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(GCP_PROJECT, "indicators-collect-trigger")

    for ticker in TICKERS:
        message_data = json.dumps({"ticker": ticker}).encode("utf-8")
        publisher.publish(topic_path, message_data)

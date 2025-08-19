# Use the official Python 3.11 runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app/

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Create a simple server script to run the ADK agent
RUN echo '#!/usr/bin/env python3\n\
import os\n\
from google.adk.core import serve\n\
from analysis_reporter.agent import root_agent\n\
\n\
if __name__ == "__main__":\n\
    port = int(os.environ.get("PORT", 8080))\n\
    serve(root_agent, port=port, host="0.0.0.0")\n\
' > /app/main.py

# Make the script executable
RUN chmod +x /app/main.py

# Run the application
CMD ["python", "main.py"]

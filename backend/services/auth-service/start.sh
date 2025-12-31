#!/bin/bash

# Navigate to the auth service directory
cd "$(dirname "$0")"

# Load environment variables from root .env file
if [ -f "../../../.env" ]; then
    export $(grep -v '^#' ../../../.env | xargs)
    echo "✅ Loaded environment variables from .env"
    echo "📊 DATABASE_URL: ${DATABASE_URL:0:50}..."
else
    echo "❌ .env file not found at ../../../.env"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Activated virtual environment"
fi

# Start the authentication service
echo "🚀 Starting PractiCheck Authentication Service..."
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
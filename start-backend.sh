#!/bin/bash
source venv/bin/activate

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found. Please create one with your DATABASE_URL"
    exit 1
fi

cd backend/services/company-admin
uvicorn main:app --host 0.0.0.0 --port 8001 --reload --reload-dir . --reload-dir ../../../
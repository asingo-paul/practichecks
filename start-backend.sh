#!/bin/bash
source venv/bin/activate
export DATABASE_URL="postgresql://postgres.wutpivngncvjmsamwiyy:J18-8287-2021paul@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
cd backend/services/company-admin
uvicorn main:app --host 0.0.0.0 --port 8001 --reload --reload-dir . --reload-dir ../../../
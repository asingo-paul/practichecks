#!/bin/bash

# PractiCheck Application Startup Script
echo "🚀 Starting PractiCheck Application..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-dev.sh first"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate
echo "✅ Virtual environment activated"

# Check database connection
echo "🔍 Testing database connection..."
python3 -c "
import asyncpg
import asyncio
import os

async def test_db():
    try:
        conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
        result = await conn.fetchval('SELECT 1')
        await conn.close()
        print('✅ Database connection successful')
        return True
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        return False

if not asyncio.run(test_db()):
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    exit 1
fi

# Start Redis (if not running)
echo "🔍 Checking Redis..."
if ! pgrep -x "redis-server" > /dev/null; then
    echo "🚀 Starting Redis server..."
    redis-server --daemonize yes --port 6379
    sleep 2
    echo "✅ Redis server started"
else
    echo "✅ Redis server already running"
fi

# Function to start a service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "🚀 Starting $service_name on port $port..."
    cd "$service_path"
    
    # Kill existing process on port if any
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    
    # Start the service
    python3 main.py &
    local pid=$!
    echo $pid > "../../../.$service_name.pid"
    
    # Wait a moment and check if service started
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        echo "✅ $service_name started successfully (PID: $pid)"
    else
        echo "❌ $service_name failed to start"
        return 1
    fi
    
    cd - > /dev/null
}

# Start backend services
echo ""
echo "🏗️  Starting Backend Services..."
start_service "auth-service" "backend/services/auth-service" 8002
start_service "company-admin" "backend/services/company-admin" 8001

# Start frontend services
echo ""
echo "🎨 Starting Frontend Services..."

# Company Dashboard
echo "🚀 Starting Company Dashboard on port 3000..."
cd frontend/company-dashboard
npm install > /dev/null 2>&1
npm run dev &
COMPANY_DASHBOARD_PID=$!
echo $COMPANY_DASHBOARD_PID > "../../.company-dashboard.pid"
cd - > /dev/null

# University Portal  
echo "🚀 Starting University Portal on port 3001..."
cd frontend/university-portal
npm install > /dev/null 2>&1
PORT=3001 npm run dev &
UNIVERSITY_PORTAL_PID=$!
echo $UNIVERSITY_PORTAL_PID > "../../.university-portal.pid"
cd - > /dev/null

# Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

check_service() {
    local service_name=$1
    local url=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name is not responding"
        return 1
    fi
}

check_service "Auth Service" "http://localhost:8002/health"
check_service "Company Admin API" "http://localhost:8001/health"
check_service "Company Dashboard" "http://localhost:3000"
check_service "University Portal" "http://localhost:3001"

echo ""
echo "🎉 PractiCheck Application Started!"
echo ""
echo "📱 Access Points:"
echo "   Company Dashboard: http://localhost:3000"
echo "   University Portal: http://localhost:3001"
echo "   Auth Service API: http://localhost:8002"
echo "   Company Admin API: http://localhost:8001"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Super Admin: admin@practicheck.com / Admin123!"
echo ""
echo "📋 To stop all services, run: ./stop-application.sh"
echo ""
echo "📊 Service Status:"
echo "   Auth Service PID: $(cat .auth-service.pid 2>/dev/null || echo 'Not found')"
echo "   Company Admin PID: $(cat .company-admin.pid 2>/dev/null || echo 'Not found')"
echo "   Company Dashboard PID: $(cat .company-dashboard.pid 2>/dev/null || echo 'Not found')"
echo "   University Portal PID: $(cat .university-portal.pid 2>/dev/null || echo 'Not found')"
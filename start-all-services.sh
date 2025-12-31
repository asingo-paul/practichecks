#!/bin/bash

echo "🚀 Starting PractiCheck Backend Services..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Function to start a service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "🚀 Starting $service_name on port $port..."
    
    # Kill existing process on port if any
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    
    # Start the service
    cd "$service_path"
    source ../../../venv/bin/activate
    uvicorn main:app --host 0.0.0.0 --port $port --reload &
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
start_service "api-gateway" "backend/services/api-gateway" 8000
start_service "company-admin" "backend/services/company-admin" 8001
start_service "university-admin" "backend/services/university-admin" 8003
start_service "faculty-admin" "backend/services/faculty-admin" 8004

# Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

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
check_service "API Gateway" "http://localhost:8000/"
check_service "Company Admin API" "http://localhost:8001/health"
check_service "University Admin API" "http://localhost:8003/health"
check_service "Faculty Admin API" "http://localhost:8004/health"

echo ""
echo "🎉 Backend Services Started!"
echo ""
echo "📱 API Endpoints:"
echo "   API Gateway: http://localhost:8000"
echo "   Auth Service: http://localhost:8002"
echo "   Company Admin: http://localhost:8001"
echo "   University Admin: http://localhost:8003"
echo "   Faculty Admin: http://localhost:8004"
echo ""
echo "📋 To stop all services, run: ./stop-all-services.sh"
echo ""
echo "📊 Service PIDs:"
echo "   Auth Service: $(cat .auth-service.pid 2>/dev/null || echo 'Not found')"
echo "   API Gateway: $(cat .api-gateway.pid 2>/dev/null || echo 'Not found')"
echo "   Company Admin: $(cat .company-admin.pid 2>/dev/null || echo 'Not found')"
echo "   University Admin: $(cat .university-admin.pid 2>/dev/null || echo 'Not found')"
echo "   Faculty Admin: $(cat .faculty-admin.pid 2>/dev/null || echo 'Not found')"
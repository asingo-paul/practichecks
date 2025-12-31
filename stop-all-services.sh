#!/bin/bash

echo "🛑 Stopping PractiCheck Backend Services..."

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file=".$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill $pid
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                echo "⚠️  Force killing $service_name..."
                kill -9 $pid
            fi
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "auth-service"
stop_service "api-gateway"
stop_service "company-admin"
stop_service "university-admin"
stop_service "faculty-admin"

# Also kill any remaining uvicorn processes
echo "🧹 Cleaning up any remaining processes..."
pkill -f "uvicorn.*main:app" 2>/dev/null || true

echo ""
echo "✅ All services stopped!"
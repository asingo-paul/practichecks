#!/bin/bash

# PractiCheck Test Runner Script
set -e

echo "🧪 Running PractiCheck test suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Backend tests
print_status "Running backend tests..."
cd backend
source venv/bin/activate

# Run unit tests
print_status "Running unit tests..."
python -m pytest tests/unit/ -v --cov=services --cov-report=term-missing

# Run integration tests
print_status "Running integration tests..."
python -m pytest tests/integration/ -v

# Run property-based tests
print_status "Running property-based tests..."
python -m pytest tests/property/ -v --hypothesis-show-statistics

cd ..

# Frontend tests
print_status "Running frontend tests..."

# Company dashboard tests
print_status "Testing company dashboard..."
cd frontend/company-dashboard
npm run lint
npm run type-check
cd ../..

# University portal tests
print_status "Testing university portal..."
cd frontend/university-portal
npm run lint
npm run type-check
cd ../..

print_success "🎉 All tests completed successfully!"
#!/bin/bash

# PractiCheck Development Environment Setup Script
set -e

echo "🚀 Setting up PractiCheck development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9 or higher first."
    exit 1
fi

print_status "Creating project directories..."

# Create backend service directories
mkdir -p backend/services/{api-gateway,tenant-management,auth-service,student-service,lecturer-service,supervisor-service,faculty-admin,university-admin,company-admin}
mkdir -p backend/shared/{models,utils,security,database}
mkdir -p backend/tests/{unit,integration,property}

# Create frontend directories
mkdir -p frontend/shared-components/{components,hooks,utils,types}
mkdir -p frontend/company-dashboard/src/{app,components,lib,types}
mkdir -p frontend/university-portal/src/{app,components,lib,types}

# Create infrastructure directories
mkdir -p infrastructure/{docker,kubernetes,monitoring}
mkdir -p docs/{api,deployment,user-guides}

print_success "Project directories created!"

print_status "Setting up Python virtual environments..."

# Create virtual environment for backend
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    print_success "Python virtual environment created!"
else
    print_warning "Python virtual environment already exists!"
fi

# Activate virtual environment and install dependencies
source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
print_success "Python dependencies installed!"

print_status "Setting up Node.js dependencies..."

# Install company dashboard dependencies
cd frontend/company-dashboard
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Company dashboard dependencies installed!"
else
    print_warning "Company dashboard dependencies already installed!"
fi

# Install university portal dependencies
cd ../university-portal
if [ ! -d "node_modules" ]; then
    npm install
    print_success "University portal dependencies installed!"
else
    print_warning "University portal dependencies already installed!"
fi

cd ../..

print_status "Setting up environment files..."

# Create .env files if they don't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
# PractiCheck Development Environment Variables

# Database Configuration
DATABASE_URL=postgresql://practicheck:dev_password_2024@localhost:5432/practicheck_dev
POSTGRES_DB=practicheck_dev
POSTGRES_USER=practicheck
POSTGRES_PASSWORD=dev_password_2024

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET_KEY=dev_jwt_secret_key_2024_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=PractiCheck
ENVIRONMENT=development

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COMPANY_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_UNIVERSITY_PORTAL_URL=http://localhost:3001

# Security
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
ALLOWED_HOSTS=["localhost","127.0.0.1"]

# Logging
LOG_LEVEL=INFO
EOF
    print_success "Environment file created!"
else
    print_warning "Environment file already exists!"
fi

print_status "Setting up database initialization script..."

# Create database initialization script
cat > scripts/init-multiple-databases.sh << 'EOF'
#!/bin/bash
set -e

function create_user_and_database() {
    local database=$1
    echo "Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi
EOF

chmod +x scripts/init-multiple-databases.sh
print_success "Database initialization script created!"

print_status "Creating Docker development files..."

# Create Dockerfile for API Gateway
mkdir -p backend/services/api-gateway
cat > backend/services/api-gateway/Dockerfile.dev << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command will be overridden in docker-compose
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create Dockerfile for Company Dashboard
cat > frontend/company-dashboard/Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Command will be overridden in docker-compose
CMD ["npm", "run", "dev"]
EOF

print_success "Docker development files created!"

print_status "Setting up Git hooks..."

# Create pre-commit hook for code quality
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Check Python code formatting
echo "Checking Python code formatting..."
source backend/venv/bin/activate
black --check backend/ || {
    echo "Python code formatting issues found. Run 'black backend/' to fix."
    exit 1
}

# Check Python imports
isort --check-only backend/ || {
    echo "Python import issues found. Run 'isort backend/' to fix."
    exit 1
}

# Check TypeScript/JavaScript formatting
echo "Checking frontend code formatting..."
cd frontend/company-dashboard && npm run lint || {
    echo "Company dashboard linting issues found."
    exit 1
}

cd ../university-portal && npm run lint || {
    echo "University portal linting issues found."
    exit 1
}

echo "All pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit
print_success "Git hooks configured!"

print_status "Starting development services..."

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be ready
print_status "Waiting for database to be ready..."
sleep 10

print_success "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start all services: docker-compose -f docker-compose.dev.yml up"
echo "2. Access Company Dashboard: http://localhost:3000"
echo "3. Access University Portal: http://localhost:3001"
echo "4. API Gateway: http://localhost:8000"
echo ""
echo "🔧 Development commands:"
echo "- Start services: docker-compose -f docker-compose.dev.yml up"
echo "- Stop services: docker-compose -f docker-compose.dev.yml down"
echo "- View logs: docker-compose -f docker-compose.dev.yml logs -f [service-name]"
echo "- Run tests: ./scripts/run-tests.sh"
echo ""
echo "📚 Documentation: ./docs/"
EOF
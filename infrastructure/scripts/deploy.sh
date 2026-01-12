#!/bin/bash

# PractiCheck Deployment Script
set -e

# Configuration
ENVIRONMENT=${1:-prod}
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="practicheck"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if AWS CLI is installed and configured
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd infrastructure/terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
    
    # Apply deployment
    terraform apply tfplan
    
    # Get outputs
    terraform output -json > ../outputs.json
    
    cd ../..
    
    log_success "Infrastructure deployed successfully"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
    
    # Build timestamp for tagging
    BUILD_TAG=$(date +%Y%m%d-%H%M%S)
    
    # Backend services
    BACKEND_SERVICES=("api-gateway" "auth-service" "tenant-service")
    for service in "${BACKEND_SERVICES[@]}"; do
        log_info "Building ${service}..."
        
        cd backend/services/${service}
        
        # Build image
        docker build -f ../../../infrastructure/docker/Dockerfile.backend -t ${service}:${BUILD_TAG} .
        
        # Tag for ECR
        docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:${BUILD_TAG}
        docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:latest
        
        # Push to ECR
        docker push ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:${BUILD_TAG}
        docker push ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:latest
        
        cd ../../..
        
        log_success "${service} built and pushed"
    done
    
    # Frontend services
    FRONTEND_SERVICES=("company-dashboard" "university-portal")
    for service in "${FRONTEND_SERVICES[@]}"; do
        log_info "Building ${service}..."
        
        cd frontend/${service}
        
        # Build image
        docker build -f ../../infrastructure/docker/Dockerfile.frontend -t ${service}:${BUILD_TAG} .
        
        # Tag for ECR
        docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:${BUILD_TAG}
        docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:latest
        
        # Push to ECR
        docker push ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:${BUILD_TAG}
        docker push ${ECR_REGISTRY}/${PROJECT_NAME}-${ENVIRONMENT}-${service}:latest
        
        cd ../..
        
        log_success "${service} built and pushed"
    done
    
    log_success "All images built and pushed successfully"
}

# Update ECS services
update_ecs_services() {
    log_info "Updating ECS services..."
    
    ECS_CLUSTER="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
    
    # Services to update
    SERVICES=(
        "${PROJECT_NAME}-${ENVIRONMENT}-api-gateway"
        "${PROJECT_NAME}-${ENVIRONMENT}-auth-service"
        "${PROJECT_NAME}-${ENVIRONMENT}-company-dashboard"
        "${PROJECT_NAME}-${ENVIRONMENT}-university-portal"
    )
    
    for service in "${SERVICES[@]}"; do
        log_info "Updating service: ${service}"
        
        # Force new deployment
        aws ecs update-service \
            --cluster ${ECS_CLUSTER} \
            --service ${service} \
            --force-new-deployment \
            --region ${AWS_REGION}
        
        # Wait for deployment to stabilize
        log_info "Waiting for ${service} to stabilize..."
        aws ecs wait services-stable \
            --cluster ${ECS_CLUSTER} \
            --services ${service} \
            --region ${AWS_REGION}
        
        log_success "${service} updated successfully"
    done
    
    log_success "All ECS services updated successfully"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Health check URLs
    HEALTH_URLS=(
        "https://practicheck.online"
        "https://api.practicheck.online/health"
    )
    
    for url in "${HEALTH_URLS[@]}"; do
        log_info "Checking ${url}..."
        
        # Retry health check up to 5 times
        for i in {1..5}; do
            if curl -f -s ${url} > /dev/null; then
                log_success "${url} is healthy"
                break
            else
                if [ $i -eq 5 ]; then
                    log_error "${url} health check failed after 5 attempts"
                    exit 1
                else
                    log_warning "${url} health check failed, retrying in 30 seconds... (${i}/5)"
                    sleep 30
                fi
            fi
        done
    done
    
    log_success "All health checks passed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # This would implement rollback logic
    # For now, just log the action
    log_info "Rollback functionality would be implemented here"
    log_info "You can manually rollback using AWS Console or CLI"
}

# Main deployment function
main() {
    log_info "Starting PractiCheck deployment to ${ENVIRONMENT} environment"
    
    # Trap errors and rollback
    trap 'log_error "Deployment failed! Consider rolling back."; exit 1' ERR
    
    check_prerequisites
    
    # Ask for confirmation in production
    if [ "${ENVIRONMENT}" = "prod" ]; then
        read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
        if [ "${confirm}" != "yes" ]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    deploy_infrastructure
    build_and_push_images
    update_ecs_services
    run_health_checks
    
    log_success "🎉 PractiCheck deployment completed successfully!"
    log_info "Main site: https://practicheck.online"
    log_info "API: https://api.practicheck.online"
    log_info "Jenkins: https://jenkins.practicheck.online"
}

# Script usage
usage() {
    echo "Usage: $0 [environment]"
    echo "  environment: prod (default) | staging"
    echo ""
    echo "Examples:"
    echo "  $0 prod     # Deploy to production"
    echo "  $0 staging  # Deploy to staging"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    prod|staging|"")
        main
        ;;
    *)
        log_error "Invalid environment: $1"
        usage
        exit 1
        ;;
esac
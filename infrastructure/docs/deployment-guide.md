# PractiCheck Deployment Guide

## 🚀 Complete Deployment Architecture

This guide covers the complete deployment of PractiCheck from development to production on AWS with proper CI/CD, security, and monitoring.

## 📋 Prerequisites

### Required Tools
```bash
# Install required tools
brew install terraform awscli docker kubectl helm

# Or on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y terraform awscli docker.io kubectl

# Verify installations
terraform --version
aws --version
docker --version
```

### AWS Setup
```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret, Region (us-east-1), and output format (json)

# Verify AWS access
aws sts get-caller-identity
```

### GitHub Setup
1. Fork the PractiCheck repository
2. Create GitHub Personal Access Token
3. Configure webhook for Jenkins

## 🏗️ Infrastructure Deployment

### Step 1: Prepare Terraform Backend
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://practicheck-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket practicheck-terraform-state \
    --versioning-configuration Status=Enabled
```

### Step 2: Deploy Infrastructure
```bash
# Clone repository
git clone https://github.com/yourusername/practicheck.git
cd practicheck

# Navigate to Terraform directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review and customize variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your specific values

# Plan deployment
terraform plan -var-file="terraform.tfvars"

# Deploy infrastructure
terraform apply -var-file="terraform.tfvars"
```

### Step 3: Configure Domain
```bash
# Get load balancer DNS name
terraform output load_balancer_dns

# Update your domain DNS records (see domain-setup.md)
# Wait for DNS propagation (24-48 hours)
```

## 🐳 Container Deployment

### Step 1: Build Initial Images
```bash
# Run the deployment script
./infrastructure/scripts/deploy.sh prod
```

### Step 2: Verify Deployment
```bash
# Check ECS services
aws ecs list-services --cluster practicheck-prod-cluster

# Check service health
aws ecs describe-services \
    --cluster practicheck-prod-cluster \
    --services practicheck-prod-api-gateway
```

## 🔄 CI/CD Pipeline Setup

### Step 1: Access Jenkins
```bash
# Get Jenkins URL
terraform output jenkins_url

# Get initial admin password
ssh -i ~/.ssh/id_rsa ec2-user@$(terraform output jenkins_public_ip)
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 2: Configure Jenkins
1. **Initial Setup**
   - Access Jenkins at `https://jenkins.practicheck.online`
   - Use initial admin password
   - Install suggested plugins
   - Create admin user

2. **Install Additional Plugins**
   - AWS Pipeline
   - Docker Pipeline
   - GitHub Integration
   - Blue Ocean
   - Slack Notification

3. **Configure AWS Credentials**
   ```
   Manage Jenkins → Manage Credentials → Global → Add Credentials
   Kind: AWS Credentials
   ID: aws-credentials
   Access Key ID: [Your AWS Access Key]
   Secret Access Key: [Your AWS Secret Key]
   ```

4. **Configure GitHub Integration**
   ```
   Manage Jenkins → Configure System → GitHub
   Add GitHub Server
   API URL: https://api.github.com
   Credentials: [GitHub Personal Access Token]
   ```

### Step 3: Create Pipeline
1. **New Item** → **Pipeline**
2. **Pipeline Definition**: Pipeline script from SCM
3. **SCM**: Git
4. **Repository URL**: Your GitHub repository
5. **Script Path**: `infrastructure/jenkins/Jenkinsfile`

### Step 4: Configure Webhooks
```bash
# GitHub webhook URL
https://jenkins.practicheck.online/github-webhook/

# Configure in GitHub:
# Repository → Settings → Webhooks → Add webhook
# Payload URL: [Jenkins webhook URL]
# Content type: application/json
# Events: Push, Pull request
```

## 🔒 Security Configuration

### Step 1: Enable WAF
```bash
# Create WAF web ACL (included in Terraform)
# Rules are automatically configured for:
# - SQL injection protection
# - XSS protection
# - Rate limiting
# - Geographic restrictions
```

### Step 2: Configure Security Groups
```bash
# Security groups are created by Terraform
# Verify they're properly configured
aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=practicheck-*"
```

### Step 3: SSL/TLS Configuration
```bash
# SSL certificates are automatically provisioned
# Verify certificate status
aws acm list-certificates --region us-east-1
```

## 📊 Monitoring & Logging

### Step 1: CloudWatch Setup
```bash
# CloudWatch logs and metrics are automatically configured
# View logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/practicheck"
```

### Step 2: Set Up Alerts
```bash
# SNS topic for alerts is created by Terraform
# Subscribe to alerts
aws sns subscribe \
    --topic-arn $(terraform output sns_topic_arn) \
    --protocol email \
    --notification-endpoint your-email@example.com
```

### Step 3: Application Monitoring
```bash
# Install monitoring agents (optional)
# Configure application-level metrics
# Set up custom dashboards
```

## 🎯 Multi-Tenant Configuration

### Step 1: University Onboarding
```bash
# Create new university tenant
python scripts/create-tenant.py \
    --name "Machakos University" \
    --subdomain "mksu" \
    --admin-email "admin@mksu.ac.ke"
```

### Step 2: Database Isolation
```bash
# Each university gets isolated database schema
# Configured automatically during tenant creation
```

### Step 3: Subdomain Routing
```bash
# Load balancer rules handle subdomain routing
# No additional configuration needed
```

## 🧪 Testing & Validation

### Step 1: Smoke Tests
```bash
# Run automated smoke tests
python scripts/smoke-tests.py --environment prod
```

### Step 2: Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run infrastructure/tests/load-test.yml
```

### Step 3: Security Testing
```bash
# Run security scans
docker run --rm -v $(pwd):/zap/wrk/:rw \
    -t owasp/zap2docker-stable zap-baseline.py \
    -t https://practicheck.online
```

## 🔄 Maintenance & Updates

### Step 1: Regular Updates
```bash
# Update infrastructure
cd infrastructure/terraform
terraform plan
terraform apply

# Update application
git push origin main  # Triggers Jenkins pipeline
```

### Step 2: Backup Strategy
```bash
# Database backups (automated)
# Configuration backups
# Code repository backups
```

### Step 3: Disaster Recovery
```bash
# Multi-AZ deployment (included)
# Automated failover
# Recovery procedures documented
```

## 📈 Scaling Strategy

### Step 1: Horizontal Scaling
```bash
# Increase ECS service desired count
aws ecs update-service \
    --cluster practicheck-prod-cluster \
    --service practicheck-prod-api-gateway \
    --desired-count 4
```

### Step 2: Vertical Scaling
```bash
# Update task definition with more CPU/memory
# Deploy new task definition
```

### Step 3: Database Scaling
```bash
# Enable read replicas
# Increase instance size
# Implement connection pooling
```

## 🚨 Troubleshooting

### Common Issues

1. **DNS Resolution Problems**
   ```bash
   # Check DNS propagation
   dig practicheck.online
   nslookup practicheck.online 8.8.8.8
   ```

2. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   aws acm describe-certificate --certificate-arn [ARN]
   ```

3. **ECS Service Issues**
   ```bash
   # Check service events
   aws ecs describe-services \
       --cluster practicheck-prod-cluster \
       --services practicheck-prod-api-gateway
   ```

4. **Load Balancer Issues**
   ```bash
   # Check target health
   aws elbv2 describe-target-health \
       --target-group-arn [TARGET_GROUP_ARN]
   ```

### Support Contacts
- **AWS Support**: Through AWS Console
- **Infrastructure Team**: infrastructure@practicheck.online
- **Emergency Hotline**: [Emergency contact number]

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🎉 Success Metrics

After successful deployment, you should have:
- ✅ Main site accessible at `https://practicheck.online`
- ✅ API accessible at `https://api.practicheck.online`
- ✅ Jenkins accessible at `https://jenkins.practicheck.online`
- ✅ SSL certificates valid and auto-renewing
- ✅ CI/CD pipeline functional
- ✅ Monitoring and alerting active
- ✅ Multi-tenant architecture ready
- ✅ Security measures in place
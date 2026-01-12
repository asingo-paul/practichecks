# PractiCheck Infrastructure & Deployment

## Architecture Overview

```
practicheck.online (Main Company Dashboard)
├── mksu.practicheck.online (Machakos University)
├── uon.practicheck.online (University of Nairobi)
├── ku.practicheck.online (Kenyatta University)
└── ... (Other Universities)
```

## Infrastructure Components

### 1. Domain & DNS Configuration (Namecheap)
- **Primary Domain**: practicheck.online
- **Subdomains**: Wildcard SSL for *.practicheck.online
- **DNS Management**: Route53 for advanced routing
- **CDN**: CloudFront for global content delivery

### 2. AWS Infrastructure
- **ECS Fargate**: Container orchestration
- **Application Load Balancer**: Traffic routing
- **RDS PostgreSQL**: Multi-tenant database
- **ElastiCache Redis**: Session & caching
- **S3**: Static assets & backups
- **CloudWatch**: Monitoring & logging
- **Secrets Manager**: Secure credential storage

### 3. CI/CD Pipeline (Jenkins)
- **Source**: GitHub webhooks
- **Build**: Docker image creation
- **Test**: Automated testing suite
- **Deploy**: Blue-green deployment to ECS
- **Rollback**: Automated rollback capability

### 4. Security Features
- **SSL/TLS**: Let's Encrypt + CloudFront
- **WAF**: AWS Web Application Firewall
- **VPC**: Private networking
- **IAM**: Role-based access control
- **Secrets**: AWS Secrets Manager

## Deployment Flow

1. **Code Push** → GitHub
2. **Webhook** → Jenkins Pipeline
3. **Build & Test** → Docker Images
4. **Push** → ECR (Elastic Container Registry)
5. **Deploy** → ECS Fargate
6. **Health Check** → Load Balancer
7. **DNS Update** → Route53
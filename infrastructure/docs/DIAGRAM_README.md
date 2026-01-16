# PractiCheck Infrastructure Diagram

## Overview
This diagram illustrates the complete infrastructure architecture for PractiCheck, from GitHub source code to production deployment on AWS, including all security layers and components.

## How to View the Diagram

### Option 1: Draw.io Desktop App (Recommended)
1. Download and install Draw.io Desktop from: https://github.com/jgraph/drawio-desktop/releases
2. Open the file: `infrastructure/docs/practicheck-infrastructure.drawio`
3. The diagram will render with all components, colors, and connections

### Option 2: Draw.io Web App
1. Go to https://app.diagrams.net/
2. Click "Open Existing Diagram"
3. Select the file: `infrastructure/docs/practicheck-infrastructure.drawio`
4. View and edit online

### Option 3: VS Code Extension
1. Install the "Draw.io Integration" extension in VS Code
2. Open the `.drawio` file directly in VS Code
3. View and edit within your IDE

## Diagram Components

### 1. Source Control & CI/CD
- **GitHub Repository**: Source code with webhook triggers
- **Jenkins Pipeline**: 7-stage automated deployment
  - Checkout → Test → Build → Security Scan → Push to ECR → Deploy → Notify

### 2. AWS Infrastructure

#### Networking Layer
- **Route 53**: DNS management for practicheck.online and subdomains
- **CloudFront CDN**: Global content delivery with SSL/TLS
- **Application Load Balancer**: HTTPS traffic distribution
- **VPC**: Isolated network (10.0.0.0/16)
  - Public Subnets (2 AZs)
  - Private Subnets - Application Tier
  - Private Subnets - Database Tier

#### Compute Layer
- **ECS Fargate Cluster**: Serverless container orchestration
  - Frontend Service (Next.js)
  - API Gateway (FastAPI)
  - Auth Service
  - Company Admin Service
  - University Admin Service
  - Faculty Admin Service
- **Auto Scaling**: 2-10 instances based on CPU utilization

#### Database Layer
- **RDS PostgreSQL**: Multi-AZ deployment with automated backups
- **ElastiCache Redis**: Session caching with replication

#### Storage & Registry
- **S3**: Static assets and backups
- **ECR**: Docker image registry
- **CloudWatch Logs**: Centralized logging

### 3. Security Components

#### Identity & Access
- **IAM**: Role-based access control with least privilege
- **Secrets Manager**: Automated credential rotation (30-day cycle)

#### Network Security
- **Security Groups**: Layered firewall rules
  - ALB: Port 443 from Internet
  - ECS: Application ports from ALB only
  - RDS: Port 5432 from ECS only
- **NAT Gateways**: Secure outbound internet access

#### Application Security
- **AWS WAF**: Web application firewall
  - DDoS protection
  - SQL injection prevention
  - XSS protection
- **SSL/TLS**: End-to-end encryption

#### Monitoring & Compliance
- **CloudWatch**: Metrics, alarms, and dashboards
- **X-Ray**: Distributed tracing
- **Automated Backups**: 30-day retention
- **Audit Logging**: Complete activity tracking

## Key Features Highlighted

### High Availability
- Multi-AZ deployment across 2 availability zones
- Automated failover for RDS
- Load balancing across multiple containers

### Security
- End-to-end TLS 1.3 encryption
- Network isolation with private subnets
- Automated security scanning in CI/CD
- Secrets rotation and management
- WAF protection against common attacks

### Scalability
- Auto-scaling based on metrics (CPU > 70%)
- Serverless containers (Fargate)
- CDN edge caching
- Redis session caching

### Disaster Recovery
- RTO: 1 hour
- RPO: 5 minutes
- Automated backups
- Multi-AZ redundancy

### Multi-Tenant Architecture
- Subdomain routing (mksu.practicheck.online, uon.practicheck.online)
- Isolated containers per university
- Centralized management

## Color Coding

- **Red/Pink**: Security components
- **Purple**: Compute services (ECS)
- **Blue**: Network components
- **Green**: VPC and networking
- **Orange**: Storage and registry
- **Yellow**: Monitoring and caching

## Deployment Flow

1. **Developer Push** → GitHub main branch
2. **Webhook Trigger** → Jenkins pipeline starts
3. **CI Pipeline**:
   - Run automated tests
   - Build Docker images
   - Security scan with Trivy
4. **CD Pipeline**:
   - Push images to ECR
   - Deploy to ECS Fargate
   - Health checks
   - Team notification

## User Request Flow

1. User accesses `practicheck.online` or subdomain
2. Route 53 resolves DNS
3. CloudFront CDN serves cached content or forwards
4. WAF inspects and filters traffic
5. ALB distributes to healthy ECS tasks
6. Application processes request
7. Data retrieved from RDS/Redis
8. Response cached and returned

## Monitoring & Alerts

- Real-time CloudWatch metrics
- Custom alarms for:
  - High CPU utilization
  - Memory pressure
  - Failed health checks
  - Database connection issues
- Log aggregation and analysis
- Performance insights dashboard

## Cost Optimization

- Fargate Spot instances for non-production
- Reserved Instances for RDS
- S3 lifecycle policies
- CloudFront caching reduces origin load
- Auto-scaling prevents over-provisioning

## Compliance & Governance

- GDPR ready architecture
- Data encryption at rest and in transit
- Audit logging enabled
- Regular security scans
- Automated compliance checks

## Updating the Diagram

To modify the diagram:
1. Open in Draw.io (desktop or web)
2. Make your changes
3. Save the file
4. Commit to Git repository
5. Share with team

## Export Options

From Draw.io, you can export to:
- PNG (for documentation)
- PDF (for presentations)
- SVG (for web)
- HTML (interactive)

## Questions or Issues?

If you need to modify the infrastructure:
1. Update the Terraform files in `infrastructure/terraform/`
2. Update this diagram to reflect changes
3. Update the deployment documentation

---

**Created**: January 2024  
**Last Updated**: January 2024  
**Maintained By**: DevOps Team

# PractiCheck - University Industrial Attachment Platform

A comprehensive multi-tenant SaaS platform for managing university industrial attachment programs.

## Architecture

- **Backend**: Python FastAPI microservices
- **Frontend**: Next.js with Tailwind CSS
- **Database**: PostgreSQL with tenant isolation
- **Deployment**: Docker containers with Kubernetes orchestration
- **Testing**: Pytest with Hypothesis for property-based testing

## Project Structure

```
practicheck/
├── backend/                    # Python FastAPI services
│   ├── services/              # Individual microservices
│   │   ├── tenant-management/ # Tenant provisioning and management
│   │   ├── auth-service/      # Authentication and authorization
│   │   ├── api-gateway/       # Request routing and load balancing
│   │   ├── student-service/   # Student dashboard and functionality
│   │   ├── lecturer-service/  # Lecturer assessment tools
│   │   ├── supervisor-service/# Industry supervisor tools
│   │   ├── faculty-admin/     # Faculty administration
│   │   ├── university-admin/  # University-wide administration
│   │   └── company-admin/     # Platform-wide management
│   ├── shared/               # Shared libraries and utilities
│   └── tests/                # Backend tests
├── frontend/                 # Next.js applications
│   ├── company-dashboard/    # PractiCheck company dashboard
│   ├── university-portal/    # Multi-role university portal
│   ├── shared-components/    # Reusable UI components
│   └── public/              # Static assets
├── infrastructure/          # Docker and Kubernetes configs
├── docs/                   # Documentation
└── scripts/               # Development and deployment scripts
```

## Color Scheme

**Primary Brand Color**: Deep Blue (#1e40af)
- Professional and trustworthy
- Excellent contrast and accessibility
- Modern enterprise appearance

## Getting Started

1. Clone the repository
2. Run `./scripts/setup-dev.sh` to set up development environment
3. Use `docker-compose up` for local development
4. Access dashboards at configured ports

## Security

- JWT-based authentication with role-based access control
- Complete tenant data isolation
- Encrypted data storage and transmission
- Comprehensive audit logging
- Input validation and sanitization
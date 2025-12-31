# PractiCheck Authentication Service

Multi-role authentication service with complete tenant isolation for the PractiCheck platform.

## Features

- **Multi-Tenant Architecture**: Complete isolation between universities
- **Role-Based Authentication**: Support for 6 different user roles
- **Secure JWT Tokens**: With role and tenant information
- **Password Management**: Temporary passwords, password changes, resets
- **Email Integration**: Welcome emails, password setup links
- **University Selection**: Dynamic university loading for login

## Supported User Roles

### 1. **Students** 
- **Login**: Student ID + Password + University Selection
- **Features**: Email-based password setup, university-specific isolation
- **Endpoint**: `POST /auth/student/login`

### 2. **Lecturers**
- **Login**: Staff ID + Password + University Selection  
- **Features**: Temporary password system, forced password change on first login
- **Endpoints**: 
  - `POST /auth/lecturer/login`
  - `POST /auth/lecturer/change-password`

### 3. **Supervisors** (Industry)
- **Login**: Email + Password
- **Features**: Self-registration, industry information
- **Endpoints**:
  - `POST /auth/supervisor/register`
  - `POST /auth/supervisor/login`

### 4. **Faculty Admins**
- **Login**: Email + Password
- **Features**: University-specific, manages lecturers
- **Endpoint**: `POST /auth/faculty-admin/login`

### 5. **University Admins**
- **Login**: Email + Password  
- **Features**: University-wide management, creates faculty admins
- **Endpoint**: `POST /auth/university-admin/login`

### 6. **Company Admins**
- **Login**: Handled by separate company-admin service
- **Features**: Platform-wide management

## API Endpoints

### Authentication Endpoints

```
GET  /universities                    # Get list of universities
POST /auth/student/login             # Student authentication
POST /auth/student/setup-password    # Student password setup
POST /auth/lecturer/login            # Lecturer authentication  
POST /auth/lecturer/change-password  # Lecturer password change
POST /auth/supervisor/register       # Supervisor registration
POST /auth/supervisor/login          # Supervisor authentication
POST /auth/faculty-admin/login       # Faculty admin authentication
POST /auth/university-admin/login    # University admin authentication
```

### Utility Endpoints

```
GET  /                              # Service status
GET  /health                        # Health check
```

## Tenant Isolation

The service ensures complete data isolation between universities:

- **Students**: Can only access data from their university
- **Lecturers**: Limited to their university's students and courses
- **Faculty Admins**: Manage only their university's faculty
- **University Admins**: Full access to their university only
- **Supervisors**: Cross-university access for industry partnerships

## JWT Token Structure

Tokens include role and tenant information:

```json
{
  "user_id": "uuid",
  "email": "user@university.edu", 
  "role": "student|lecturer|supervisor|faculty_admin|university_admin",
  "tenant_id": "uuid",  // null for supervisors
  "student_id": "CS/2021/001",  // role-specific fields
  "exp": 1234567890
}
```

## Database Schema

### Core Tables
- `users`: All user accounts with role and tenant_id
- `student_profiles`: Student-specific data
- `lecturer_profiles`: Lecturer-specific data  
- `supervisor_profiles`: Industry supervisor data
- `faculty_admin_profiles`: Faculty administrator data
- `university_admin_profiles`: University administrator data

### University Structure
- `tenants`: Universities/institutions
- `faculties`: University faculties/schools
- `courses`: Academic programs per faculty

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT Configuration  
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

## Running the Service

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://..."
export JWT_SECRET_KEY="your-secret-key"

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

### Docker
```bash
docker-compose -f docker-compose.dev.yml up auth-service
```

## Sample Data

Use the population script to create test data:

```bash
python scripts/populate-sample-data.py
```

This creates:
- 3 sample universities (Machakos University, University of Nairobi, Kenyatta University)
- Faculties and courses for each university
- Sample users for all roles
- Complete tenant isolation

## Testing

### Sample Login Credentials

**Machakos University:**
- Student: `alice.mwangi@machakosuniversity.edu` / `Student123!`
- Lecturer: `j.kamau@machakosuniversity.edu` / `TempPass123!` (temporary)
- Faculty Admin: `faculty.set@machakosuniversity.edu` / `FacAdmin123!`
- University Admin: `admin@machakosuniversity.edu` / `UniAdmin123!`

**Supervisors:**
- `james.mutua@techcorp.com` / `Supervisor123!`

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure token generation with expiration
- **Tenant Isolation**: Database-level isolation between universities
- **Role-Based Access**: Strict role checking in all endpoints
- **Temporary Passwords**: Forced password change for new lecturers
- **Email Verification**: Password setup links for students

## Integration

The service integrates with:
- **Company Dashboard**: Frontend authentication
- **University Portal**: Student/lecturer interfaces  
- **Email Service**: Password setup and notifications
- **Database**: Multi-tenant PostgreSQL schema

## Error Handling

Standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing fields, validation errors)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (user/university not found)
- `500`: Internal Server Error

Error responses include descriptive messages:
```json
{
  "detail": "Invalid student ID, password, or university selection"
}
```
"""
PractiCheck Multi-Role Authentication Service
FastAPI backend for handling authentication across all user roles with tenant isolation
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
import asyncpg
import bcrypt
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
import os
from datetime import datetime, timedelta, timezone
import logging
import uuid
from contextlib import asynccontextmanager
import json
import secrets
import string
from dotenv import load_dotenv
import sys
from pathlib import Path

# Load environment variables from root .env file
root_dir = Path(__file__).parent.parent.parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set!")
    logger.error(f"Checked .env file at: {env_path}")
    logger.error("Available environment variables:")
    for key in os.environ:
        if 'DATABASE' in key or 'JWT' in key:
            logger.error(f"  {key}={os.environ[key][:20]}...")
    raise ValueError("DATABASE_URL environment variable is required")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

logger.info(f"Successfully loaded DATABASE_URL: {DATABASE_URL[:50]}...")
logger.info(f"Environment file loaded from: {env_path}")
logger.info(f"JWT_SECRET_KEY loaded: {'Yes' if JWT_SECRET_KEY != 'your-secret-key-change-in-production' else 'Using default'}")

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

# Security
security = HTTPBearer()

# Database connection pool
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10, statement_cache_size=0)
    logger.info("Database connection pool created")
    yield
    # Shutdown
    await db_pool.close()
    logger.info("Database connection pool closed")

# Create FastAPI app
app = FastAPI(
    title="PractiCheck Authentication Service",
    description="Multi-role authentication service with tenant isolation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.practicheck.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Pydantic Models
class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    student_id: Optional[str] = None
    staff_id: Optional[str] = None
    password: str
    university_id: Optional[str] = None  # Required for students

class StudentSetupRequest(BaseModel):
    token: str
    student_id: str
    password: str
    university_id: str

class LecturerChangePasswordRequest(BaseModel):
    staff_id: str
    current_password: str
    new_password: str
    university_id: str

class SupervisorRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    company_name: str = Field(alias="companyName")
    industry: str
    position: str
    phone: Optional[str] = None
    company_address: Optional[str] = Field(alias="companyAddress", default=None)
    years_experience: Optional[int] = Field(alias="yearsExperience", default=0)

    model_config = {"populate_by_name": True}

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UniversityInfo(BaseModel):
    id: str
    name: str
    location: str
    domain: Optional[str] = None

class FacultyInfo(BaseModel):
    id: str
    name: str
    university_id: str
    university_name: str

class CourseInfo(BaseModel):
    id: str
    name: str
    code: str
    faculty_id: str
    faculty_name: str
    university_id: str

# Utility Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def generate_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

async def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """Send email using SMTP"""
    try:
        import smtplib
        from email.mime.text import MimeText
        from email.mime.multipart import MimeMultipart
        
        msg = MimeMultipart('alternative')
        msg['From'] = DEFAULT_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        # Add text part
        text_part = MimeText(body, 'plain')
        msg.attach(text_part)

        # Add HTML part if provided
        if html_body:
            html_part = MimeText(html_body, 'html')
            msg.attach(html_part)

        # Send email
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        if EMAIL_USE_TLS:
            server.starttls()
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

async def get_tenant_by_id(tenant_id: str) -> Optional[dict]:
    """Get tenant information by ID"""
    async with db_pool.acquire() as conn:
        tenant = await conn.fetchrow(
            "SELECT id, name, location, domain FROM tenants WHERE id = $1 AND status = 'active'",
            tenant_id
        )
        return dict(tenant) if tenant else None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(token_data: dict = Depends(verify_token)) -> dict:
    """Get current authenticated user"""
    async with db_pool.acquire() as conn:
        user = await conn.fetchrow("""
            SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.is_active,
                   t.name as university_name, t.slug
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1 AND u.is_active = true
        """, token_data.get("user_id"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return dict(user)

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PractiCheck Authentication Service",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected"}

@app.get("/universities", response_model=List[UniversityInfo])
async def get_universities():
    """Get list of active universities for selection"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT id, name, location, domain
            FROM tenants 
            WHERE status = 'active'
            ORDER BY name
        """)
        
        return [
            UniversityInfo(
                id=str(uni['id']),
                name=uni['name'],
                location=uni['location'] or "Not specified",
                domain=uni['domain']
            )
            for uni in universities
        ]

@app.get("/universities/{university_id}/faculties", response_model=List[FacultyInfo])
async def get_university_faculties(university_id: str):
    """Get list of faculties for a specific university"""
    async with db_pool.acquire() as conn:
        faculties = await conn.fetch("""
            SELECT f.id, f.name, f.tenant_id, t.name as university_name
            FROM faculties f
            JOIN tenants t ON f.tenant_id = t.id
            WHERE f.tenant_id = $1 AND t.status = 'active'
            ORDER BY f.name
        """, university_id)
        
        return [
            FacultyInfo(
                id=str(faculty['id']),
                name=faculty['name'],
                university_id=str(faculty['tenant_id']),
                university_name=faculty['university_name']
            )
            for faculty in faculties
        ]

@app.get("/faculties/{faculty_id}/courses", response_model=List[CourseInfo])
async def get_faculty_courses(faculty_id: str):
    """Get list of courses for a specific faculty"""
    async with db_pool.acquire() as conn:
        courses = await conn.fetch("""
            SELECT c.id, c.name, c.code, c.faculty_id, f.name as faculty_name, f.tenant_id
            FROM courses c
            JOIN faculties f ON c.faculty_id = f.id
            JOIN tenants t ON f.tenant_id = t.id
            WHERE c.faculty_id = $1 AND t.status = 'active'
            ORDER BY c.name
        """, faculty_id)
        
        return [
            CourseInfo(
                id=str(course['id']),
                name=course['name'],
                code=course['code'],
                faculty_id=str(course['faculty_id']),
                faculty_name=course['faculty_name'],
                university_id=str(course['tenant_id'])
            )
            for course in courses
        ]

# Student Authentication Endpoints
@app.post("/auth/student/check-email")
async def student_check_email(request: dict):
    """Check if student exists and send password setup link if needed"""
    email = request.get('email')
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    async with db_pool.acquire() as conn:
        # Check if student exists with this email
        student = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.is_active,
                   sp.student_id, t.name as university_name
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = $1 AND u.role = 'student' AND u.is_active = true
        """, email)
        
        if not student:
            return {
                "exists": False,
                "hasPassword": False,
                "message": "No student account found with this email address"
            }
        
        has_password = bool(student['password_hash'])
        
        if not has_password:
            # Generate password setup token
            setup_token = generate_token()
            
            # Store token in database (you might want to add a tokens table)
            # For now, we'll just send the email
            
            # Send password setup email
            setup_link = f"http://localhost:3000/auth/student/setup-password?token={setup_token}&email={email}"
            
            email_subject = "Set up your PractiCheck student password"
            email_body = f"""
Hello {student['name']},

Welcome to PractiCheck! Your student account has been created for {student['university_name']}.

To complete your account setup, please click the link below to create your password:

{setup_link}

Your Student ID: {student['student_id']}

If you didn't request this account, please ignore this email.

Best regards,
PractiCheck Team
            """
            
            email_html = f"""
            <html>
            <body>
                <h2>Welcome to PractiCheck!</h2>
                <p>Hello {student['name']},</p>
                <p>Your student account has been created for <strong>{student['university_name']}</strong>.</p>
                <p>To complete your account setup, please click the button below to create your password:</p>
                <p><a href="{setup_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Up Password</a></p>
                <p><strong>Your Student ID:</strong> {student['student_id']}</p>
                <p>If you didn't request this account, please ignore this email.</p>
                <p>Best regards,<br>PractiCheck Team</p>
            </body>
            </html>
            """
            
            try:
                email_sent = await send_email(email, email_subject, email_body, email_html)
                if email_sent:
                    logger.info(f"Password setup email sent to {email}")
                else:
                    logger.error(f"Failed to send password setup email to {email}")
            except Exception as e:
                logger.error(f"Error sending email to {email}: {e}")
                # Don't fail the request if email fails
        
        return {
            "exists": True,
            "hasPassword": has_password,
            "message": "Password setup link sent to your email" if not has_password else "Student account found"
        }

@app.post("/auth/student/login", response_model=LoginResponse)
async def student_login(login_data: LoginRequest):
    """Student login with Student ID + Password + University selection"""
    if not login_data.student_id or not login_data.university_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID and University selection are required"
        )
    
    async with db_pool.acquire() as conn:
        # Get student with tenant isolation
        student = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.role, u.tenant_id, u.is_active,
                   sp.student_id, sp.faculty, sp.program, sp.year_of_study,
                   t.name as university_name, t.location as university_location
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN tenants t ON u.tenant_id = t.id
            WHERE sp.student_id = $1 AND u.tenant_id = $2 AND u.role = 'student' AND u.is_active = true
        """, login_data.student_id, login_data.university_id)
        
        if not student or not verify_password(login_data.password, student['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid student ID, password, or university selection"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            student['id']
        )
        
        # Create access token with tenant information
        token_data = {
            "user_id": str(student['id']),
            "email": student['email'],
            "role": student['role'],
            "tenant_id": str(student['tenant_id']),
            "student_id": student['student_id']
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(student['id']),
                "email": student['email'],
                "name": student['name'],
                "role": student['role'],
                "tenant_id": str(student['tenant_id']),
                "university_name": student['university_name'],
                "profile": {
                    "student_id": student['student_id'],
                    "faculty": student['faculty'],
                    "program": student['program'],
                    "year_of_study": student['year_of_study']
                }
            }
        )

@app.post("/auth/student/setup-password")
async def student_setup_password(setup_data: StudentSetupRequest):
    """Student password setup from email link"""
    # This would be called after student receives email with setup link
    # For now, return success - full implementation would verify token
    return {"message": "Password setup functionality - to be implemented with email system"}

# Lecturer Authentication Endpoints
@app.post("/auth/lecturer/login", response_model=LoginResponse)
async def lecturer_login(login_data: LoginRequest):
    """Lecturer login with Staff ID + Password + University"""
    if not login_data.staff_id or not login_data.university_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff ID and University selection are required"
        )
    
    async with db_pool.acquire() as conn:
        # Get lecturer with tenant isolation
        lecturer = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.role, u.tenant_id, u.is_active,
                   u.is_password_temporary,
                   lp.staff_id, lp.faculty, lp.department, lp.specialization, lp.office_location,
                   t.name as university_name, t.location as university_location
            FROM users u
            JOIN lecturer_profiles lp ON u.id = lp.user_id
            JOIN tenants t ON u.tenant_id = t.id
            WHERE lp.staff_id = $1 AND u.tenant_id = $2 AND u.role = 'lecturer' AND u.is_active = true
        """, login_data.staff_id, login_data.university_id)
        
        if not lecturer or not verify_password(login_data.password, lecturer['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid staff ID, password, or university selection"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            lecturer['id']
        )
        
        # Create access token with tenant information
        token_data = {
            "user_id": str(lecturer['id']),
            "email": lecturer['email'],
            "role": lecturer['role'],
            "tenant_id": str(lecturer['tenant_id']),
            "staff_id": lecturer['staff_id']
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(lecturer['id']),
                "email": lecturer['email'],
                "name": lecturer['name'],
                "role": lecturer['role'],
                "tenant_id": str(lecturer['tenant_id']),
                "university_name": lecturer['university_name'],
                "is_password_temporary": lecturer['is_password_temporary'],
                "profile": {
                    "staff_id": lecturer['staff_id'],
                    "faculty": lecturer['faculty'],
                    "department": lecturer['department'],
                    "specialization": lecturer['specialization'],
                    "office_location": lecturer['office_location']
                }
            }
        )

@app.post("/auth/lecturer/change-password")
async def lecturer_change_password(password_data: LecturerChangePasswordRequest):
    """Lecturer password change (from temporary to permanent)"""
    async with db_pool.acquire() as conn:
        # Get lecturer with tenant isolation
        lecturer = await conn.fetchrow("""
            SELECT u.id, u.password_hash
            FROM users u
            JOIN lecturer_profiles lp ON u.id = lp.user_id
            WHERE lp.staff_id = $1 AND u.tenant_id = $2 AND u.role = 'lecturer' AND u.is_active = true
        """, password_data.staff_id, password_data.university_id)
        
        if not lecturer or not verify_password(password_data.current_password, lecturer['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid current password"
            )
        
        # Update password and mark as permanent
        new_password_hash = hash_password(password_data.new_password)
        await conn.execute("""
            UPDATE users 
            SET password_hash = $1, is_password_temporary = false, updated_at = NOW()
            WHERE id = $2
        """, new_password_hash, lecturer['id'])
        
        return {"message": "Password updated successfully"}

@app.post("/auth/student/validate-registration")
async def validate_student_registration(request: dict):
    """Validate student registration data against pre-registered information"""
    email = request.get('email')
    university_id = request.get('university_id')
    faculty_id = request.get('faculty_id')
    course_id = request.get('course_id')
    
    if not all([email, university_id, faculty_id, course_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, university, faculty, and course selection are required"
        )
    
    async with db_pool.acquire() as conn:
        # Check if student is pre-registered with matching course
        student = await conn.fetchrow("""
            SELECT u.id, u.email, u.name, u.password_hash, u.tenant_id,
                   sp.student_id, sp.course_id, sp.faculty_id,
                   t.name as university_name, f.name as faculty_name, c.name as course_name
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN tenants t ON u.tenant_id = t.id
            JOIN faculties f ON sp.faculty_id = f.id
            JOIN courses c ON sp.course_id = c.id
            WHERE u.email = $1 AND u.tenant_id = $2 AND sp.faculty_id = $3 AND sp.course_id = $4
            AND u.role = 'student' AND u.is_active = true
        """, email, university_id, faculty_id, course_id)
        
        if not student:
            # Check if student exists but with different course/faculty
            existing_student = await conn.fetchrow("""
                SELECT u.id, sp.faculty_id, sp.course_id, f.name as faculty_name, c.name as course_name
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                JOIN faculties f ON sp.faculty_id = f.id
                JOIN courses c ON sp.course_id = c.id
                WHERE u.email = $1 AND u.tenant_id = $2 AND u.role = 'student'
            """, email, university_id)
            
            if existing_student:
                return {
                    "valid": False,
                    "message": f"Student is registered for {existing_student['course_name']} in {existing_student['faculty_name']}. Please select the correct faculty and course.",
                    "suggested_faculty_id": str(existing_student['faculty_id']),
                    "suggested_course_id": str(existing_student['course_id'])
                }
            else:
                return {
                    "valid": False,
                    "message": "No student record found with this email for the selected university and course. Please contact your university administration."
                }
        
        has_password = bool(student['password_hash'])
        
        return {
            "valid": True,
            "has_password": has_password,
            "student_id": student['student_id'],
            "university_name": student['university_name'],
            "faculty_name": student['faculty_name'],
            "course_name": student['course_name'],
            "message": "Student registration validated successfully" if has_password else "Please set up your password to complete registration"
        }

@app.post("/auth/student/register")
async def complete_student_registration(request: dict):
    """Complete student registration with password setup"""
    email = request.get('email')
    password = request.get('password')
    university_id = request.get('university_id')
    faculty_id = request.get('faculty_id')
    course_id = request.get('course_id')
    
    if not all([email, password, university_id, faculty_id, course_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required"
        )
    
    # Validate password strength
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Verify student exists and matches course selection
            student = await conn.fetchrow("""
                SELECT u.id, u.password_hash, sp.student_id
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                WHERE u.email = $1 AND u.tenant_id = $2 AND sp.faculty_id = $3 AND sp.course_id = $4
                AND u.role = 'student' AND u.is_active = true
            """, email, university_id, faculty_id, course_id)
            
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student not found or course selection mismatch"
                )
            
            if student['password_hash']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Student account already has a password set"
                )
            
            # Set password
            password_hash = hash_password(password)
            await conn.execute("""
                UPDATE users SET password_hash = $1, is_password_temporary = false
                WHERE id = $2
            """, password_hash, student['id'])
            
            # Log activity
            await conn.execute("""
                INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
                VALUES ($1, $2, 'user', 'Student Registration Completed', 'user', $2, $3)
            """, university_id, student['id'], json.dumps({
                "email": email,
                "student_id": student['student_id'],
                "faculty_id": str(faculty_id),
                "course_id": str(course_id)
            }))
            
            return {
                "message": "Registration completed successfully",
                "student_id": student['student_id']
            }

@app.post("/auth/student/assessment-request")
async def create_assessment_request(request: dict, current_user: dict = Depends(get_current_user)):
    """Create a new assessment request"""
    if current_user.get('role') != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create assessment requests"
        )
    
    assessment_type = request.get('assessment_type')
    description = request.get('description', '')
    priority = request.get('priority', 'normal')
    due_date = request.get('due_date')
    
    if not assessment_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment type is required"
        )
    
    async with db_pool.acquire() as conn:
        # Get student's faculty information
        student_info = await conn.fetchrow("""
            SELECT u.faculty_id, sp.course_id
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.id = $1
        """, current_user['user_id'])
        
        if not student_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        # Create assessment request
        request_id = await conn.fetchval("""
            INSERT INTO assessment_requests (
                tenant_id, student_id, faculty_id, assessment_type, 
                description, priority, due_date, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING id
        """, 
        current_user['tenant_id'],
        current_user['user_id'],
        student_info['faculty_id'],
        assessment_type,
        description,
        priority,
        due_date
        )
        
        # Create notification for faculty admin
        await conn.execute("""
            INSERT INTO notifications (tenant_id, user_id, type, title, message, data)
            SELECT $1, u.id, 'assessment_request', 'New Assessment Request', $2, $3
            FROM users u
            WHERE u.tenant_id = $1 AND u.faculty_id = $4 AND u.role = 'faculty_admin' AND u.is_active = true
        """, 
        current_user['tenant_id'],
        f"New {assessment_type} assessment request from student",
        json.dumps({
            "request_id": str(request_id),
            "student_id": current_user['user_id'],
            "assessment_type": assessment_type,
            "priority": priority
        }),
        student_info['faculty_id']
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, $2, 'user', 'Assessment Request Created', 'assessment_request', $3, $4)
        """, 
        current_user['tenant_id'],
        current_user['user_id'],
        request_id,
        json.dumps({
            "assessment_type": assessment_type,
            "priority": priority,
            "faculty_id": str(student_info['faculty_id'])
        })
        )
        
        return {
            "message": "Assessment request created successfully",
            "request_id": str(request_id)
        }

@app.get("/auth/student/assessment-requests")
async def get_student_assessment_requests(current_user: dict = Depends(get_current_user)):
    """Get student's assessment requests"""
    if current_user.get('role') != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their assessment requests"
        )
    
    async with db_pool.acquire() as conn:
        requests = await conn.fetch("""
            SELECT 
                ar.id,
                ar.assessment_type,
                ar.description,
                ar.priority,
                ar.due_date,
                ar.status,
                ar.requested_at,
                ar.assigned_at,
                u_lecturer.name as assigned_lecturer_name,
                u_lecturer.email as assigned_lecturer_email
            FROM assessment_requests ar
            LEFT JOIN users u_lecturer ON ar.assigned_lecturer_id = u_lecturer.id
            WHERE ar.tenant_id = $1 AND ar.student_id = $2
            ORDER BY ar.requested_at DESC
        """, current_user['tenant_id'], current_user['user_id'])
        
        result = []
        for req in requests:
            result.append({
                "id": str(req['id']),
                "assessment_type": req['assessment_type'],
                "description": req['description'],
                "priority": req['priority'],
                "due_date": req['due_date'].isoformat() if req['due_date'] else None,
                "status": req['status'],
                "requested_at": req['requested_at'].isoformat(),
                "assigned_at": req['assigned_at'].isoformat() if req['assigned_at'] else None,
                "assigned_lecturer_name": req['assigned_lecturer_name'],
                "assigned_lecturer_email": req['assigned_lecturer_email']
            })
        
        return result

@app.post("/auth/student/logbook")
async def create_logbook_entry(request: dict, current_user: dict = Depends(get_current_user)):
    """Create a daily logbook entry"""
    if current_user.get('role') != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create logbook entries"
        )
    
    entry_date = request.get('entry_date')
    title = request.get('title')
    description = request.get('description')
    activities = request.get('activities', [])
    skills_learned = request.get('skills_learned', '')
    challenges_faced = request.get('challenges_faced', '')
    supervisor_email = request.get('supervisor_email')
    hours_worked = request.get('hours_worked', 8.0)
    location = request.get('location', '')
    
    if not all([entry_date, title, description]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entry date, title, and description are required"
        )
    
    # Parse entry date
    try:
        from datetime import datetime
        entry_date_obj = datetime.fromisoformat(entry_date.replace('Z', '+00:00')).date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    async with db_pool.acquire() as conn:
        # Check if entry already exists for this date
        existing = await conn.fetchval("""
            SELECT id FROM logbook_entries 
            WHERE student_id = $1 AND entry_date = $2
        """, current_user['user_id'], entry_date_obj)
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Logbook entry already exists for this date"
            )
        
        # Get student's attachment info
        attachment_info = await conn.fetchrow("""
            SELECT a.id as attachment_id
            FROM attachments a
            JOIN users u ON a.student_id = u.id
            WHERE u.id = $1 AND a.status = 'active'
            ORDER BY a.created_at DESC
            LIMIT 1
        """, current_user['user_id'])
        
        # Create logbook entry
        entry_id = await conn.fetchval("""
            INSERT INTO logbook_entries (
                tenant_id, student_id, attachment_id, entry_date, title, description,
                activities, skills_learned, challenges_faced, supervisor_email,
                hours_worked, location, is_edited
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false)
            RETURNING id
        """, 
        current_user['tenant_id'],
        current_user['user_id'],
        attachment_info['attachment_id'] if attachment_info else None,
        entry_date_obj,
        title,
        description,
        json.dumps(activities),
        skills_learned,
        challenges_faced,
        supervisor_email,
        hours_worked,
        location
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, $2, 'user', 'Logbook Entry Created', 'logbook_entry', $3, $4)
        """, 
        current_user['tenant_id'],
        current_user['user_id'],
        entry_id,
        json.dumps({
            "entry_date": entry_date,
            "title": title,
            "hours_worked": hours_worked
        })
        )
        
        return {
            "message": "Logbook entry created successfully",
            "entry_id": str(entry_id)
        }

@app.put("/auth/student/logbook/{entry_id}")
async def update_logbook_entry(entry_id: str, request: dict, current_user: dict = Depends(get_current_user)):
    """Update a logbook entry (only once allowed)"""
    if current_user.get('role') != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update their logbook entries"
        )
    
    async with db_pool.acquire() as conn:
        # Check if entry exists and belongs to student
        entry = await conn.fetchrow("""
            SELECT id, is_edited, entry_date, title
            FROM logbook_entries 
            WHERE id = $1 AND student_id = $2 AND tenant_id = $3
        """, entry_id, current_user['user_id'], current_user['tenant_id'])
        
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logbook entry not found"
            )
        
        if entry['is_edited']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This logbook entry has already been edited once and cannot be modified again"
            )
        
        # Update entry
        title = request.get('title', entry['title'])
        description = request.get('description')
        activities = request.get('activities', [])
        skills_learned = request.get('skills_learned', '')
        challenges_faced = request.get('challenges_faced', '')
        supervisor_email = request.get('supervisor_email')
        hours_worked = request.get('hours_worked', 8.0)
        location = request.get('location', '')
        
        await conn.execute("""
            UPDATE logbook_entries 
            SET title = $1, description = $2, activities = $3, skills_learned = $4,
                challenges_faced = $5, supervisor_email = $6, hours_worked = $7,
                location = $8, is_edited = true, edited_at = NOW()
            WHERE id = $9
        """, 
        title, description, json.dumps(activities), skills_learned,
        challenges_faced, supervisor_email, hours_worked, location, entry_id
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, $2, 'user', 'Logbook Entry Updated', 'logbook_entry', $3, $4)
        """, 
        current_user['tenant_id'],
        current_user['user_id'],
        entry_id,
        json.dumps({
            "entry_date": entry['entry_date'].isoformat(),
            "title": title,
            "edited": True
        })
        )
        
        return {
            "message": "Logbook entry updated successfully"
        }

@app.get("/auth/student/logbook")
async def get_student_logbook_entries(current_user: dict = Depends(get_current_user)):
    """Get student's logbook entries"""
    if current_user.get('role') != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their logbook entries"
        )
    
    async with db_pool.acquire() as conn:
        entries = await conn.fetch("""
            SELECT 
                le.id,
                le.entry_date,
                le.title,
                le.description,
                le.activities,
                le.skills_learned,
                le.challenges_faced,
                le.supervisor_email,
                le.hours_worked,
                le.location,
                le.is_edited,
                le.edited_at,
                le.created_at,
                COUNT(lc.id) as comment_count
            FROM logbook_entries le
            LEFT JOIN logbook_comments lc ON le.id = lc.entry_id
            WHERE le.student_id = $1 AND le.tenant_id = $2
            GROUP BY le.id
            ORDER BY le.entry_date DESC
        """, current_user['user_id'], current_user['tenant_id'])
        
        result = []
        for entry in entries:
            activities = json.loads(entry['activities']) if entry['activities'] else []
            
            result.append({
                "id": str(entry['id']),
                "entry_date": entry['entry_date'].isoformat(),
                "title": entry['title'],
                "description": entry['description'],
                "activities": activities,
                "skills_learned": entry['skills_learned'],
                "challenges_faced": entry['challenges_faced'],
                "supervisor_email": entry['supervisor_email'],
                "hours_worked": float(entry['hours_worked']) if entry['hours_worked'] else 0.0,
                "location": entry['location'],
                "is_edited": entry['is_edited'],
                "edited_at": entry['edited_at'].isoformat() if entry['edited_at'] else None,
                "created_at": entry['created_at'].isoformat(),
                "comment_count": entry['comment_count']
            })
        
        return result

# Supervisor Authentication Endpoints
@app.post("/auth/supervisor/register", response_model=LoginResponse)
async def supervisor_register(register_data: SupervisorRegisterRequest):
    """Supervisor self-registration"""
    async with db_pool.acquire() as conn:
        # Check if email already exists
        existing_user = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1 AND role = 'supervisor'",
            register_data.email
        )
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create supervisor user (no tenant_id for supervisors)
        password_hash = hash_password(register_data.password)
        user_id = await conn.fetchval("""
            INSERT INTO users (email, password_hash, name, role, is_active)
            VALUES ($1, $2, $3, 'supervisor', true)
            RETURNING id
        """, register_data.email, password_hash, register_data.name)
        
        # Create supervisor profile
        await conn.execute("""
            INSERT INTO supervisor_profiles 
            (user_id, company_name, industry, position, phone, company_address, years_experience)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, user_id, register_data.company_name, register_data.industry, 
            register_data.position, register_data.phone, 
            register_data.company_address, register_data.years_experience)
        
        # Create access token
        token_data = {
            "user_id": str(user_id),
            "email": register_data.email,
            "role": "supervisor"
        }
        access_token = create_access_token(token_data)
        
        # Send welcome email
        await send_email(
            register_data.email,
            "Welcome to PractiCheck - Supervisor Account Created",
            f"Welcome {register_data.name}! Your supervisor account has been created successfully."
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(user_id),
                "email": register_data.email,
                "name": register_data.name,
                "role": "supervisor",
                "profile": {
                    "company_name": register_data.company_name,
                    "industry": register_data.industry,
                    "position": register_data.position,
                    "years_experience": register_data.years_experience
                }
            }
        )

@app.post("/auth/supervisor/login", response_model=LoginResponse)
async def supervisor_login(login_data: LoginRequest):
    """Supervisor login with email + password"""
    if not login_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    async with db_pool.acquire() as conn:
        # Get supervisor
        supervisor = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.role, u.is_active,
                   sp.company_name, sp.industry, sp.position, sp.phone, 
                   sp.company_address, sp.years_experience
            FROM users u
            JOIN supervisor_profiles sp ON u.id = sp.user_id
            WHERE u.email = $1 AND u.role = 'supervisor' AND u.is_active = true
        """, login_data.email)
        
        if not supervisor or not verify_password(login_data.password, supervisor['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            supervisor['id']
        )
        
        # Create access token
        token_data = {
            "user_id": str(supervisor['id']),
            "email": supervisor['email'],
            "role": supervisor['role']
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(supervisor['id']),
                "email": supervisor['email'],
                "name": supervisor['name'],
                "role": supervisor['role'],
                "profile": {
                    "company_name": supervisor['company_name'],
                    "industry": supervisor['industry'],
                    "position": supervisor['position'],
                    "phone": supervisor['phone'],
                    "company_address": supervisor['company_address'],
                    "years_experience": supervisor['years_experience']
                }
            }
        )

# Faculty Admin Authentication Endpoints
@app.post("/auth/faculty-admin/login", response_model=LoginResponse)
async def faculty_admin_login(login_data: LoginRequest):
    """Faculty Admin login with email + password"""
    if not login_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    async with db_pool.acquire() as conn:
        # Get faculty admin with tenant isolation
        admin = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.role, u.tenant_id, u.is_active,
                   fap.staff_id, fap.faculty, fap.phone, fap.office_location,
                   t.name as university_name, t.location as university_location
            FROM users u
            JOIN faculty_admin_profiles fap ON u.id = fap.user_id
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = $1 AND u.role = 'faculty_admin' AND u.is_active = true
        """, login_data.email)
        
        if not admin or not verify_password(login_data.password, admin['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            admin['id']
        )
        
        # Create access token with tenant information
        token_data = {
            "user_id": str(admin['id']),
            "email": admin['email'],
            "role": admin['role'],
            "tenant_id": str(admin['tenant_id'])
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(admin['id']),
                "email": admin['email'],
                "name": admin['name'],
                "role": admin['role'],
                "tenant_id": str(admin['tenant_id']),
                "university_name": admin['university_name'],
                "profile": {
                    "staff_id": admin['staff_id'],
                    "faculty": admin['faculty'],
                    "phone": admin['phone'],
                    "office_location": admin['office_location']
                }
            }
        )

# University Admin Authentication Endpoints
@app.post("/auth/university-admin/login", response_model=LoginResponse)
async def university_admin_login(login_data: LoginRequest):
    """University Admin login with email + password"""
    if not login_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    async with db_pool.acquire() as conn:
        # Get university admin with tenant isolation
        admin = await conn.fetchrow("""
            SELECT u.id, u.email, u.password_hash, u.name, u.role, u.tenant_id, u.is_active,
                   uap.staff_id, uap.phone, uap.office_location,
                   t.name as university_name, t.location as university_location
            FROM users u
            JOIN university_admin_profiles uap ON u.id = uap.user_id
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = $1 AND u.role = 'university_admin' AND u.is_active = true
        """, login_data.email)
        
        if not admin or not verify_password(login_data.password, admin['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            admin['id']
        )
        
        # Create access token with tenant information
        token_data = {
            "user_id": str(admin['id']),
            "email": admin['email'],
            "role": admin['role'],
            "tenant_id": str(admin['tenant_id'])
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(admin['id']),
                "email": admin['email'],
                "name": admin['name'],
                "role": admin['role'],
                "tenant_id": str(admin['tenant_id']),
                "university_name": admin['university_name'],
                "profile": {
                    "staff_id": admin['staff_id'],
                    "phone": admin['phone'],
                    "office_location": admin['office_location']
                }
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
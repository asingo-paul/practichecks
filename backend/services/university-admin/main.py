"""
PractiCheck University Admin API
FastAPI backend for university-specific administration
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
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
from dotenv import load_dotenv
import secrets
import string

# Load environment variables from .env file
load_dotenv("../../../.env")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

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
    logger.info("University Admin service - Database connection pool created")
    yield
    # Shutdown
    await db_pool.close()
    logger.info("University Admin service - Database connection pool closed")

# Create FastAPI app
app = FastAPI(
    title="PractiCheck University Admin API",
    description="Backend API for university-specific administration",
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
class CreateFacultyRequest(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    dean_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    admin_phone: Optional[str] = None

class FacultyResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    dean_name: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    course_count: int
    student_count: int
    lecturer_count: int
    created_at: str

class UniversityDashboardStats(BaseModel):
    total_faculties: int
    total_students: int
    total_lecturers: int
    total_courses: int
    active_attachments: int
    recent_activities: List[dict]

class FacultyAdminCredentials(BaseModel):
    email: str
    temporary_password: str
    faculty_name: str
    university_name: str

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

def generate_secure_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

async def get_current_user(token_data: dict = Depends(verify_token)) -> dict:
    """Get current university admin user"""
    async with db_pool.acquire() as conn:
        user = await conn.fetchrow("""
            SELECT u.id, u.email, u.name, u.role, u.tenant_id, t.name as university_name, t.slug
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1 AND u.is_active = true AND u.role = 'university_admin'
        """, token_data.get("user_id"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="University admin user not found"
            )
        return dict(user)

async def send_faculty_admin_email(admin_email: str, credentials: FacultyAdminCredentials) -> bool:
    """Send welcome email to faculty admin with credentials"""
    try:
        import smtplib
        from email.mime.text import MimeText
        from email.mime.multipart import MimeMultipart
        
        subject = f"Faculty Admin Access - {credentials.faculty_name}"
        
        # Email body
        body = f"""
Dear Faculty Administrator,

Your faculty admin account has been created for {credentials.faculty_name} at {credentials.university_name}.

Login Details:
- Email: {credentials.email}
- Temporary Password: {credentials.temporary_password}

Please log in and change your password immediately for security.

Best regards,
{credentials.university_name} Administration
        """
        
        # HTML version
        html_body = f"""
        <html>
        <body>
            <h2>Faculty Admin Access</h2>
            <p>Dear Faculty Administrator,</p>
            <p>Your faculty admin account has been created for <strong>{credentials.faculty_name}</strong> at <strong>{credentials.university_name}</strong>.</p>
            
            <h3>Login Details:</h3>
            <ul>
                <li><strong>Email:</strong> {credentials.email}</li>
                <li><strong>Temporary Password:</strong> <code>{credentials.temporary_password}</code></li>
            </ul>
            
            <p><strong>Important:</strong> Please log in and change your password immediately for security.</p>
            
            <p>Best regards,<br>{credentials.university_name} Administration</p>
        </body>
        </html>
        """
        
        msg = MimeMultipart('alternative')
        msg['From'] = DEFAULT_FROM_EMAIL
        msg['To'] = admin_email
        msg['Subject'] = subject

        text_part = MimeText(body, 'plain')
        html_part = MimeText(html_body, 'html')
        msg.attach(text_part)
        msg.attach(html_part)

        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        if EMAIL_USE_TLS:
            server.starttls()
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Faculty admin welcome email sent to {admin_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send faculty admin email to {admin_email}: {e}")
        return False

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PractiCheck University Admin API",
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

@app.get("/dashboard/stats", response_model=UniversityDashboardStats)
async def get_university_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get university-specific dashboard statistics"""
    tenant_id = current_user['tenant_id']
    
    async with db_pool.acquire() as conn:
        # Get basic counts
        total_faculties = await conn.fetchval(
            "SELECT COUNT(*) FROM faculties WHERE tenant_id = $1 AND is_active = true", 
            tenant_id
        ) or 0
        
        total_students = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'student' AND is_active = true", 
            tenant_id
        ) or 0
        
        total_lecturers = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'lecturer' AND is_active = true", 
            tenant_id
        ) or 0
        
        total_courses = await conn.fetchval(
            "SELECT COUNT(*) FROM courses WHERE tenant_id = $1 AND is_active = true", 
            tenant_id
        ) or 0
        
        active_attachments = await conn.fetchval(
            "SELECT COUNT(*) FROM attachments WHERE tenant_id = $1 AND status = 'active'", 
            tenant_id
        ) or 0
        
        # Get recent activities
        activities = await conn.fetch("""
            SELECT action, details, created_at
            FROM activity_logs
            WHERE tenant_id = $1
            ORDER BY created_at DESC
            LIMIT 10
        """, tenant_id)
        
        recent_activities = []
        for activity in activities:
            recent_activities.append({
                "action": activity['action'],
                "details": activity['details'],
                "time": activity['created_at'].isoformat()
            })
        
        return UniversityDashboardStats(
            total_faculties=total_faculties,
            total_students=total_students,
            total_lecturers=total_lecturers,
            total_courses=total_courses,
            active_attachments=active_attachments,
            recent_activities=recent_activities
        )

@app.post("/faculties", response_model=dict)
async def create_faculty_with_admin(
    faculty_data: CreateFacultyRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new faculty with faculty admin credentials"""
    tenant_id = current_user['tenant_id']
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Check if faculty code already exists
            existing = await conn.fetchval(
                "SELECT id FROM faculties WHERE tenant_id = $1 AND code = $2", 
                tenant_id, faculty_data.code
            )
            if existing:
                raise HTTPException(status_code=400, detail="Faculty code already exists")
            
            # Create faculty
            faculty_id = await conn.fetchval("""
                INSERT INTO faculties (tenant_id, name, code, description, dean_name, contact_email, phone, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                RETURNING id
            """, 
            tenant_id,
            faculty_data.name,
            faculty_data.code,
            faculty_data.description,
            faculty_data.dean_name,
            faculty_data.contact_email,
            faculty_data.phone
            )
            
            # Generate secure password for faculty admin
            admin_password = generate_secure_password()
            password_hash = hash_password(admin_password)
            
            # Create faculty admin user
            admin_user_id = await conn.fetchval("""
                INSERT INTO users (tenant_id, email, password_hash, name, role, faculty_id, is_active, is_password_temporary)
                VALUES ($1, $2, $3, $4, 'faculty_admin', $5, true, true)
                RETURNING id
            """, tenant_id, faculty_data.admin_email, password_hash, faculty_data.admin_name, faculty_id)
            
            # Create faculty admin profile
            await conn.execute("""
                INSERT INTO faculty_admin_profiles (user_id, staff_id, faculty, phone, office_location)
                VALUES ($1, $2, $3, $4, $5)
            """, admin_user_id, f"FA{str(faculty_id)[:8]}", faculty_data.name,
                faculty_data.admin_phone or '+254700000000', 
                f'{faculty_data.name} Office')
            
            # Prepare credentials for email
            credentials = FacultyAdminCredentials(
                email=faculty_data.admin_email,
                temporary_password=admin_password,
                faculty_name=faculty_data.name,
                university_name=current_user['university_name']
            )
            
            # Send welcome email to faculty admin
            email_sent = await send_faculty_admin_email(faculty_data.admin_email, credentials)
            
            # Log activity
            await conn.execute("""
                INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
                VALUES ($1, $2, 'user', 'Faculty Created', 'faculty', $3, $4)
            """, tenant_id, current_user['id'], faculty_id, json.dumps({
                "name": faculty_data.name,
                "code": faculty_data.code,
                "admin_email": faculty_data.admin_email,
                "admin_created": True,
                "email_sent": email_sent
            }))
            
            return {
                "message": "Faculty and admin created successfully",
                "faculty_id": str(faculty_id),
                "admin_email": faculty_data.admin_email,
                "email_sent": email_sent
            }

@app.get("/faculties", response_model=List[FacultyResponse])
async def get_university_faculties(current_user: dict = Depends(get_current_user)):
    """Get all faculties for the current university"""
    tenant_id = current_user['tenant_id']
    
    async with db_pool.acquire() as conn:
        faculties = await conn.fetch("""
            SELECT 
                f.id,
                f.name,
                f.code,
                f.description,
                f.dean_name,
                f.contact_email,
                f.phone,
                f.is_active,
                f.created_at,
                u.name as admin_name,
                u.email as admin_email,
                COALESCE(course_count.count, 0) as course_count,
                COALESCE(student_count.count, 0) as student_count,
                COALESCE(lecturer_count.count, 0) as lecturer_count
            FROM faculties f
            LEFT JOIN users u ON f.id = u.faculty_id AND u.role = 'faculty_admin' AND u.is_active = true
            LEFT JOIN (
                SELECT faculty_id, COUNT(*) as count 
                FROM courses 
                WHERE is_active = true
                GROUP BY faculty_id
            ) course_count ON f.id = course_count.faculty_id
            LEFT JOIN (
                SELECT faculty_id, COUNT(*) as count 
                FROM users 
                WHERE role = 'student' AND is_active = true
                GROUP BY faculty_id
            ) student_count ON f.id = student_count.faculty_id
            LEFT JOIN (
                SELECT faculty_id, COUNT(*) as count 
                FROM users 
                WHERE role = 'lecturer' AND is_active = true
                GROUP BY faculty_id
            ) lecturer_count ON f.id = lecturer_count.faculty_id
            WHERE f.tenant_id = $1
            ORDER BY f.created_at DESC
        """, tenant_id)
        
        result = []
        for faculty in faculties:
            result.append(FacultyResponse(
                id=str(faculty['id']),
                name=faculty['name'],
                code=faculty['code'],
                description=faculty['description'],
                dean_name=faculty['dean_name'],
                contact_email=faculty['contact_email'],
                phone=faculty['phone'],
                is_active=faculty['is_active'],
                admin_name=faculty['admin_name'],
                admin_email=faculty['admin_email'],
                course_count=faculty['course_count'],
                student_count=faculty['student_count'],
                lecturer_count=faculty['lecturer_count'],
                created_at=faculty['created_at'].isoformat()
            ))
        
        return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )
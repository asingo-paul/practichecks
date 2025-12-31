"""
PractiCheck Faculty Admin API
FastAPI backend for faculty-specific administration
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
    logger.info("Faculty Admin service - Database connection pool created")
    yield
    # Shutdown
    await db_pool.close()
    logger.info("Faculty Admin service - Database connection pool closed")

# Create FastAPI app
app = FastAPI(
    title="PractiCheck Faculty Admin API",
    description="Backend API for faculty-specific administration",
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
class CreateCourseRequest(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    credits: Optional[int] = 3
    semester: Optional[str] = None
    year: Optional[int] = None

class CourseResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    credits: int
    semester: Optional[str] = None
    year: Optional[int] = None
    is_active: bool
    student_count: int
    lecturer_count: int
    created_at: str

class CreateLecturerRequest(BaseModel):
    name: str
    email: EmailStr
    staff_id: str
    phone: Optional[str] = None
    office_location: Optional[str] = None
    specialization: Optional[str] = None
    max_students: Optional[int] = 20

class LecturerResponse(BaseModel):
    id: str
    name: str
    email: str
    staff_id: str
    phone: Optional[str] = None
    office_location: Optional[str] = None
    specialization: Optional[str] = None
    max_students: int
    current_students: int
    workload_percentage: float
    is_active: bool
    created_at: str

class FacultyDashboardStats(BaseModel):
    total_courses: int
    total_students: int
    total_lecturers: int
    active_assessments: int
    pending_assignments: int
    recent_activities: List[dict]

class AssessmentRequestResponse(BaseModel):
    id: str
    student_name: str
    student_email: str
    course_name: str
    assessment_type: str
    description: Optional[str] = None
    priority: str
    due_date: Optional[str] = None
    status: str
    requested_at: str

class AssignLecturerRequest(BaseModel):
    lecturer_id: str
    notes: Optional[str] = None

class LecturerCredentials(BaseModel):
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
    """Get current faculty admin user"""
    async with db_pool.acquire() as conn:
        user = await conn.fetchrow("""
            SELECT u.id, u.email, u.name, u.role, u.tenant_id, u.faculty_id, 
                   t.name as university_name, t.slug, f.name as faculty_name
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            JOIN faculties f ON u.faculty_id = f.id
            WHERE u.id = $1 AND u.is_active = true AND u.role = 'faculty_admin'
        """, token_data.get("user_id"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Faculty admin user not found"
            )
        return dict(user)

async def send_lecturer_email(lecturer_email: str, credentials: LecturerCredentials) -> bool:
    """Send welcome email to lecturer with credentials"""
    try:
        import smtplib
        from email.mime.text import MimeText
        from email.mime.multipart import MimeMultipart
        
        subject = f"Lecturer Account Created - {credentials.faculty_name}"
        
        # Email body
        body = f"""
Dear Lecturer,

Your lecturer account has been created for {credentials.faculty_name} at {credentials.university_name}.

Login Details:
- Email: {credentials.email}
- Temporary Password: {credentials.temporary_password}

IMPORTANT: Please log in and change your password immediately for security.
You will be prompted to create a new password on your first login.

Best regards,
{credentials.faculty_name} Administration
        """
        
        # HTML version
        html_body = f"""
        <html>
        <body>
            <h2>Lecturer Account Created</h2>
            <p>Dear Lecturer,</p>
            <p>Your lecturer account has been created for <strong>{credentials.faculty_name}</strong> at <strong>{credentials.university_name}</strong>.</p>
            
            <h3>Login Details:</h3>
            <ul>
                <li><strong>Email:</strong> {credentials.email}</li>
                <li><strong>Temporary Password:</strong> <code>{credentials.temporary_password}</code></li>
            </ul>
            
            <p><strong>IMPORTANT:</strong> Please log in and change your password immediately for security.</p>
            <p>You will be prompted to create a new password on your first login.</p>
            
            <p>Best regards,<br>{credentials.faculty_name} Administration</p>
        </body>
        </html>
        """
        
        msg = MimeMultipart('alternative')
        msg['From'] = DEFAULT_FROM_EMAIL
        msg['To'] = lecturer_email
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
        
        logger.info(f"Lecturer welcome email sent to {lecturer_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send lecturer email to {lecturer_email}: {e}")
        return False

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PractiCheck Faculty Admin API",
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

@app.get("/dashboard/stats", response_model=FacultyDashboardStats)
async def get_faculty_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get faculty-specific dashboard statistics"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        # Get basic counts
        total_courses = await conn.fetchval(
            "SELECT COUNT(*) FROM courses WHERE tenant_id = $1 AND faculty_id = $2 AND is_active = true", 
            tenant_id, faculty_id
        ) or 0
        
        total_students = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND faculty_id = $2 AND role = 'student' AND is_active = true", 
            tenant_id, faculty_id
        ) or 0
        
        total_lecturers = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND faculty_id = $2 AND role = 'lecturer' AND is_active = true", 
            tenant_id, faculty_id
        ) or 0
        
        active_assessments = await conn.fetchval(
            "SELECT COUNT(*) FROM assessment_requests WHERE tenant_id = $1 AND faculty_id = $2 AND status IN ('pending', 'assigned')", 
            tenant_id, faculty_id
        ) or 0
        
        pending_assignments = await conn.fetchval(
            "SELECT COUNT(*) FROM assessment_requests WHERE tenant_id = $1 AND faculty_id = $2 AND status = 'pending'", 
            tenant_id, faculty_id
        ) or 0
        
        # Get recent activities
        activities = await conn.fetch("""
            SELECT action, details, created_at
            FROM activity_logs
            WHERE tenant_id = $1 AND details::text LIKE '%faculty_id": "' || $2 || '"%'
            ORDER BY created_at DESC
            LIMIT 10
        """, tenant_id, str(faculty_id))
        
        recent_activities = []
        for activity in activities:
            recent_activities.append({
                "action": activity['action'],
                "details": activity['details'],
                "time": activity['created_at'].isoformat()
            })
        
        return FacultyDashboardStats(
            total_courses=total_courses,
            total_students=total_students,
            total_lecturers=total_lecturers,
            active_assessments=active_assessments,
            pending_assignments=pending_assignments,
            recent_activities=recent_activities
        )

@app.post("/courses", response_model=dict)
async def create_course(
    course_data: CreateCourseRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new course in the faculty"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Check if course code already exists in faculty
            existing = await conn.fetchval(
                "SELECT id FROM courses WHERE tenant_id = $1 AND faculty_id = $2 AND code = $3", 
                tenant_id, faculty_id, course_data.code
            )
            if existing:
                raise HTTPException(status_code=400, detail="Course code already exists in this faculty")
            
            # Create course
            course_id = await conn.fetchval("""
                INSERT INTO courses (tenant_id, faculty_id, name, code, description, credits, semester, year, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                RETURNING id
            """, 
            tenant_id,
            faculty_id,
            course_data.name,
            course_data.code,
            course_data.description,
            course_data.credits,
            course_data.semester,
            course_data.year
            )
            
            # Log activity
            await conn.execute("""
                INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
                VALUES ($1, $2, 'user', 'Course Created', 'course', $3, $4)
            """, tenant_id, current_user['id'], course_id, json.dumps({
                "name": course_data.name,
                "code": course_data.code,
                "faculty_id": str(faculty_id)
            }))
            
            return {
                "message": "Course created successfully",
                "course_id": str(course_id)
            }

@app.get("/courses", response_model=List[CourseResponse])
async def get_faculty_courses(current_user: dict = Depends(get_current_user)):
    """Get all courses for the current faculty"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        courses = await conn.fetch("""
            SELECT 
                c.id,
                c.name,
                c.code,
                c.description,
                c.credits,
                c.semester,
                c.year,
                c.is_active,
                c.created_at,
                COALESCE(student_count.count, 0) as student_count,
                COALESCE(lecturer_count.count, 0) as lecturer_count
            FROM courses c
            LEFT JOIN (
                SELECT course_id, COUNT(*) as count 
                FROM student_profiles sp
                JOIN users u ON sp.user_id = u.id
                WHERE u.is_active = true
                GROUP BY course_id
            ) student_count ON c.id = student_count.course_id
            LEFT JOIN (
                SELECT course_id, COUNT(DISTINCT lecturer_id) as count 
                FROM student_lecturer_assignments sla
                WHERE sla.status = 'active'
                GROUP BY course_id
            ) lecturer_count ON c.id = lecturer_count.course_id
            WHERE c.tenant_id = $1 AND c.faculty_id = $2
            ORDER BY c.created_at DESC
        """, tenant_id, faculty_id)
        
        result = []
        for course in courses:
            result.append(CourseResponse(
                id=str(course['id']),
                name=course['name'],
                code=course['code'],
                description=course['description'],
                credits=course['credits'],
                semester=course['semester'],
                year=course['year'],
                is_active=course['is_active'],
                student_count=course['student_count'],
                lecturer_count=course['lecturer_count'],
                created_at=course['created_at'].isoformat()
            ))
        
        return result

@app.post("/lecturers", response_model=dict)
async def create_lecturer(
    lecturer_data: CreateLecturerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new lecturer account with one-time password"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Check if email already exists
            existing = await conn.fetchval(
                "SELECT id FROM users WHERE email = $1", 
                lecturer_data.email
            )
            if existing:
                raise HTTPException(status_code=400, detail="Email already exists")
            
            # Check if staff ID already exists in faculty
            existing_staff = await conn.fetchval("""
                SELECT u.id FROM users u
                JOIN lecturer_profiles lp ON u.id = lp.user_id
                WHERE u.tenant_id = $1 AND u.faculty_id = $2 AND lp.staff_id = $3
            """, tenant_id, faculty_id, lecturer_data.staff_id)
            if existing_staff:
                raise HTTPException(status_code=400, detail="Staff ID already exists in this faculty")
            
            # Generate secure password for lecturer
            lecturer_password = generate_secure_password()
            password_hash = hash_password(lecturer_password)
            
            # Create lecturer user
            lecturer_user_id = await conn.fetchval("""
                INSERT INTO users (tenant_id, email, password_hash, name, role, faculty_id, is_active, is_password_temporary)
                VALUES ($1, $2, $3, $4, 'lecturer', $5, true, true)
                RETURNING id
            """, tenant_id, lecturer_data.email, password_hash, lecturer_data.name, faculty_id)
            
            # Create lecturer profile
            await conn.execute("""
                INSERT INTO lecturer_profiles (user_id, staff_id, phone, office_location, specialization, max_students, current_students)
                VALUES ($1, $2, $3, $4, $5, $6, 0)
            """, lecturer_user_id, lecturer_data.staff_id, 
                lecturer_data.phone or '+254700000000',
                lecturer_data.office_location or f'{current_user["faculty_name"]} Office',
                lecturer_data.specialization,
                lecturer_data.max_students or 20)
            
            # Prepare credentials for email
            credentials = LecturerCredentials(
                email=lecturer_data.email,
                temporary_password=lecturer_password,
                faculty_name=current_user['faculty_name'],
                university_name=current_user['university_name']
            )
            
            # Send welcome email to lecturer
            email_sent = await send_lecturer_email(lecturer_data.email, credentials)
            
            # Log activity
            await conn.execute("""
                INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
                VALUES ($1, $2, 'user', 'Lecturer Created', 'lecturer', $3, $4)
            """, tenant_id, current_user['id'], lecturer_user_id, json.dumps({
                "name": lecturer_data.name,
                "email": lecturer_data.email,
                "staff_id": lecturer_data.staff_id,
                "faculty_id": str(faculty_id),
                "email_sent": email_sent
            }))
            
            return {
                "message": "Lecturer created successfully",
                "lecturer_id": str(lecturer_user_id),
                "email_sent": email_sent
            }

@app.get("/lecturers", response_model=List[LecturerResponse])
async def get_faculty_lecturers(current_user: dict = Depends(get_current_user)):
    """Get all lecturers for the current faculty with workload information"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        lecturers = await conn.fetch("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.is_active,
                u.created_at,
                lp.staff_id,
                lp.phone,
                lp.office_location,
                lp.specialization,
                lp.max_students,
                lp.current_students
            FROM users u
            JOIN lecturer_profiles lp ON u.id = lp.user_id
            WHERE u.tenant_id = $1 AND u.faculty_id = $2 AND u.role = 'lecturer'
            ORDER BY u.created_at DESC
        """, tenant_id, faculty_id)
        
        result = []
        for lecturer in lecturers:
            # Calculate workload percentage
            max_students = lecturer['max_students'] or 20
            current_students = lecturer['current_students'] or 0
            workload_percentage = (current_students / max_students) * 100 if max_students > 0 else 0
            
            result.append(LecturerResponse(
                id=str(lecturer['id']),
                name=lecturer['name'],
                email=lecturer['email'],
                staff_id=lecturer['staff_id'],
                phone=lecturer['phone'],
                office_location=lecturer['office_location'],
                specialization=lecturer['specialization'],
                max_students=max_students,
                current_students=current_students,
                workload_percentage=round(workload_percentage, 1),
                is_active=lecturer['is_active'],
                created_at=lecturer['created_at'].isoformat()
            ))
        
        return result

@app.get("/assessment-requests", response_model=List[AssessmentRequestResponse])
async def get_assessment_requests(current_user: dict = Depends(get_current_user)):
    """Get all assessment requests for the faculty"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
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
                u.name as student_name,
                u.email as student_email,
                c.name as course_name
            FROM assessment_requests ar
            JOIN users u ON ar.student_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN courses c ON sp.course_id = c.id
            WHERE ar.tenant_id = $1 AND ar.faculty_id = $2
            ORDER BY 
                CASE ar.priority 
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                END,
                ar.requested_at DESC
        """, tenant_id, faculty_id)
        
        result = []
        for request in requests:
            result.append(AssessmentRequestResponse(
                id=str(request['id']),
                student_name=request['student_name'],
                student_email=request['student_email'],
                course_name=request['course_name'] or "Not specified",
                assessment_type=request['assessment_type'],
                description=request['description'],
                priority=request['priority'],
                due_date=request['due_date'].isoformat() if request['due_date'] else None,
                status=request['status'],
                requested_at=request['requested_at'].isoformat()
            ))
        
        return result

@app.post("/assessment-requests/{request_id}/assign", response_model=dict)
async def assign_lecturer_to_assessment(
    request_id: str,
    assignment_data: AssignLecturerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Assign a lecturer to an assessment request"""
    tenant_id = current_user['tenant_id']
    faculty_id = current_user['faculty_id']
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Verify assessment request exists and belongs to faculty
            request_info = await conn.fetchrow("""
                SELECT ar.*, u.name as student_name
                FROM assessment_requests ar
                JOIN users u ON ar.student_id = u.id
                WHERE ar.id = $1 AND ar.tenant_id = $2 AND ar.faculty_id = $3
            """, request_id, tenant_id, faculty_id)
            
            if not request_info:
                raise HTTPException(status_code=404, detail="Assessment request not found")
            
            if request_info['status'] != 'pending':
                raise HTTPException(status_code=400, detail="Assessment request is not pending")
            
            # Verify lecturer exists and belongs to faculty
            lecturer_info = await conn.fetchrow("""
                SELECT u.*, lp.max_students, lp.current_students
                FROM users u
                JOIN lecturer_profiles lp ON u.id = lp.user_id
                WHERE u.id = $1 AND u.tenant_id = $2 AND u.faculty_id = $3 AND u.role = 'lecturer' AND u.is_active = true
            """, assignment_data.lecturer_id, tenant_id, faculty_id)
            
            if not lecturer_info:
                raise HTTPException(status_code=404, detail="Lecturer not found")
            
            # Check lecturer workload
            max_students = lecturer_info['max_students'] or 20
            current_students = lecturer_info['current_students'] or 0
            
            if current_students >= max_students:
                raise HTTPException(status_code=400, detail="Lecturer has reached maximum student capacity")
            
            # Update assessment request
            await conn.execute("""
                UPDATE assessment_requests 
                SET assigned_lecturer_id = $1, assigned_at = NOW(), status = 'assigned'
                WHERE id = $2
            """, assignment_data.lecturer_id, request_id)
            
            # Create student-lecturer assignment
            await conn.execute("""
                INSERT INTO student_lecturer_assignments (tenant_id, student_id, lecturer_id, faculty_id, assignment_type, assigned_by, status)
                VALUES ($1, $2, $3, $4, 'assessment', $5, 'active')
                ON CONFLICT (tenant_id, student_id, lecturer_id, assignment_type) 
                DO UPDATE SET status = 'active', assigned_by = $5
            """, tenant_id, request_info['student_id'], assignment_data.lecturer_id, faculty_id, current_user['id'])
            
            # Update lecturer current students count
            await conn.execute("""
                UPDATE lecturer_profiles 
                SET current_students = (
                    SELECT COUNT(DISTINCT student_id) 
                    FROM student_lecturer_assignments 
                    WHERE lecturer_id = $1 AND status = 'active'
                )
                WHERE user_id = $1
            """, assignment_data.lecturer_id)
            
            # Create notification for lecturer
            await conn.execute("""
                INSERT INTO notifications (tenant_id, user_id, type, title, message, data)
                VALUES ($1, $2, 'assignment', 'New Student Assignment', $3, $4)
            """, tenant_id, assignment_data.lecturer_id,
                f"You have been assigned to assess {request_info['student_name']} for {request_info['assessment_type']}",
                json.dumps({
                    "assessment_request_id": str(request_id),
                    "student_id": str(request_info['student_id']),
                    "assessment_type": request_info['assessment_type']
                }))
            
            # Log activity
            await conn.execute("""
                INSERT INTO activity_logs (tenant_id, user_id, user_type, action, target_type, target_id, details)
                VALUES ($1, $2, 'user', 'Lecturer Assigned', 'assessment_request', $3, $4)
            """, tenant_id, current_user['id'], request_id, json.dumps({
                "lecturer_id": assignment_data.lecturer_id,
                "lecturer_name": lecturer_info['name'],
                "student_name": request_info['student_name'],
                "assessment_type": request_info['assessment_type'],
                "notes": assignment_data.notes
            }))
            
            return {
                "message": "Lecturer assigned successfully",
                "lecturer_name": lecturer_info['name'],
                "student_name": request_info['student_name']
            }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )
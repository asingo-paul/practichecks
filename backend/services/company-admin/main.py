"""
PractiCheck Company Admin API
FastAPI backend for company dashboard management
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
    logger.info("Database connection pool created")
    yield
    # Shutdown
    await db_pool.close()
    logger.info("Database connection pool closed")

# Create FastAPI app
app = FastAPI(
    title="PractiCheck Company Admin API",
    description="Backend API for PractiCheck company dashboard",
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
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class DashboardStats(BaseModel):
    total_universities: int = Field(alias="totalUniversities")
    active_students: int = Field(alias="activeStudents")
    active_attachments: int = Field(alias="activeAttachments")
    monthly_revenue: float = Field(alias="monthlyRevenue")
    system_health: float = Field(alias="systemHealth")
    monthly_growth: dict = Field(alias="monthlyGrowth")
    
    class Config:
        validate_by_name = True
        by_alias = True

class University(BaseModel):
    id: str
    name: str
    location: str
    plan: str
    status: str
    health: float
    students: int
    attachments: int
    faculties: int
    monthly_fee: float
    last_sync: str

class SystemAlert(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    message: str
    time: str
    is_dismissed: bool

class SystemMetrics(BaseModel):
    cpu_usage: float = Field(alias="cpuUsage")
    memory_usage: float = Field(alias="memoryUsage")
    disk_usage: float = Field(alias="diskUsage")
    network_traffic: float = Field(alias="networkTraffic")
    active_connections: int = Field(alias="activeConnections")
    response_time: float = Field(alias="responseTime")
    
    class Config:
        validate_by_name = True
        by_alias = True

class BillingHistory(BaseModel):
    id: str
    invoice_number: str = Field(alias="invoiceNumber")
    date: str
    due_date: str = Field(alias="dueDate")
    amount: float
    status: str
    description: str
    paid_date: Optional[str] = Field(alias="paidDate")
    
    class Config:
        validate_by_name = True
        by_alias = True

class UniversityBilling(BaseModel):
    id: str
    name: str
    location: str
    plan: str
    monthly_fee: float = Field(alias="monthlyFee")
    status: str
    total_paid: float = Field(alias="totalPaid")
    outstanding_amount: float = Field(alias="outstandingAmount")
    next_billing_date: str = Field(alias="nextBillingDate")
    contact_email: str = Field(alias="contactEmail")
    billing_address: str = Field(alias="billingAddress")
    billing_history: List[BillingHistory] = Field(alias="billingHistory")
    
    class Config:
        validate_by_name = True
        by_alias = True

class BillingUniversitySummary(BaseModel):
    id: str
    name: str
    location: str
    plan: str
    monthly_fee: float = Field(alias="monthlyFee")
    status: str
    last_billing_date: str = Field(alias="lastBillingDate")
    next_billing_date: str = Field(alias="nextBillingDate")
    total_paid: float = Field(alias="totalPaid")
    outstanding_amount: float = Field(alias="outstandingAmount")
    invoice_count: int = Field(alias="invoiceCount")
    
    class Config:
        validate_by_name = True
        by_alias = True

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

def validate_uuid(uuid_string: str) -> str:
    """Validate and return UUID string"""
    try:
        uuid.UUID(uuid_string)
        return uuid_string
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """Send email using SMTP - simplified version"""
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

def generate_invoice_html(university: dict, invoice_data: dict) -> str:
    """Generate HTML invoice"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .invoice-details {{ margin-bottom: 20px; }}
            .table {{ width: 100%; border-collapse: collapse; }}
            .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            .table th {{ background-color: #f2f2f2; }}
            .total {{ font-weight: bold; font-size: 18px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>PractiCheck Invoice</h1>
            <p>University Attachment Platform</p>
        </div>
        
        <div class="invoice-details">
            <p><strong>Invoice #:</strong> {invoice_data['invoice_number']}</p>
            <p><strong>Date:</strong> {invoice_data['date']}</p>
            <p><strong>Due Date:</strong> {invoice_data['due_date']}</p>
        </div>
        
        <div class="invoice-details">
            <h3>Bill To:</h3>
            <p><strong>{university['name']}</strong></p>
            <p>{university['location']}</p>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Monthly Subscription - {university['plan']} Plan</td>
                    <td>1</td>
                    <td>${university['monthly_fee']:.2f}</td>
                    <td>${university['monthly_fee']:.2f}</td>
                </tr>
            </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
            <p class="total">Total: ${university['monthly_fee']:.2f}</p>
        </div>
        
        <div style="margin-top: 30px;">
            <p>Thank you for using PractiCheck!</p>
            <p>For questions about this invoice, please contact support@practicheck.com</p>
        </div>
    </body>
    </html>
    """
async def get_current_user(token_data: dict = Depends(verify_token)) -> dict:
    async with db_pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT id, email, name, role FROM admin_users WHERE id = $1 AND is_active = true",
            token_data.get("user_id")
        )
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
        "message": "PractiCheck Company Admin API",
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

@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Authenticate admin user and return JWT token"""
    async with db_pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT id, email, password_hash, name, role FROM admin_users WHERE email = $1 AND is_active = true",
            login_data.email
        )
        
        if not user or not verify_password(login_data.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await conn.execute(
            "UPDATE admin_users SET last_login = NOW() WHERE id = $1",
            user['id']
        )
        
        # Create access token
        token_data = {"user_id": str(user['id']), "email": user['email'], "role": user['role']}
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(user['id']),
                "email": user['email'],
                "name": user['name'],
                "role": user['role']
            }
        )

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (invalidate session)"""
    # In a production system, you might want to blacklist the token
    # For now, we'll just return success and let the frontend handle token removal
    return {"message": "Logged out successfully"}

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    async with db_pool.acquire() as conn:
        # Get basic counts
        total_universities = await conn.fetchval("SELECT COUNT(*) FROM tenants WHERE status = 'active'") or 0
        active_students = await conn.fetchval("SELECT COUNT(*) FROM students") or 0
        active_attachments = await conn.fetchval("SELECT COUNT(*) FROM attachments WHERE status = 'active'") or 0
        
        # Calculate monthly revenue
        monthly_revenue = await conn.fetchval("SELECT SUM(monthly_fee) FROM tenants WHERE status = 'active'") or 0.0
        
        # Calculate system health (average of all tenant health scores)
        system_health = await conn.fetchval("SELECT AVG(health_score) FROM tenants WHERE status = 'active'") or 100.0
        
        # Mock growth data (in real implementation, calculate from historical data)
        monthly_growth = {
            "universities": 12.5,
            "students": 23.8,
            "attachments": 18.2,
            "revenue": 15.3
        }
        
        return DashboardStats(
            total_universities=total_universities,
            active_students=active_students,
            active_attachments=active_attachments,
            monthly_revenue=float(monthly_revenue),
            system_health=float(system_health),
            monthly_growth=monthly_growth
        )

@app.get("/universities/public", response_model=List[dict])
async def get_public_universities():
    """Get public university information for navbar"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT 
                t.id,
                t.name,
                t.location,
                COALESCE(student_count.count, 0) as students
            FROM tenants t
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM students 
                GROUP BY tenant_id
            ) student_count ON t.id = student_count.tenant_id
            WHERE t.status = 'active'
            ORDER BY t.name
            LIMIT 10
        """)
        
        result = []
        for uni in universities:
            result.append({
                "id": str(uni['id']),
                "name": uni['name'],
                "location": uni['location'] or "Not specified",
                "students": uni['students']
            })
        
        return result
async def get_universities(current_user: dict = Depends(get_current_user)):
    """Get all universities"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT 
                t.id,
                t.name,
                t.location,
                sp.name as plan,
                t.status,
                t.health_score,
                t.monthly_fee,
                t.last_sync,
                COALESCE(student_count.count, 0) as students,
                COALESCE(attachment_count.count, 0) as attachments,
                COALESCE(faculty_count.count, 0) as faculties
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM students 
                GROUP BY tenant_id
            ) student_count ON t.id = student_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM attachments 
                WHERE status = 'active'
                GROUP BY tenant_id
            ) attachment_count ON t.id = attachment_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(DISTINCT faculty) as count 
                FROM students 
                WHERE faculty IS NOT NULL
                GROUP BY tenant_id
            ) faculty_count ON t.id = faculty_count.tenant_id
            ORDER BY t.created_at DESC
        """)
        
        result = []
        for uni in universities:
            # Calculate time since last sync
            if uni['last_sync']:
                time_diff = datetime.now(timezone.utc) - uni['last_sync']
                if time_diff.total_seconds() < 300:  # 5 minutes
                    last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
                elif time_diff.total_seconds() < 3600:  # 1 hour
                    last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
                else:
                    last_sync = f"{int(time_diff.total_seconds() // 3600)} hours ago"
            else:
                last_sync = "Never"
            
            result.append(University(
                id=str(uni['id']),
                name=uni['name'],
                location=uni['location'] or "Not specified",
                plan=uni['plan'] or "Standard",
                status=uni['status'],
                health=float(uni['health_score'] or 100.0),
                students=uni['students'],
                attachments=uni['attachments'],
                faculties=uni['faculties'],
                monthly_fee=float(uni['monthly_fee'] or 0.0),
                last_sync=last_sync
            ))
        
        return result

@app.get("/dashboard/alerts", response_model=List[SystemAlert])
async def get_system_alerts(current_user: dict = Depends(get_current_user)):
    """Get system alerts"""
    async with db_pool.acquire() as conn:
        alerts = await conn.fetch("""
            SELECT id, type, severity, title, message, is_dismissed, created_at
            FROM system_alerts
            WHERE is_dismissed = false
            ORDER BY 
                CASE severity 
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                created_at DESC
            LIMIT 10
        """)
        
        result = []
        for alert in alerts:
            # Calculate time ago
            time_diff = datetime.now(timezone.utc) - alert['created_at']
            if time_diff.total_seconds() < 3600:  # Less than 1 hour
                time_ago = f"{int(time_diff.total_seconds() // 60)} minutes ago"
            elif time_diff.total_seconds() < 86400:  # Less than 1 day
                time_ago = f"{int(time_diff.total_seconds() // 3600)} hours ago"
            else:
                time_ago = f"{int(time_diff.total_seconds() // 86400)} days ago"
            
            result.append(SystemAlert(
                id=str(alert['id']),
                type=alert['type'],
                severity=alert['severity'],
                title=alert['title'],
                message=alert['message'],
                time=time_ago,
                is_dismissed=alert['is_dismissed']
            ))
        
        return result

@app.delete("/dashboard/alerts/{alert_id}")
async def dismiss_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Dismiss a system alert"""
    async with db_pool.acquire() as conn:
        result = await conn.execute("""
            UPDATE system_alerts 
            SET is_dismissed = true, dismissed_by = $1, dismissed_at = NOW()
            WHERE id = $2
        """, current_user['id'], alert_id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert dismissed successfully"}

@app.get("/dashboard/metrics", response_model=SystemMetrics)
async def get_system_metrics(current_user: dict = Depends(get_current_user)):
    """Get system performance metrics"""
    # In a real implementation, these would come from monitoring systems
    # For now, return mock data with some variation
    import random
    
    return SystemMetrics(
        cpu_usage=round(random.uniform(45, 85), 1),
        memory_usage=round(random.uniform(50, 90), 1),
        disk_usage=round(random.uniform(30, 70), 1),
        network_traffic=round(random.uniform(0.8, 2.5), 1),
        active_connections=random.randint(800, 1500),
        response_time=random.randint(80, 200)
    )

@app.get("/dashboard/universities", response_model=List[University])
async def get_universities(current_user: dict = Depends(get_current_user)):
    """Get all universities"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT 
                t.id,
                t.name,
                t.location,
                sp.name as plan,
                t.status,
                t.health_score,
                t.monthly_fee,
                t.last_sync,
                COALESCE(student_count.count, 0) as students,
                COALESCE(attachment_count.count, 0) as attachments,
                COALESCE(faculty_count.count, 0) as faculties
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM students 
                GROUP BY tenant_id
            ) student_count ON t.id = student_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM attachments 
                WHERE status = 'active'
                GROUP BY tenant_id
            ) attachment_count ON t.id = attachment_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(DISTINCT faculty) as count 
                FROM students 
                WHERE faculty IS NOT NULL
                GROUP BY tenant_id
            ) faculty_count ON t.id = faculty_count.tenant_id
            ORDER BY t.created_at DESC
        """)
        
        result = []
        for uni in universities:
            # Calculate time since last sync
            if uni['last_sync']:
                time_diff = datetime.now(timezone.utc) - uni['last_sync']
                if time_diff.total_seconds() < 300:  # 5 minutes
                    last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
                elif time_diff.total_seconds() < 3600:  # 1 hour
                    last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
                else:
                    last_sync = f"{int(time_diff.total_seconds() // 3600)} hours ago"
            else:
                last_sync = "Never"
            
            result.append(University(
                id=str(uni['id']),
                name=uni['name'],
                location=uni['location'] or "Not specified",
                plan=uni['plan'] or "Standard",
                status=uni['status'],
                health=float(uni['health_score'] or 100.0),
                students=uni['students'],
                attachments=uni['attachments'],
                faculties=uni['faculties'],
                monthly_fee=float(uni['monthly_fee'] or 0.0),
                last_sync=last_sync
            ))
        
        return result

@app.patch("/dashboard/universities/{university_id}/status")
async def update_university_status(
    university_id: str,
    status_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update university status (pause, start, restart)"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        action = status_data.get('action')
        
        if action == 'pause':
            new_status = 'maintenance'
        elif action == 'start':
            new_status = 'active'
        elif action == 'restart':
            new_status = 'active'
            # In a real system, this would trigger a restart process
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        result = await conn.execute("""
            UPDATE tenants 
            SET status = $1, last_sync = NOW()
            WHERE id = $2
        """, new_status, university_id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="University not found")
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', $2, 'tenant', $3, $4)
        """, current_user['id'], f"University {action.title()}", university_id, 
            json.dumps({"action": action, "new_status": new_status}))
        
        return {"message": f"University {action} successful", "new_status": new_status}

@app.get("/dashboard/universities/{university_id}")
async def get_university_details(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed university information"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        university = await conn.fetchrow("""
            SELECT 
                t.*,
                sp.name as plan_name,
                COALESCE(student_count.count, 0) as students,
                COALESCE(attachment_count.count, 0) as attachments,
                COALESCE(faculty_count.count, 0) as faculties
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM students 
                GROUP BY tenant_id
            ) student_count ON t.id = student_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM attachments 
                WHERE status = 'active'
                GROUP BY tenant_id
            ) attachment_count ON t.id = attachment_count.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(DISTINCT faculty) as count 
                FROM students 
                WHERE faculty IS NOT NULL
                GROUP BY tenant_id
            ) faculty_count ON t.id = faculty_count.tenant_id
            WHERE t.id = $1
        """, university_id)
        
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Get recent activities
        activities = await conn.fetch("""
            SELECT action, details, created_at
            FROM activity_logs
            WHERE target_id = $1 AND target_type = 'tenant'
            ORDER BY created_at DESC
            LIMIT 10
        """, university_id)
        
        # Calculate time since last sync
        last_sync = "Never"
        if university['last_sync']:
            time_diff = datetime.now(timezone.utc) - university['last_sync']
            if time_diff.total_seconds() < 300:  # 5 minutes
                last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
            elif time_diff.total_seconds() < 3600:  # 1 hour
                last_sync = f"{int(time_diff.total_seconds() // 60)} minutes ago"
            else:
                last_sync = f"{int(time_diff.total_seconds() // 3600)} hours ago"
        # Parse settings JSON if it exists
        settings = {}
        if university['settings']:
            try:
                if isinstance(university['settings'], str):
                    settings = json.loads(university['settings'])
                else:
                    settings = university['settings']
            except (json.JSONDecodeError, TypeError):
                settings = {}
        
        return {
            "id": str(university['id']),
            "name": university['name'],
            "location": university['location'] or "Not specified",
            "plan": university['plan_name'] or "Standard",
            "status": university['status'],
            "health": float(university['health_score'] or 100.0),
            "students": university['students'],
            "attachments": university['attachments'],
            "faculties": university['faculties'],
            "monthly_fee": float(university['monthly_fee'] or 0.0),
            "last_sync": last_sync,
            "created_at": university['created_at'].isoformat(),
            "settings": settings,
            "recent_activities": [
                {
                    "action": activity['action'],
                    "details": activity['details'],
                    "time": activity['created_at'].isoformat()
                } for activity in activities
            ]
        }

@app.put("/dashboard/universities/{university_id}")
async def update_university(
    university_id: str,
    university_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update university information"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        result = await conn.execute("""
            UPDATE tenants 
            SET name = $1, location = $2, monthly_fee = $3
            WHERE id = $4
        """, 
        university_data.get('name'),
        university_data.get('location'),
        university_data.get('monthly_fee'),
        university_id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="University not found")
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'University Updated', 'tenant', $2, $3)
        """, current_user['id'], university_id, json.dumps({
            "name": university_data.get("name"), 
            "location": university_data.get("location"), 
            "monthly_fee": university_data.get("monthly_fee")
        }))
        
        return {"message": "University updated successfully"}

@app.post("/dashboard/universities")
async def create_university(
    university_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Create a new university tenant"""
    async with db_pool.acquire() as conn:
        # Get default plan
        plan = await conn.fetchrow("SELECT id FROM subscription_plans WHERE name = 'Standard'")
        
        university_id = await conn.fetchval("""
            INSERT INTO tenants (name, location, plan_id, monthly_fee)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        """, 
        university_data.get('name'),
        university_data.get('location'),
        plan['id'],
        university_data.get('monthly_fee', 1200.00)
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'University Created', 'tenant', $2, $3)
        """, current_user['id'], university_id, json.dumps({"name": university_data.get("name")}))
        
        return {"message": "University created successfully", "id": str(university_id)}

@app.post("/dashboard/universities")
async def create_university(
    university_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Create a new university tenant"""
    async with db_pool.acquire() as conn:
        # Get default plan
        plan = await conn.fetchrow("SELECT id FROM subscription_plans WHERE name = 'Standard'")
        
        university_id = await conn.fetchval("""
            INSERT INTO tenants (name, location, plan_id, monthly_fee)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        """, 
        university_data.get('name'),
        university_data.get('location'),
        plan['id'],
        university_data.get('monthly_fee', 1200.00)
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'University Created', 'tenant', $2, $3)
        """, current_user['id'], university_id, json.dumps({"name": university_data.get("name")}))
        
        return {"message": "University created successfully", "id": str(university_id)}

# Billing endpoints
@app.get("/billing/universities")
async def get_billing_universities(current_user: dict = Depends(get_current_user)):
    """Get universities for billing management"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT 
                t.id,
                t.name,
                t.location,
                sp.name as plan,
                t.status,
                t.monthly_fee,
                t.created_at,
                COALESCE(student_count.count, 0) as students,
                COALESCE(invoice_sum.total_outstanding, 0) as outstanding_amount,
                COALESCE(invoice_sum.total_paid, 0) as total_paid,
                COALESCE(invoice_count.count, 0) as invoice_count
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM students 
                GROUP BY tenant_id
            ) student_count ON t.id = student_count.tenant_id
            LEFT JOIN (
                SELECT 
                    tenant_id, 
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_outstanding,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
                    COUNT(*) as count
                FROM invoices 
                GROUP BY tenant_id
            ) invoice_sum ON t.id = invoice_sum.tenant_id
            LEFT JOIN (
                SELECT tenant_id, COUNT(*) as count 
                FROM invoices 
                GROUP BY tenant_id
            ) invoice_count ON t.id = invoice_count.tenant_id
            ORDER BY t.name
        """)
        
        result = []
        for uni in universities:
            # Calculate next billing date (30 days from creation or last invoice)
            next_billing = uni['created_at'] + timedelta(days=30) if uni['created_at'] else datetime.now() + timedelta(days=30)
            last_billing = uni['created_at'] if uni['created_at'] else datetime.now() - timedelta(days=30)
            
            result.append({
                "id": str(uni['id']),
                "name": uni['name'],
                "location": uni['location'] or "Not specified",
                "plan": uni['plan'] or "Standard",
                "status": uni['status'],
                "monthlyFee": float(uni['monthly_fee'] or 0.0),
                "students": uni['students'],
                "outstandingAmount": float(uni['outstanding_amount'] or 0.0),
                "totalPaid": float(uni['total_paid'] or 0.0),
                "invoiceCount": uni['invoice_count'],
                "lastBillingDate": last_billing.strftime('%Y-%m-%d'),
                "nextBillingDate": next_billing.strftime('%Y-%m-%d'),
                "created_at": uni['created_at'].isoformat() if uni['created_at'] else None
            })
        
        return result

@app.post("/billing/invoice/{university_id}")
async def generate_invoice(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate and send invoice for a university"""
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        # Get university details
        university = await conn.fetchrow("""
            SELECT t.*, sp.name as plan_name
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.id = $1
        """, university_id)
        
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Generate invoice data
        invoice_data = {
            "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d')}-{university_id[:8]}",
            "date": datetime.now().strftime('%Y-%m-%d'),
            "due_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "amount": float(university['monthly_fee'] or 0.0)
        }
        
        # Create invoice record
        invoice_id = await conn.fetchval("""
            INSERT INTO invoices (tenant_id, invoice_number, amount, due_date, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING id
        """, university_id, invoice_data['invoice_number'], invoice_data['amount'], invoice_data['due_date'])
        
        return {
            "message": "Invoice generated successfully",
            "invoice_id": str(invoice_id),
            "invoice_data": invoice_data
        }

@app.post("/billing/send-invoice/{university_id}")
async def send_invoice(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Send invoice via email"""
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        # Get university details
        university = await conn.fetchrow("""
            SELECT t.*, sp.name as plan_name
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.id = $1
        """, university_id)
        
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Get university contact email (for now, use a default)
        contact_email = f"billing@{university['name'].lower().replace(' ', '')}.edu"
        
        # Generate invoice data
        invoice_data = {
            "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d')}-{university_id[:8]}",
            "date": datetime.now().strftime('%Y-%m-%d'),
            "due_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "amount": float(university['monthly_fee'] or 0.0)
        }
        
        # Generate HTML invoice
        university_dict = {
            "name": university['name'],
            "location": university['location'] or "Not specified",
            "plan": university['plan_name'] or "Standard",
            "monthly_fee": float(university['monthly_fee'] or 0.0)
        }
        
        html_body = generate_invoice_html(university_dict, invoice_data)
        
        # Send email
        subject = f"Invoice {invoice_data['invoice_number']} - PractiCheck Services"
        text_body = f"""
        Dear {university['name']} Team,
        
        Please find attached your invoice for PractiCheck services.
        
        Invoice Number: {invoice_data['invoice_number']}
        Amount: ${invoice_data['amount']:.2f}
        Due Date: {invoice_data['due_date']}
        
        Thank you for using PractiCheck!
        
        Best regards,
        PractiCheck Team
        """
        
        success = send_email(contact_email, subject, text_body, html_body)
        
        if success:
            return {"message": f"Invoice sent successfully to {contact_email}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send invoice")

@app.post("/billing/bulk-invoices")
async def send_bulk_invoices(current_user: dict = Depends(get_current_user)):
    """Send invoices to all active universities"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT t.*, sp.name as plan_name
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.status = 'active'
        """)
        
        sent_count = 0
        failed_count = 0
        
        for university in universities:
            try:
                contact_email = f"billing@{university['name'].lower().replace(' ', '')}.edu"
                
                invoice_data = {
                    "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d')}-{str(university['id'])[:8]}",
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "due_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                    "amount": float(university['monthly_fee'] or 0.0)
                }
                
                university_dict = {
                    "name": university['name'],
                    "location": university['location'] or "Not specified",
                    "plan": university['plan_name'] or "Standard",
                    "monthly_fee": float(university['monthly_fee'] or 0.0)
                }
                
                html_body = generate_invoice_html(university_dict, invoice_data)
                subject = f"Invoice {invoice_data['invoice_number']} - PractiCheck Services"
                text_body = f"""
                Dear {university['name']} Team,
                
                Please find your monthly invoice for PractiCheck services.
                
                Invoice Number: {invoice_data['invoice_number']}
                Amount: ${invoice_data['amount']:.2f}
                Due Date: {invoice_data['due_date']}
                
                Thank you for using PractiCheck!
                
                Best regards,
                PractiCheck Team
                """
                
                if send_email(contact_email, subject, text_body, html_body):
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to send invoice to {university['name']}: {e}")
                failed_count += 1
        
        return {
            "message": f"Bulk invoices completed. Sent: {sent_count}, Failed: {failed_count}",
            "sent_count": sent_count,
            "failed_count": failed_count
        }

@app.post("/billing/payment-reminders")
async def send_payment_reminders(current_user: dict = Depends(get_current_user)):
    """Send payment reminders to universities with overdue invoices"""
    async with db_pool.acquire() as conn:
        # Get universities with overdue invoices (for demo, we'll send to all active)
        universities = await conn.fetch("""
            SELECT t.*, sp.name as plan_name
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            WHERE t.status = 'active'
        """)
        
        sent_count = 0
        failed_count = 0
        
        for university in universities:
            try:
                contact_email = f"billing@{university['name'].lower().replace(' ', '')}.edu"
                
                subject = f"Payment Reminder - PractiCheck Services"
                text_body = f"""
                Dear {university['name']} Team,
                
                This is a friendly reminder that your payment for PractiCheck services is due.
                
                Monthly Fee: ${float(university['monthly_fee'] or 0.0):.2f}
                
                Please ensure payment is made to avoid any service interruption.
                
                If you have already made the payment, please disregard this message.
                
                For any questions, please contact our billing team at billing@practicheck.com
                
                Thank you for using PractiCheck!
                
                Best regards,
                PractiCheck Billing Team
                """
                
                html_body = f"""
                <html>
                <body>
                    <h2>Payment Reminder</h2>
                    <p>Dear {university['name']} Team,</p>
                    
                    <p>This is a friendly reminder that your payment for PractiCheck services is due.</p>
                    
                    <p><strong>Monthly Fee: ${float(university['monthly_fee'] or 0.0):.2f}</strong></p>
                    
                    <p>Please ensure payment is made to avoid any service interruption.</p>
                    
                    <p>If you have already made the payment, please disregard this message.</p>
                    
                    <p>For any questions, please contact our billing team at billing@practicheck.com</p>
                    
                    <p>Thank you for using PractiCheck!</p>
                    
                    <p>Best regards,<br>PractiCheck Billing Team</p>
                </body>
                </html>
                """
                
                if send_email(contact_email, subject, text_body, html_body):
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to send payment reminder to {university['name']}: {e}")
                failed_count += 1
        
        return {
            "message": f"Payment reminders completed. Sent: {sent_count}, Failed: {failed_count}",
            "sent_count": sent_count,
            "failed_count": failed_count
        }

# Billing Endpoints

@app.get("/billing/universities", response_model=List[BillingUniversitySummary])
async def get_billing_universities(current_user: dict = Depends(get_current_user)):
    """Get all universities with billing information"""
    async with db_pool.acquire() as conn:
        universities = await conn.fetch("""
            SELECT 
                t.id,
                t.name,
                t.location,
                sp.name as plan,
                t.monthly_fee,
                t.status,
                t.last_sync as last_billing_date,
                (t.last_sync + INTERVAL '1 month') as next_billing_date,
                COALESCE(billing_summary.total_paid, 0) as total_paid,
                COALESCE(billing_summary.outstanding_amount, 0) as outstanding_amount,
                COALESCE(billing_summary.invoice_count, 0) as invoice_count
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT 
                    tenant_id,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
                    SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END) as outstanding_amount,
                    COUNT(*) as invoice_count
                FROM invoices 
                GROUP BY tenant_id
            ) billing_summary ON t.id = billing_summary.tenant_id
            ORDER BY t.created_at DESC
        """)
        
        result = []
        for uni in universities:
            # Format dates
            last_billing = uni['last_billing_date'].strftime('%Y-%m-%d') if uni['last_billing_date'] else '2024-01-01'
            next_billing = uni['next_billing_date'].strftime('%Y-%m-%d') if uni['next_billing_date'] else '2024-02-01'
            
            result.append(BillingUniversitySummary(
                id=str(uni['id']),
                name=uni['name'],
                location=uni['location'] or "Not specified",
                plan=uni['plan'] or "Standard",
                monthly_fee=float(uni['monthly_fee'] or 0.0),
                status=uni['status'],
                last_billing_date=last_billing,
                next_billing_date=next_billing,
                total_paid=float(uni['total_paid'] or 0.0),
                outstanding_amount=float(uni['outstanding_amount'] or 0.0),
                invoice_count=uni['invoice_count'] or 0
            ))
        
        return result

@app.get("/billing/universities/{university_id}", response_model=UniversityBilling)
async def get_university_billing(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed billing information for a university"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        # Get university details
        university = await conn.fetchrow("""
            SELECT 
                t.*,
                sp.name as plan_name,
                COALESCE(billing_summary.total_paid, 0) as total_paid,
                COALESCE(billing_summary.outstanding_amount, 0) as outstanding_amount
            FROM tenants t
            LEFT JOIN subscription_plans sp ON t.plan_id = sp.id
            LEFT JOIN (
                SELECT 
                    tenant_id,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
                    SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END) as outstanding_amount
                FROM invoices 
                WHERE tenant_id = $1
                GROUP BY tenant_id
            ) billing_summary ON t.id = billing_summary.tenant_id
            WHERE t.id = $1
        """, university_id)
        
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Get billing history
        invoices = await conn.fetch("""
            SELECT id, invoice_number, invoice_date, due_date, amount, status, description, paid_date
            FROM invoices
            WHERE tenant_id = $1
            ORDER BY invoice_date DESC
        """, university_id)
        
        billing_history = []
        for invoice in invoices:
            billing_history.append(BillingHistory(
                id=str(invoice['id']),
                invoice_number=invoice['invoice_number'],
                date=invoice['invoice_date'].strftime('%Y-%m-%d'),
                due_date=invoice['due_date'].strftime('%Y-%m-%d'),
                amount=float(invoice['amount']),
                status=invoice['status'],
                description=invoice['description'],
                paid_date=invoice['paid_date'].strftime('%Y-%m-%d') if invoice['paid_date'] else None
            ))
        
        # Parse settings JSON if it exists
        settings = {}
        if university['settings']:
            try:
                if isinstance(university['settings'], str):
                    settings = json.loads(university['settings'])
                else:
                    settings = university['settings']
            except (json.JSONDecodeError, TypeError):
                settings = {}
        
        # Format next billing date
        next_billing = (university['last_sync'] + timedelta(days=30)).strftime('%Y-%m-%d') if university['last_sync'] else '2024-02-01'
        
        return UniversityBilling(
            id=str(university['id']),
            name=university['name'],
            location=university['location'] or "Not specified",
            plan=university['plan_name'] or "Standard",
            monthly_fee=float(university['monthly_fee'] or 0.0),
            status=university['status'],
            total_paid=float(university['total_paid'] or 0.0),
            outstanding_amount=float(university['outstanding_amount'] or 0.0),
            next_billing_date=next_billing,
            contact_email=settings.get('contact_email', 'billing@university.edu'),
            billing_address=settings.get('billing_address', f"{university['location']}\nBilling Department"),
            billing_history=billing_history
        )

@app.post("/billing/universities/{university_id}/invoices")
async def create_invoice(
    university_id: str,
    invoice_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Create a new invoice for a university"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        # Generate invoice number
        invoice_count = await conn.fetchval("SELECT COUNT(*) FROM invoices") or 0
        invoice_number = f"INV-{datetime.now().year}-{str(invoice_count + 1).zfill(3)}"
        
        # Create invoice
        invoice_id = await conn.fetchval("""
            INSERT INTO invoices (tenant_id, invoice_number, invoice_date, due_date, amount, status, description)
            VALUES ($1, $2, NOW(), NOW() + INTERVAL '30 days', $3, 'pending', $4)
            RETURNING id
        """, 
        university_id,
        invoice_number,
        invoice_data.get('amount'),
        invoice_data.get('description')
        )
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'Invoice Created', 'invoice', $2, $3)
        """, current_user['id'], invoice_id, {"invoice_number": invoice_number, "amount": invoice_data.get('amount')})
        
        return {"message": "Invoice created successfully", "invoice_id": str(invoice_id), "invoice_number": invoice_number}

@app.post("/billing/invoices/{invoice_id}/send")
async def send_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Send invoice via email"""
    # Validate UUID
    validate_uuid(invoice_id)
    
    async with db_pool.acquire() as conn:
        # Get invoice details
        invoice = await conn.fetchrow("""
            SELECT i.*, t.name as university_name, t.settings
            FROM invoices i
            JOIN tenants t ON i.tenant_id = t.id
            WHERE i.id = $1
        """, invoice_id)
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # In a real implementation, you would send the email here
        # For now, we'll just log the action
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'Invoice Sent', 'invoice', $2, $3)
        """, current_user['id'], invoice_id, {"invoice_number": invoice['invoice_number'], "university": invoice['university_name']})
        
        return {"message": "Invoice sent successfully"}

@app.get("/billing/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download invoice as PDF"""
    # Validate UUID
    validate_uuid(invoice_id)
    
    # In a real implementation, you would generate a PDF here
    # For now, return a mock response
    from fastapi.responses import Response
    
    # Mock PDF content
    pdf_content = b"Mock PDF content for invoice " + invoice_id.encode()
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice-{invoice_id}.pdf"}
    )

@app.get("/billing/invoices/{invoice_id}/print")
async def print_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get printable invoice HTML"""
    # Validate UUID
    validate_uuid(invoice_id)
    
    async with db_pool.acquire() as conn:
        # Get invoice details
        invoice = await conn.fetchrow("""
            SELECT i.*, t.name as university_name, t.location, t.settings
            FROM invoices i
            JOIN tenants t ON i.tenant_id = t.id
            WHERE i.id = $1
        """, invoice_id)
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Generate HTML for printing
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice {invoice['invoice_number']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ text-align: center; margin-bottom: 40px; }}
                .invoice-details {{ margin-bottom: 30px; }}
                .billing-info {{ display: flex; justify-content: space-between; margin-bottom: 30px; }}
                .items {{ border-collapse: collapse; width: 100%; }}
                .items th, .items td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
                .items th {{ background-color: #f2f2f2; }}
                .total {{ text-align: right; font-weight: bold; font-size: 18px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>INVOICE</h1>
                <h2>#{invoice['invoice_number']}</h2>
            </div>
            
            <div class="billing-info">
                <div>
                    <h3>From:</h3>
                    <p><strong>PractiCheck Ltd.</strong><br>
                    123 Business Street<br>
                    Nairobi, Kenya<br>
                    info@practicheck.com</p>
                </div>
                <div>
                    <h3>To:</h3>
                    <p><strong>{invoice['university_name']}</strong><br>
                    {invoice['location']}<br>
                    billing@university.edu</p>
                </div>
            </div>
            
            <div class="invoice-details">
                <p><strong>Invoice Date:</strong> {invoice['invoice_date'].strftime('%Y-%m-%d')}</p>
                <p><strong>Due Date:</strong> {invoice['due_date'].strftime('%Y-%m-%d')}</p>
                <p><strong>Status:</strong> {invoice['status'].title()}</p>
            </div>
            
            <table class="items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{invoice['description']}</td>
                        <td>${invoice['amount']:,.2f}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td class="total">Total:</td>
                        <td class="total">${invoice['amount']:,.2f}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="text-align: center; margin-top: 40px; color: #666;">
                <p>Thank you for your business!</p>
            </div>
            
            <script>
                window.onload = function() {{
                    window.print();
                }}
            </script>
        </body>
        </html>
        """
        
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)

@app.put("/billing/universities/{university_id}")
async def update_university_billing(
    university_id: str,
    university_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update university billing information"""
    # Validate UUID
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        # Update university basic info
        result = await conn.execute("""
            UPDATE tenants 
            SET name = $1, location = $2, monthly_fee = $3, settings = $4
            WHERE id = $5
        """, 
        university_data.get('name'),
        university_data.get('location'),
        university_data.get('monthlyFee'),
        {
            'contact_email': university_data.get('contactEmail'),
            'billing_address': university_data.get('billingAddress')
        },
        university_id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="University not found")
        
        # Log activity
        await conn.execute("""
            INSERT INTO activity_logs (user_id, user_type, action, target_type, target_id, details)
            VALUES ($1, 'admin', 'University Billing Updated', 'tenant', $2, $3)
        """, current_user['id'], university_id, university_data)
        
        return {"message": "University billing information updated successfully"}

@app.get("/billing/invoices/{university_id}")
async def get_university_invoices(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all invoices for a specific university"""
    validate_uuid(university_id)
    
    async with db_pool.acquire() as conn:
        invoices = await conn.fetch("""
            SELECT 
                id,
                invoice_number,
                amount,
                status,
                due_date,
                invoice_date,
                paid_date,
                description
            FROM invoices
            WHERE tenant_id = $1
            ORDER BY invoice_date DESC
        """, university_id)
        
        result = []
        for invoice in invoices:
            result.append({
                "id": str(invoice['id']),
                "invoiceNumber": invoice['invoice_number'],
                "amount": float(invoice['amount']),
                "status": invoice['status'],
                "dueDate": invoice['due_date'].isoformat() if invoice['due_date'] else None,
                "createdDate": invoice['invoice_date'].isoformat() if invoice['invoice_date'] else None,
                "paidDate": invoice['paid_date'].isoformat() if invoice['paid_date'] else None,
                "description": invoice['description']
            })
        
        return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
"""
PractiCheck Company Admin API
FastAPI backend for company dashboard management
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import asyncpg
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

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
    total_universities: int
    active_students: int
    active_attachments: int
    monthly_revenue: float
    system_health: float
    monthly_growth: dict

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
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_traffic: float
    active_connections: int
    response_time: float

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
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(token_data: dict = Depends(verify_token)) -> dict:
    """Get current authenticated user"""
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
                time_diff = datetime.now() - uni['last_sync']
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
            time_diff = datetime.now() - alert['created_at']
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
        """, current_user['id'], university_id, {"name": university_data.get('name')})
        
        return {"message": "University created successfully", "id": str(university_id)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
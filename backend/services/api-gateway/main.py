"""
PractiCheck API Gateway
Main entry point for the multi-tenant university attachment platform
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from typing import Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="PractiCheck API Gateway",
    description="Multi-tenant university industrial attachment platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.practicheck.com"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Company dashboard
        "http://localhost:3001",  # University portal
        "https://*.practicheck.com",  # Production domains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "version": "1.0.0",
        "timestamp": time.time()
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PractiCheck API Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# API v1 routes
@app.get("/api/v1/status")
async def api_status():
    """API status endpoint"""
    return {
        "api_version": "v1",
        "status": "operational",
        "services": {
            "tenant_management": "healthy",
            "authentication": "healthy",
            "student_service": "healthy",
            "lecturer_service": "healthy",
            "supervisor_service": "healthy",
            "faculty_admin": "healthy",
            "university_admin": "healthy",
            "company_admin": "healthy"
        }
    }

# Tenant routing middleware
@app.middleware("http")
async def tenant_routing_middleware(request: Request, call_next):
    """Route requests to appropriate tenant services"""
    
    # Extract tenant information from request
    tenant_id = None
    
    # Try to get tenant from subdomain
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain not in ["www", "api", "localhost"]:
            tenant_id = subdomain
    
    # Try to get tenant from headers
    if not tenant_id:
        tenant_id = request.headers.get("X-Tenant-ID")
    
    # Try to get tenant from query parameters
    if not tenant_id:
        tenant_id = request.query_params.get("tenant_id")
    
    # Add tenant context to request
    request.state.tenant_id = tenant_id
    
    response = await call_next(request)
    
    # Add tenant info to response headers for debugging
    if tenant_id:
        response.headers["X-Tenant-ID"] = tenant_id
    
    return response

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "timestamp": time.time(),
                "path": str(request.url)
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "timestamp": time.time(),
                "path": str(request.url)
            }
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 PractiCheck API Gateway starting up...")
    logger.info("✅ API Gateway ready to serve requests")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 PractiCheck API Gateway shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
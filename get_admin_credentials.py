#!/usr/bin/env python3
"""
Get University Admin Credentials
"""

import os
import sys
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_university_admins():
    """Get university admin credentials from database"""
    
    # SQL query to get university admin credentials
    query = """
    SELECT 
        u.id as user_id,
        u.email,
        u.name,
        u.password_hash,
        u.tenant_id,
        t.name as university_name,
        t.domain as slug
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE u.role = 'university_admin'
    ORDER BY u.created_at DESC
    LIMIT 10;
    """
    
    # Use psql to execute the query
    try:
        result = subprocess.run([
            'psql', DATABASE_URL, '-c', query
        ], capture_output=True, text=True, check=True)
        
        print("University Admin Credentials:")
        print("=" * 80)
        print(result.stdout)
        
        # Also provide the URLs
        print("\nLogin URLs:")
        print("=" * 40)
        print("University Admin Login: http://localhost:3000/university-admin/login")
        print("Faculty Admin Login: http://localhost:3000/faculty-admin/login")
        print("Company Admin Login: http://localhost:3000/auth/login")
        
    except subprocess.CalledProcessError as e:
        print(f"Error executing query: {e}")
        print(f"Error output: {e.stderr}")
    except FileNotFoundError:
        print("psql command not found. Please install PostgreSQL client.")
        print("On Ubuntu/Debian: sudo apt-get install postgresql-client")
        print("On macOS: brew install postgresql")

if __name__ == "__main__":
    get_university_admins()
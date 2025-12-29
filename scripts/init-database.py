#!/usr/bin/env python3
"""
PractiCheck Database Initialization Script
Creates tables and inserts sample data
"""

import asyncio
import asyncpg
import os
from datetime import datetime, timedelta
import uuid

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

async def init_database():
    """Initialize the database with schema and sample data"""
    print("🚀 Initializing PractiCheck database...")
    
    # Connect to database with statement cache disabled for pgbouncer compatibility
    conn = await asyncpg.connect(DATABASE_URL, statement_cache_size=0)
    
    try:
        # Read and execute schema
        with open('backend/database/schema.sql', 'r') as f:
            schema_sql = f.read()
        
        print("📋 Creating database schema...")
        await conn.execute(schema_sql)
        print("✅ Schema created successfully!")
        
        # Insert sample universities
        print("🏫 Creating sample universities...")
        
        # Get plan IDs
        standard_plan = await conn.fetchrow("SELECT id FROM subscription_plans WHERE name = 'Standard'")
        professional_plan = await conn.fetchrow("SELECT id FROM subscription_plans WHERE name = 'Professional'")
        enterprise_plan = await conn.fetchrow("SELECT id FROM subscription_plans WHERE name = 'Enterprise'")
        
        sample_universities = [
            {
                'name': 'University of Technology',
                'location': 'Nairobi, Kenya',
                'plan_id': enterprise_plan['id'],
                'monthly_fee': 2500.00,
                'health_score': 99.2,
                'students': 245,
                'attachments': 89
            },
            {
                'name': 'State University',
                'location': 'Mombasa, Kenya',
                'plan_id': professional_plan['id'],
                'monthly_fee': 1800.00,
                'health_score': 97.8,
                'students': 189,
                'attachments': 67
            },
            {
                'name': 'Technical College',
                'location': 'Kisumu, Kenya',
                'plan_id': standard_plan['id'],
                'monthly_fee': 1200.00,
                'health_score': 85.4,
                'students': 156,
                'attachments': 45
            },
            {
                'name': 'Engineering Institute',
                'location': 'Eldoret, Kenya',
                'plan_id': professional_plan['id'],
                'monthly_fee': 1800.00,
                'health_score': 98.9,
                'students': 203,
                'attachments': 78
            }
        ]
        
        university_ids = []
        for uni in sample_universities:
            # Insert university
            uni_id = await conn.fetchval("""
                INSERT INTO tenants (name, location, plan_id, monthly_fee, health_score, last_sync)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            """, uni['name'], uni['location'], uni['plan_id'], uni['monthly_fee'], 
                uni['health_score'], datetime.now() - timedelta(minutes=5))
            
            university_ids.append(uni_id)
            
            # Create sample students for this university
            for i in range(uni['students']):
                user_id = await conn.fetchval("""
                    INSERT INTO users (tenant_id, email, name, role)
                    VALUES ($1, $2, $3, 'student')
                    RETURNING id
                """, uni_id, f"student{i+1}@{uni['name'].lower().replace(' ', '')}.edu", 
                    f"Student {i+1}")
                
                await conn.execute("""
                    INSERT INTO students (tenant_id, user_id, registration_number, faculty, program, year_of_study)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, uni_id, user_id, f"REG{i+1:04d}", 
                    f"Faculty {(i % 5) + 1}", f"Program {(i % 3) + 1}", (i % 4) + 1)
            
            # Create sample attachments
            for i in range(uni['attachments']):
                student = await conn.fetchrow("""
                    SELECT id FROM students WHERE tenant_id = $1 LIMIT 1 OFFSET $2
                """, uni_id, i % uni['students'])
                
                await conn.execute("""
                    INSERT INTO attachments (tenant_id, student_id, company_name, supervisor_name, 
                                           supervisor_email, start_date, end_date, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
                """, uni_id, student['id'], f"Company {i+1}", f"Supervisor {i+1}",
                    f"supervisor{i+1}@company{i+1}.com", 
                    datetime.now().date() - timedelta(days=30),
                    datetime.now().date() + timedelta(days=60))
        
        print(f"✅ Created {len(sample_universities)} universities with sample data!")
        
        # Insert sample alerts
        print("🚨 Creating sample alerts...")
        sample_alerts = [
            {
                'tenant_id': university_ids[0],
                'type': 'warning',
                'severity': 'medium',
                'title': 'High CPU Usage',
                'message': 'High CPU usage detected on University of Technology cluster'
            },
            {
                'tenant_id': university_ids[1],
                'type': 'info',
                'severity': 'low',
                'title': 'Scheduled Maintenance',
                'message': 'Scheduled maintenance for State University at 2:00 AM'
            },
            {
                'tenant_id': university_ids[2],
                'type': 'success',
                'severity': 'low',
                'title': 'University Onboarded',
                'message': 'Successfully onboarded Technical College'
            },
            {
                'tenant_id': university_ids[3],
                'type': 'error',
                'severity': 'high',
                'title': 'Database Connection',
                'message': 'Database connection timeout for Engineering Institute'
            }
        ]
        
        for alert in sample_alerts:
            await conn.execute("""
                INSERT INTO system_alerts (tenant_id, type, severity, title, message)
                VALUES ($1, $2, $3, $4, $5)
            """, alert['tenant_id'], alert['type'], alert['severity'], 
                alert['title'], alert['message'])
        
        print("✅ Sample alerts created!")
        
        # Insert sample metrics
        print("📊 Creating sample metrics...")
        metrics = [
            ('cpu_usage', 68.5, '%'),
            ('memory_usage', 72.3, '%'),
            ('disk_usage', 45.1, '%'),
            ('network_traffic', 1.2, 'GB/hr'),
            ('active_connections', 1247, 'connections'),
            ('response_time', 145, 'ms')
        ]
        
        for metric_name, value, unit in metrics:
            await conn.execute("""
                INSERT INTO system_metrics (metric_name, metric_value, unit)
                VALUES ($1, $2, $3)
            """, metric_name, value, unit)
        
        print("✅ Sample metrics created!")
        
        print("🎉 Database initialization completed successfully!")
        print("\n📋 Summary:")
        print(f"   • {len(sample_universities)} Universities created")
        print(f"   • {sum(uni['students'] for uni in sample_universities)} Students created")
        print(f"   • {sum(uni['attachments'] for uni in sample_universities)} Attachments created")
        print(f"   • {len(sample_alerts)} System alerts created")
        print(f"   • {len(metrics)} System metrics created")
        print("\n🔐 Admin Login Credentials:")
        print("   Email: admin@practicheck.com")
        print("   Password: Admin123!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(init_database())
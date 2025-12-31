#!/usr/bin/env python3
"""
Sample Data Population Script for PractiCheck Multi-Tenant System
Creates sample universities, faculties, courses, and users for testing
"""

import asyncio
import asyncpg
import bcrypt
import uuid
import os
from datetime import datetime, timezone

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/practicheck_dev")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def populate_sample_data():
    """Populate database with sample data"""
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("🏫 Creating sample universities...")
        
        # Create sample universities (tenants)
        universities = [
            {
                'name': 'Machakos University',
                'location': 'Machakos, Kenya',
                'domain': 'mksu.ac.ke',
                'plan_id': None  # Will be set after getting plan ID
            },
            {
                'name': 'University of Nairobi',
                'location': 'Nairobi, Kenya', 
                'domain': 'uonbi.ac.ke',
                'plan_id': None
            },
            {
                'name': 'Kenyatta University',
                'location': 'Nairobi, Kenya',
                'domain': 'ku.ac.ke', 
                'plan_id': None
            }
        ]
        
        # Get a subscription plan ID
        plan_id = await conn.fetchval("SELECT id FROM subscription_plans LIMIT 1")
        
        university_ids = {}
        for uni in universities:
            uni['plan_id'] = plan_id
            # Check if university already exists
            existing_uni = await conn.fetchrow(
                "SELECT id FROM tenants WHERE domain = $1", uni['domain']
            )
            
            if existing_uni:
                uni_id = existing_uni['id']
                print(f"✅ University already exists: {uni['name']} (ID: {uni_id})")
            else:
                uni_id = await conn.fetchval("""
                    INSERT INTO tenants (name, location, domain, plan_id, status, health_score, monthly_fee)
                    VALUES ($1, $2, $3, $4, 'active', 98.5, 1800.00)
                    RETURNING id
                """, uni['name'], uni['location'], uni['domain'], uni['plan_id'])
                print(f"✅ Created university: {uni['name']} (ID: {uni_id})")
            
            university_ids[uni['name']] = uni_id
        
        print("\n🏛️ Creating faculties and courses...")
        
        # Create faculties and courses for each university
        faculties_data = {
            'Machakos University': [
                {
                    'name': 'School of Engineering and Technology',
                    'code': 'SET',
                    'courses': [
                        {'name': 'Bachelor of Science in Computer Science', 'code': 'BSCS', 'duration': 4},
                        {'name': 'Bachelor of Science in Information Technology', 'code': 'BSIT', 'duration': 4},
                        {'name': 'Bachelor of Engineering in Software Engineering', 'code': 'BESE', 'duration': 4},
                    ]
                },
                {
                    'name': 'School of Business and Economics',
                    'code': 'SBE',
                    'courses': [
                        {'name': 'Bachelor of Commerce', 'code': 'BCOM', 'duration': 4},
                        {'name': 'Bachelor of Business Administration', 'code': 'BBA', 'duration': 4},
                    ]
                }
            ],
            'University of Nairobi': [
                {
                    'name': 'School of Computing and Informatics',
                    'code': 'SCI',
                    'courses': [
                        {'name': 'Bachelor of Science in Computer Science', 'code': 'BSCS', 'duration': 4},
                        {'name': 'Bachelor of Science in Information Systems', 'code': 'BSIS', 'duration': 4},
                    ]
                },
                {
                    'name': 'School of Engineering',
                    'code': 'SOE',
                    'courses': [
                        {'name': 'Bachelor of Science in Civil Engineering', 'code': 'BSCE', 'duration': 5},
                        {'name': 'Bachelor of Science in Electrical Engineering', 'code': 'BSEE', 'duration': 5},
                    ]
                }
            ],
            'Kenyatta University': [
                {
                    'name': 'School of Pure and Applied Sciences',
                    'code': 'SPAS',
                    'courses': [
                        {'name': 'Bachelor of Science in Computer Science', 'code': 'BSCS', 'duration': 4},
                        {'name': 'Bachelor of Science in Mathematics', 'code': 'BSMATH', 'duration': 4},
                    ]
                }
            ]
        }
        
        faculty_ids = {}
        for uni_name, faculties in faculties_data.items():
            tenant_id = university_ids[uni_name]
            faculty_ids[uni_name] = {}
            
            for faculty in faculties:
                # Check if faculty already exists
                existing_faculty = await conn.fetchrow(
                    "SELECT id FROM faculties WHERE tenant_id = $1 AND code = $2", 
                    tenant_id, faculty['code']
                )
                
                if existing_faculty:
                    faculty_id = existing_faculty['id']
                    print(f"  📚 Faculty already exists: {faculty['name']} at {uni_name}")
                else:
                    faculty_id = await conn.fetchval("""
                        INSERT INTO faculties (tenant_id, name, code, description, is_active)
                        VALUES ($1, $2, $3, $4, true)
                        RETURNING id
                    """, tenant_id, faculty['name'], faculty['code'], f"Faculty of {faculty['name']}")
                    print(f"  📚 Created faculty: {faculty['name']} at {uni_name}")
                
                faculty_ids[uni_name][faculty['code']] = faculty_id
                
                # Create courses for this faculty
                for course in faculty['courses']:
                    # Check if course already exists
                    existing_course = await conn.fetchrow(
                        "SELECT id FROM courses WHERE tenant_id = $1 AND code = $2",
                        tenant_id, course['code']
                    )
                    
                    if existing_course:
                        print(f"    📖 Course already exists: {course['name']}")
                    else:
                        course_id = await conn.fetchval("""
                            INSERT INTO courses (tenant_id, faculty_id, name, code, duration_years, degree_type, is_active)
                            VALUES ($1, $2, $3, $4, $5, 'Bachelor', true)
                            RETURNING id
                        """, tenant_id, faculty_id, course['name'], course['code'], course['duration'])
                        print(f"    📖 Created course: {course['name']}")
        
        print("\n👥 Creating sample users...")
        
        # Create sample users for each university
        for uni_name, tenant_id in university_ids.items():
            print(f"\n🏫 Creating users for {uni_name}:")
            
            # Create University Admin
            existing_admin = await conn.fetchrow(
                "SELECT id FROM users WHERE tenant_id = $1 AND role = 'university_admin'",
                tenant_id
            )
            
            if existing_admin:
                print(f"  👤 University Admin already exists for {uni_name}")
            else:
                uni_admin_id = await conn.fetchval("""
                    INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
                    VALUES ($1, $2, $3, $4, 'university_admin', true)
                    RETURNING id
                """, tenant_id, f"admin@{uni_name.lower().replace(' ', '')}.edu", 
                    hash_password("UniAdmin123!"), f"{uni_name} Administrator")
                
                await conn.execute("""
                    INSERT INTO university_admin_profiles (user_id, staff_id, phone, office_location)
                    VALUES ($1, $2, $3, $4)
                """, uni_admin_id, f"UA{str(tenant_id)[:8]}", "+254700000001", "Administration Block")
                
                print(f"  👤 Created University Admin: admin@{uni_name.lower().replace(' ', '')}.edu")
            
            # Create Faculty Admins
            for faculty_code in faculty_ids[uni_name].keys():
                existing_faculty_admin = await conn.fetchrow(
                    "SELECT id FROM users WHERE tenant_id = $1 AND email = $2 AND role = 'faculty_admin'",
                    tenant_id, f"faculty.{faculty_code.lower()}@{uni_name.lower().replace(' ', '')}.edu"
                )
                
                if existing_faculty_admin:
                    print(f"  👤 Faculty Admin already exists: faculty.{faculty_code.lower()}@{uni_name.lower().replace(' ', '')}.edu")
                else:
                    faculty_admin_id = await conn.fetchval("""
                        INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
                        VALUES ($1, $2, $3, $4, 'faculty_admin', true)
                        RETURNING id
                    """, tenant_id, f"faculty.{faculty_code.lower()}@{uni_name.lower().replace(' ', '')}.edu",
                        hash_password("FacAdmin123!"), f"{faculty_code} Faculty Administrator")
                    
                    await conn.execute("""
                        INSERT INTO faculty_admin_profiles (user_id, staff_id, faculty, phone, office_location)
                        VALUES ($1, $2, $3, $4, $5)
                    """, faculty_admin_id, f"FA{faculty_code}{str(tenant_id)[:6]}", faculty_code, "+254700000002", f"{faculty_code} Faculty Office")
                    
                    print(f"  👤 Created Faculty Admin: faculty.{faculty_code.lower()}@{uni_name.lower().replace(' ', '')}.edu")
            
            # Create sample lecturers
            lecturers = [
                {'name': 'Dr. John Kamau', 'email': 'j.kamau', 'staff_id': 'LEC001', 'faculty': 'SET'},
                {'name': 'Prof. Mary Wanjiku', 'email': 'm.wanjiku', 'staff_id': 'LEC002', 'faculty': 'SET'},
                {'name': 'Dr. Peter Mwangi', 'email': 'p.mwangi', 'staff_id': 'LEC003', 'faculty': 'SBE'},
            ]
            
            for lecturer in lecturers:
                if lecturer['faculty'] in faculty_ids[uni_name]:
                    existing_lecturer = await conn.fetchrow(
                        "SELECT id FROM users WHERE tenant_id = $1 AND email = $2 AND role = 'lecturer'",
                        tenant_id, f"{lecturer['email']}@{uni_name.lower().replace(' ', '')}.edu"
                    )
                    
                    if existing_lecturer:
                        print(f"  👨‍🏫 Lecturer already exists: {lecturer['name']} ({lecturer['email']}@{uni_name.lower().replace(' ', '')}.edu)")
                    else:
                        lecturer_id = await conn.fetchval("""
                            INSERT INTO users (tenant_id, email, password_hash, name, role, is_active, is_password_temporary)
                            VALUES ($1, $2, $3, $4, 'lecturer', true, true)
                            RETURNING id
                        """, tenant_id, f"{lecturer['email']}@{uni_name.lower().replace(' ', '')}.edu",
                            hash_password("TempPass123!"), lecturer['name'])
                        
                        await conn.execute("""
                            INSERT INTO lecturer_profiles (user_id, staff_id, faculty, department, specialization, phone, office_location)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                        """, lecturer_id, lecturer['staff_id'], lecturer['faculty'], 
                            "Computer Science", "Software Engineering", "+254700000010", f"Office {lecturer['staff_id']}")
                        
                        print(f"  👨‍🏫 Created Lecturer: {lecturer['name']} ({lecturer['email']}@{uni_name.lower().replace(' ', '')}.edu)")
            
            # Create sample students
            students = [
                {'name': 'Alice Mwangi', 'email': 'alice.mwangi', 'student_id': 'CS/2021/001', 'faculty': 'SET', 'program': 'Computer Science', 'year': 3},
                {'name': 'Bob Kiprotich', 'email': 'bob.kiprotich', 'student_id': 'CS/2021/002', 'faculty': 'SET', 'program': 'Information Technology', 'year': 3},
                {'name': 'Carol Nyong', 'email': 'carol.nyong', 'student_id': 'BBA/2022/001', 'faculty': 'SBE', 'program': 'Business Administration', 'year': 2},
                {'name': 'David Ochieng', 'email': 'david.ochieng', 'student_id': 'CS/2020/001', 'faculty': 'SET', 'program': 'Computer Science', 'year': 4},
            ]
            
            for student in students:
                if student['faculty'] in faculty_ids[uni_name]:
                    existing_student = await conn.fetchrow(
                        "SELECT id FROM users WHERE tenant_id = $1 AND email = $2 AND role = 'student'",
                        tenant_id, f"{student['email']}@{uni_name.lower().replace(' ', '')}.edu"
                    )
                    
                    if existing_student:
                        print(f"  👨‍🎓 Student already exists: {student['name']} ({student['student_id']})")
                    else:
                        student_id = await conn.fetchval("""
                            INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
                            VALUES ($1, $2, $3, $4, 'student', true)
                            RETURNING id
                        """, tenant_id, f"{student['email']}@{uni_name.lower().replace(' ', '')}.edu",
                            hash_password("Student123!"), student['name'])
                        
                        await conn.execute("""
                            INSERT INTO student_profiles (user_id, student_id, faculty, program, year_of_study, phone)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        """, student_id, student['student_id'], student['faculty'], 
                            student['program'], student['year'], "+254700000020")
                        
                        print(f"  👨‍🎓 Created Student: {student['name']} ({student['student_id']})")
        
        print("\n🏢 Creating sample supervisors...")
        
        # Create sample supervisors (not tied to any university)
        supervisors = [
            {
                'name': 'James Mutua',
                'email': 'james.mutua@techcorp.com',
                'company': 'TechCorp Kenya',
                'industry': 'Technology',
                'position': 'Senior Software Engineer',
                'experience': 8
            },
            {
                'name': 'Sarah Kimani',
                'email': 'sarah.kimani@innovate.co.ke',
                'company': 'Innovate Solutions',
                'industry': 'Technology',
                'position': 'Technical Lead',
                'experience': 12
            },
            {
                'name': 'Michael Otieno',
                'email': 'michael.otieno@banktech.com',
                'company': 'BankTech Ltd',
                'industry': 'Finance',
                'position': 'IT Manager',
                'experience': 15
            }
        ]
        
        for supervisor in supervisors:
            existing_supervisor = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1 AND role = 'supervisor'",
                supervisor['email']
            )
            
            if existing_supervisor:
                print(f"  👔 Supervisor already exists: {supervisor['name']} ({supervisor['email']})")
            else:
                supervisor_id = await conn.fetchval("""
                    INSERT INTO users (email, password_hash, name, role, is_active)
                    VALUES ($1, $2, $3, 'supervisor', true)
                    RETURNING id
                """, supervisor['email'], hash_password("Supervisor123!"), supervisor['name'])
                
                await conn.execute("""
                    INSERT INTO supervisor_profiles (user_id, company_name, industry, position, phone, years_experience)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, supervisor_id, supervisor['company'], supervisor['industry'], 
                    supervisor['position'], "+254700000030", supervisor['experience'])
                
                print(f"  👔 Created Supervisor: {supervisor['name']} ({supervisor['email']})")
        
        print("\n✅ Sample data population completed successfully!")
        print("\n📋 Login Credentials Summary:")
        print("=" * 50)
        
        for uni_name in university_ids.keys():
            print(f"\n🏫 {uni_name}:")
            print(f"   University Admin: admin@{uni_name.lower().replace(' ', '')}.edu / UniAdmin123!")
            
            for faculty_code in faculty_ids[uni_name].keys():
                print(f"   Faculty Admin ({faculty_code}): faculty.{faculty_code.lower()}@{uni_name.lower().replace(' ', '')}.edu / FacAdmin123!")
            
            print(f"   Sample Lecturer: j.kamau@{uni_name.lower().replace(' ', '')}.edu / TempPass123! (temporary)")
            print(f"   Sample Student: alice.mwangi@{uni_name.lower().replace(' ', '')}.edu / Student123!")
        
        print(f"\n👔 Supervisors:")
        for supervisor in supervisors:
            print(f"   {supervisor['name']}: {supervisor['email']} / Supervisor123!")
        
        print(f"\n🏢 Company Admin:")
        print(f"   Super Admin: admin@practicheck.com / Admin123!")
        
    except Exception as e:
        print(f"❌ Error populating sample data: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(populate_sample_data())
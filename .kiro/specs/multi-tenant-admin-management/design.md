# Design Document: Multi-Tenant Admin Management System

## Overview

This design extends the existing PractiCheck database schema to implement a comprehensive multi-tenant university management system with hierarchical admin roles, tenant isolation, and cascading user management capabilities.

## Architecture

### Multi-Tenant Architecture
- **Path-based routing**: `/university/{tenant-slug}/dashboard` for tenant-specific access
- **Tenant isolation**: Row-level security with tenant_id filtering
- **Hierarchical permissions**: Company Admin → University Admin → Faculty Admin → Lecturer
- **Shared infrastructure**: Single database with tenant partitioning

### Authentication & Authorization Flow
```
Company Admin (admin_users table)
    ↓ creates
University Admin (users table, role='university_admin')
    ↓ creates  
Faculty Admin (users table, role='faculty_admin')
    ↓ creates
Lecturer (users table, role='lecturer')
```

## Components and Interfaces

### 1. University Management Service
**Purpose**: Handle university creation and university admin management

**Key Functions**:
- `createUniversity(universityData, adminData)` → Creates tenant + university admin
- `generateUniversityUrl(tenantId)` → Returns path-based URL
- `sendUniversityAdminCredentials(adminEmail, credentials, url)` → Email notification

**Database Tables Used**:
- `tenants` (existing) - University records
- `users` (existing) - University admin accounts
- `university_admin_profiles` (existing) - Admin profile data

### 2. Faculty Management Service  
**Purpose**: Handle faculty creation and faculty admin management

**Key Functions**:
- `createFaculty(tenantId, facultyData, adminData)` → Creates faculty + admin
- `getFacultiesByTenant(tenantId)` → Lists university faculties
- `assignFacultyAdmin(facultyId, adminData)` → Creates faculty admin account

**Database Tables Used**:
- `faculties` (existing) - Faculty records
- `users` (existing) - Faculty admin accounts  
- `faculty_admin_profiles` (existing) - Faculty admin profiles

### 3. Course Management Service
**Purpose**: Handle course creation and student pre-registration

**Key Functions**:
- `createCourse(tenantId, facultyId, courseData)` → Creates course
- `bulkUploadStudents(tenantId, facultyId, courseId, studentList)` → Pre-register students
- `getCascadingDropdownData(tenantId?)` → Returns university→faculty→course hierarchy

**Database Tables Used**:
- `courses` (existing) - Course records
- `users` (existing) - Pre-registered student accounts
- `student_profiles` (existing) - Student profile data

### 4. Lecturer Management Service
**Purpose**: Handle lecturer account creation and assignment

**Key Functions**:
- `createLecturer(tenantId, facultyId, lecturerData)` → Creates lecturer with temp password
- `assignStudentToLecturer(studentId, lecturerId)` → Creates assignment
- `getLecturerWorkload(tenantId, facultyId)` → Returns student counts per lecturer

**Database Tables Used**:
- `users` (existing) - Lecturer accounts
- `lecturer_profiles` (existing) - Lecturer profile data
- `student_lecturer_assignments` (new) - Assignment tracking

### 5. Assessment Management Service
**Purpose**: Handle assessment requests and lecturer assignments

**Key Functions**:
- `requestAssessment(studentId, assessmentType)` → Creates assessment request
- `assignAssessmentToLecturer(requestId, lecturerId)` → Assigns to lecturer
- `getAssessmentRequests(facultyId)` → Lists pending requests

**Database Tables Used**:
- `assessment_requests` (new) - Assessment request tracking
- `assessments` (new) - Assessment records

### 6. Logbook Management Service
**Purpose**: Handle daily logbook entries with integrity controls

**Key Functions**:
- `createLogbookEntry(studentId, entryData)` → Creates daily entry
- `editLogbookEntry(entryId, newData)` → Single edit allowed
- `getStudentLogbook(studentId, lecturerId?)` → Returns entries with access control

**Database Tables Used**:
- `logbook_entries` (new) - Daily student entries
- `logbook_comments` (new) - Supervisor/lecturer feedback

## Data Models

### New Tables Required

```sql
-- Student-Lecturer Assignments
CREATE TABLE student_lecturer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- 'assessment', 'supervision'
    assigned_by UUID REFERENCES users(id), -- Faculty admin who made assignment
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Requests
CREATE TABLE assessment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL, -- 'midterm', 'final', 'project', 'presentation'
    description TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_lecturer_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    request_id UUID REFERENCES assessment_requests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL,
    grade DECIMAL(5,2), -- Grade out of 100
    grade_letter VARCHAR(5), -- A, B, C, D, F
    feedback TEXT,
    assessment_data JSONB DEFAULT '{}', -- Flexible assessment form data
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'graded', 'published'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logbook Entries
CREATE TABLE logbook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attachment_id UUID REFERENCES attachments(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    activities JSONB DEFAULT '[]', -- Array of activity objects
    skills_learned TEXT,
    challenges_faced TEXT,
    supervisor_email VARCHAR(255), -- Links to supervisor
    hours_worked DECIMAL(4,2) DEFAULT 8.0,
    location VARCHAR(255),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, entry_date) -- One entry per day per student
);

-- Logbook Comments
CREATE TABLE logbook_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES logbook_entries(id) ON DELETE CASCADE,
    commenter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commenter_type VARCHAR(50) NOT NULL, -- 'supervisor', 'lecturer', 'faculty_admin'
    comment TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional 1-5 rating
    is_private BOOLEAN DEFAULT false, -- Private comments only visible to faculty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'assignment', 'assessment', 'comment', 'account_created'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enhanced Existing Tables

```sql
-- Add tenant slug for path-based routing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Add faculty assignment to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id);

-- Add course assignment to student profiles  
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Add workload tracking to lecturer profiles
ALTER TABLE lecturer_profiles ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 20;
ALTER TABLE lecturer_profiles ADD COLUMN IF NOT EXISTS current_students INTEGER DEFAULT 0;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tenant Isolation Guarantee
*For any* database query with tenant context, the results should only contain data belonging to that specific tenant and never include cross-tenant information
**Validates: Requirements 1.4, 7.1, 7.2, 7.3**

### Property 2: Unique Identifier Generation
*For any* university creation operation, the system should generate unique tenant identifiers and URLs that do not conflict with existing universities
**Validates: Requirements 1.1**

### Property 3: Secure Password Generation
*For any* admin account creation (university admin, faculty admin, lecturer), the system should generate passwords meeting security requirements (minimum length, complexity, uniqueness)
**Validates: Requirements 1.2, 2.3, 3.2**

### Property 4: Email Notification Delivery
*For any* admin account creation or assignment operation, the system should trigger email notifications with correct recipient, credentials, and tenant-specific URLs
**Validates: Requirements 1.3, 2.3, 3.3, 8.1, 8.2, 8.3**

### Property 5: Cascading Dropdown Data Integrity
*For any* university selection, the faculty dropdown should only contain faculties belonging to that university, and course dropdowns should only contain courses from the selected faculty
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Role-Based Data Access
*For any* user login, the dashboard should display only data appropriate to their role and tenant context, hiding unauthorized information
**Validates: Requirements 2.1, 2.4, 3.1, 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 7: Logbook Entry Uniqueness
*For any* student and date combination, the system should allow only one logbook entry and reject attempts to create duplicate entries for the same day
**Validates: Requirements 6.1**

### Property 8: Single Edit Constraint
*For any* logbook entry, after the first edit operation, subsequent edit attempts should be rejected while preserving the edit history
**Validates: Requirements 6.2**

### Property 9: Assignment Notification Consistency
*For any* student-lecturer assignment, the system should update both the lecturer's student list and send notification emails with accurate student details
**Validates: Requirements 5.3, 5.4, 8.2**

### Property 10: Workload Calculation Accuracy
*For any* faculty admin viewing lecturer assignments, the displayed student counts should accurately reflect the current number of assigned students per lecturer
**Validates: Requirements 5.2, 3.5**

### Property 11: Student Registration Validation
*For any* student registration attempt, the system should verify the email exists in the pre-registered database for the selected course and reject invalid combinations
**Validates: Requirements 4.4, 10.3, 10.4**

### Property 12: Data Consistency Maintenance
*For any* student data update operation, all related records across tables should maintain referential integrity and consistent tenant context
**Validates: Requirements 10.5, 5.5**

## Error Handling

### Tenant Context Errors
- **Missing Tenant Context**: Return 400 Bad Request when tenant information is missing
- **Invalid Tenant Access**: Return 403 Forbidden for cross-tenant access attempts
- **Tenant Not Found**: Return 404 Not Found for non-existent tenant references

### Authentication Errors
- **Invalid Credentials**: Return 401 Unauthorized with generic error message
- **Expired Tokens**: Return 401 Unauthorized with token refresh instructions
- **Insufficient Permissions**: Return 403 Forbidden with role requirement details

### Data Validation Errors
- **Missing Required Fields**: Return 400 Bad Request with field-specific error messages
- **Duplicate Constraints**: Return 409 Conflict for unique constraint violations
- **Invalid References**: Return 400 Bad Request for non-existent foreign key references

### Business Logic Errors
- **Logbook Entry Limits**: Return 409 Conflict when attempting duplicate daily entries
- **Edit Restrictions**: Return 409 Conflict when attempting multiple edits
- **Assignment Conflicts**: Return 409 Conflict for invalid lecturer assignments

## Testing Strategy

### Dual Testing Approach
- **Unit Tests**: Verify specific business logic, validation rules, and error conditions
- **Property Tests**: Verify universal properties across all inputs and tenant contexts

### Property-Based Testing Configuration
- **Framework**: Use Hypothesis (Python) for property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Test Tags**: Format: **Feature: multi-tenant-admin-management, Property {number}: {property_text}**

### Unit Testing Focus
- **Tenant isolation**: Verify queries never return cross-tenant data
- **Role permissions**: Test access control for each user role
- **Email delivery**: Mock SMTP and verify email content and recipients
- **Password generation**: Verify security requirements are met
- **Cascading dropdowns**: Test filtering logic for university→faculty→course
- **Logbook constraints**: Test daily entry limits and edit restrictions

### Integration Testing
- **End-to-end workflows**: Company admin creates university → university admin creates faculty → faculty admin creates lecturer
- **Cross-service communication**: API Gateway routing to appropriate services
- **Database transactions**: Verify atomicity of multi-table operations
- **Email integration**: Test actual SMTP delivery in staging environment

### Performance Testing
- **Multi-tenant queries**: Verify performance with large numbers of tenants
- **Concurrent access**: Test simultaneous access by different tenant users
- **Bulk operations**: Test student list uploads and bulk account creation
- **Dashboard loading**: Verify acceptable response times for role-based dashboards

## Implementation Notes

### Database Migrations
1. Add new tables for assignments, assessments, logbooks, and notifications
2. Add tenant slug column for path-based routing
3. Add faculty_id and course_id references to existing tables
4. Create indexes for performance optimization
5. Enable row-level security policies

### API Endpoints Structure
```
/api/admin/universities (Company Admin)
/api/university/{tenant-slug}/faculties (University Admin)
/api/faculty/{faculty-id}/courses (Faculty Admin)
/api/faculty/{faculty-id}/lecturers (Faculty Admin)
/api/lecturer/{lecturer-id}/students (Lecturer)
/api/student/registration/dropdowns (Student)
```

### Email Templates
- University admin welcome email with login URL
- Faculty admin credentials with faculty-specific access
- Lecturer one-time password with first-login instructions
- Student password setup with tenant-aware links
- Assignment notifications with relevant details

### Security Considerations
- All database queries must include tenant_id filtering
- JWT tokens must include tenant context for API requests
- Password reset tokens must be tenant-aware
- Session management must prevent cross-tenant data leakage
- File uploads must be scoped to tenant storage
-- Multi-Tenant Admin Management System Migration
-- Adds new tables and enhances existing schema for hierarchical admin management

-- Add tenant slug for path-based routing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Add faculty assignment to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id);

-- Add course assignment to student profiles  
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Add workload tracking to lecturer profiles
ALTER TABLE lecturer_profiles ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 20;
ALTER TABLE lecturer_profiles ADD COLUMN IF NOT EXISTS current_students INTEGER DEFAULT 0;

-- Student-Lecturer Assignments
CREATE TABLE IF NOT EXISTS student_lecturer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- 'assessment', 'supervision'
    assigned_by UUID REFERENCES users(id), -- Faculty admin who made assignment
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, student_id, lecturer_id, assignment_type)
);

-- Assessment Requests
CREATE TABLE IF NOT EXISTS assessment_requests (
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
CREATE TABLE IF NOT EXISTS assessments (
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
CREATE TABLE IF NOT EXISTS logbook_entries (
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
CREATE TABLE IF NOT EXISTS logbook_comments (
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
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_users_faculty_id ON users(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_course_id ON student_profiles(course_id);
CREATE INDEX IF NOT EXISTS idx_student_lecturer_assignments_tenant_id ON student_lecturer_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_lecturer_assignments_student_id ON student_lecturer_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lecturer_assignments_lecturer_id ON student_lecturer_assignments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_student_lecturer_assignments_faculty_id ON student_lecturer_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_tenant_id ON assessment_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_student_id ON assessment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_faculty_id ON assessment_requests(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_status ON assessment_requests(status);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lecturer_id ON assessments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_tenant_id ON logbook_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_student_id ON logbook_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_entry_date ON logbook_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_supervisor_email ON logbook_entries(supervisor_email);
CREATE INDEX IF NOT EXISTS idx_logbook_comments_tenant_id ON logbook_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logbook_comments_entry_id ON logbook_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_logbook_comments_commenter_id ON logbook_comments(commenter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Enable Row Level Security for new tables
ALTER TABLE student_lecturer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Generate unique slugs for existing tenants
DO $$
DECLARE
    tenant_record RECORD;
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER;
BEGIN
    FOR tenant_record IN SELECT id, name FROM tenants WHERE slug IS NULL OR slug = '' LOOP
        base_slug := LOWER(REGEXP_REPLACE(tenant_record.name, '[^a-zA-Z0-9]+', '-', 'g'));
        base_slug := TRIM(BOTH '-' FROM base_slug);
        
        -- Ensure base slug is not empty
        IF base_slug = '' THEN
            base_slug := 'university';
        END IF;
        
        final_slug := base_slug;
        counter := 1;
        
        -- Find unique slug by appending counter if needed
        WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = final_slug AND id != tenant_record.id) LOOP
            final_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        UPDATE tenants SET slug = final_slug WHERE id = tenant_record.id;
    END LOOP;
END $$;
# Requirements Document

## Introduction

Multi-tenant university management system with hierarchical admin roles, tenant isolation, and cascading user management capabilities for the PractiCheck industrial attachment platform.

## Glossary

- **Company_Admin**: Top-level administrator managing all universities in the system
- **University_Admin**: Administrator managing a specific university and its faculties
- **Faculty_Admin**: Administrator managing a specific faculty within a university
- **Lecturer**: Faculty staff member who assesses students and reviews logbooks
- **Student**: University student participating in industrial attachments
- **Supervisor**: Industry supervisor overseeing student attachments
- **Tenant**: Isolated university instance with complete data separation
- **Logbook_Entry**: Daily student activity record with edit restrictions
- **Assessment_Request**: Student request for evaluation sent to faculty admin

## Requirements

### Requirement 1: Company Admin University Management

**User Story:** As a company admin, I want to create and manage universities, so that I can onboard new institutions and create their admin credentials.

#### Acceptance Criteria

1. WHEN a company admin creates a university, THE System SHALL generate a unique tenant identifier and university-specific dashboard URL
2. WHEN creating a university, THE System SHALL allow creation of university admin credentials with auto-generated secure passwords
3. WHEN university admin credentials are created, THE System SHALL send login credentials and university-specific URL via email
4. THE System SHALL maintain complete data isolation between different university tenants
5. WHEN a company admin views universities, THE System SHALL display university status, admin contact, and access URLs

### Requirement 2: University Admin Faculty Management

**User Story:** As a university admin, I want to manage faculties and create faculty admin accounts, so that I can delegate faculty-specific administration.

#### Acceptance Criteria

1. WHEN a university admin accesses their dashboard, THE System SHALL display only their university's data and faculties
2. WHEN creating a faculty, THE System SHALL require faculty name, description, and admin contact information
3. WHEN creating faculty admin credentials, THE System SHALL generate secure passwords and send faculty-specific login URLs
4. THE System SHALL ensure faculty admins can only access their specific faculty data
5. WHEN a university admin views faculties, THE System SHALL show faculty statistics and admin status

### Requirement 3: Faculty Admin Course and Lecturer Management

**User Story:** As a faculty admin, I want to manage courses and create lecturer accounts, so that I can organize academic programs and staff access.

#### Acceptance Criteria

1. WHEN a faculty admin accesses their dashboard, THE System SHALL display only their faculty's courses and students
2. WHEN creating a lecturer account, THE System SHALL require staff ID and generate one-time password
3. WHEN lecturer credentials are created, THE System SHALL send staff ID and one-time password via email
4. THE System SHALL enforce lecturer password change on first login with popup interface
5. WHEN viewing courses, THE System SHALL display enrolled student counts and assigned lecturers

### Requirement 4: Student Registration with Cascading Dropdowns

**User Story:** As a student, I want to select my university, faculty, and course from dropdowns, so that I can register with accurate institutional affiliation.

#### Acceptance Criteria

1. WHEN a student begins registration, THE System SHALL display university dropdown populated from active tenants
2. WHEN a university is selected, THE System SHALL populate faculty dropdown with that university's faculties
3. WHEN a faculty is selected, THE System SHALL populate course dropdown with that faculty's courses
4. THE System SHALL validate student email against pre-registered student database for selected course
5. WHEN valid student submits registration, THE System SHALL send password setup link with tenant context

### Requirement 5: Lecturer Assignment and Assessment Workflow

**User Story:** As a faculty admin, I want to assign students to lecturers for assessment, so that I can distribute workload and manage evaluations.

#### Acceptance Criteria

1. WHEN a student requests assessment, THE System SHALL notify the faculty admin with student details
2. WHEN faculty admin views lecturer assignments, THE System SHALL display current student counts per lecturer
3. WHEN assigning a student to lecturer, THE System SHALL update lecturer's student list and notify lecturer
4. WHEN a lecturer is assigned a student, THE System SHALL grant access to that student's complete logbook history
5. THE System SHALL maintain assignment records for audit and workload tracking

### Requirement 6: Logbook Entry Integrity and Supervisor Integration

**User Story:** As a student, I want to create daily logbook entries with supervisor feedback, so that I can document my attachment progress with integrity controls.

#### Acceptance Criteria

1. THE System SHALL allow only one logbook entry per student per day
2. WHEN a logbook entry is created, THE System SHALL allow only one edit operation
3. WHEN a student connects with supervisor via email, THE System SHALL link supervisor account to student logbooks
4. WHEN supervisor reviews logbook, THE System SHALL allow commenting and feedback on entries
5. THE System SHALL maintain entry timestamps and edit history for integrity verification

### Requirement 7: Tenant Isolation and Security

**User Story:** As a system architect, I want complete data isolation between universities, so that institutional data remains secure and separate.

#### Acceptance Criteria

1. THE System SHALL implement row-level security ensuring users only access their tenant's data
2. WHEN any user queries data, THE System SHALL automatically filter by tenant context
3. THE System SHALL prevent cross-tenant data access through API endpoints
4. WHEN generating URLs, THE System SHALL include tenant-specific routing or subdomains
5. THE System SHALL maintain separate session contexts for different tenant administrators

### Requirement 8: Email Notification and Communication System

**User Story:** As an administrator, I want automated email notifications for account creation and assignments, so that users receive timely access information.

#### Acceptance Criteria

1. WHEN admin credentials are created, THE System SHALL send welcome email with login URL and temporary password
2. WHEN lecturer is assigned a student, THE System SHALL notify lecturer via email with student details
3. WHEN student requests assessment, THE System SHALL email faculty admin with request details
4. THE System SHALL include tenant-specific branding and URLs in all email communications
5. WHEN password reset is requested, THE System SHALL send tenant-aware reset links

### Requirement 9: Dashboard Role-Based Access Control

**User Story:** As a user with specific role, I want to access only relevant dashboard sections, so that I can focus on my responsibilities without confusion.

#### Acceptance Criteria

1. WHEN company admin logs in, THE System SHALL display multi-tenant overview with all universities
2. WHEN university admin logs in, THE System SHALL display single-tenant view with faculty management
3. WHEN faculty admin logs in, THE System SHALL display faculty-specific view with course and lecturer management
4. WHEN lecturer logs in, THE System SHALL display assigned students and assessment tools
5. THE System SHALL hide unauthorized menu items and prevent access to restricted endpoints

### Requirement 10: Student Pre-Registration and Data Consistency

**User Story:** As a faculty admin, I want to bulk upload student information, so that students can register with validated institutional data.

#### Acceptance Criteria

1. WHEN faculty admin uploads student list, THE System SHALL validate required fields and course assignments
2. THE System SHALL store student information with tenant and faculty context for dropdown population
3. WHEN student attempts registration, THE System SHALL verify email against pre-registered student database
4. THE System SHALL prevent registration with invalid or non-existent student information
5. WHEN student data is updated, THE System SHALL maintain referential integrity across all related records
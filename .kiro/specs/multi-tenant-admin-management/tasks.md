# Implementation Plan: Multi-Tenant Admin Management System

## Overview

Implementation of comprehensive multi-tenant university management system with hierarchical admin roles, tenant isolation, and cascading user management capabilities using Python/FastAPI.

## Tasks

- [x] 1. Database Schema Updates and Migrations
  - Create new database tables for assignments, assessments, logbooks, and notifications
  - Add tenant slug column and foreign key references to existing tables
  - Create database indexes for performance optimization
  - _Requirements: 1.1, 5.5, 6.5, 7.1_

- [ ]* 1.1 Write property test for database schema integrity
  - **Property 12: Data Consistency Maintenance**
  - **Validates: Requirements 10.5, 5.5**

- [x] 2. Tenant Management Service Implementation
  - [x] 2.1 Create university management endpoints in company-admin service
    - Implement POST /universities for university creation with admin credentials
    - Implement GET /universities for listing all universities with statistics
    - Add tenant slug generation and URL creation logic
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 2.2 Write property test for tenant isolation
    - **Property 1: Tenant Isolation Guarantee**
    - **Validates: Requirements 1.4, 7.1, 7.2, 7.3**

  - [ ]* 2.3 Write property test for unique identifier generation
    - **Property 2: Unique Identifier Generation**
    - **Validates: Requirements 1.1**

- [x] 3. University Admin Service Implementation
  - [x] 3.1 Create university admin dashboard endpoints
    - Implement GET /dashboard/stats for university-specific view
    - Implement POST /faculties for faculty creation
    - Implement GET /faculties for faculty listing
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.2 Implement faculty admin credential creation
    - Add faculty admin account creation with secure password generation
    - Implement email notification system for faculty admin credentials
    - _Requirements: 2.3_

  - [ ]* 3.3 Write property test for role-based data access
    - **Property 6: Role-Based Data Access**
    - **Validates: Requirements 2.1, 2.4, 3.1, 9.1, 9.2, 9.3, 9.4, 9.5**

- [x] 4. Faculty Admin Service Implementation
  - [x] 4.1 Create faculty admin dashboard endpoints
    - Implement GET /dashboard/stats for faculty-specific view
    - Implement POST /courses for course creation
    - Implement GET /courses for course listing with statistics
    - _Requirements: 3.1, 3.5_

  - [x] 4.2 Implement lecturer management system
    - Add POST /lecturers for lecturer account creation
    - Implement staff ID validation and one-time password generation
    - Add lecturer workload tracking and assignment management
    - _Requirements: 3.2, 5.2_

  - [ ]* 4.3 Write property test for workload calculation accuracy
    - **Property 10: Workload Calculation Accuracy**
    - **Validates: Requirements 5.2, 3.5**

- [x] 5. Student Registration System with Cascading Dropdowns
  - [x] 5.1 Create cascading dropdown API endpoints
    - Implement GET /universities for university dropdown
    - Implement GET /universities/{id}/faculties for faculty dropdown
    - Implement GET /faculties/{id}/courses for course dropdown
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.2 Implement student pre-registration validation
    - Add email validation against pre-registered student database
    - Implement course-specific student verification logic
    - Add tenant-aware password setup link generation
    - _Requirements: 4.4, 4.5, 10.3, 10.4_

- [x] 6. Assessment Management System
  - [x] 6.1 Create assessment request endpoints
    - Implement POST /auth/student/assessment-request for student assessment requests
    - Implement GET /auth/student/assessment-requests for student view
    - Add assessment request notification system to faculty admins
    - _Requirements: 5.1_

  - [x] 6.2 Implement lecturer assignment system
    - Add POST /faculty/assessment-requests/{id}/assign for student-lecturer assignments
    - Implement lecturer notification system for new assignments
    - Add student logbook access control for assigned lecturers
    - _Requirements: 5.3, 5.4_

  - [ ]* 6.3 Write property test for assignment notification consistency
    - **Property 9: Assignment Notification Consistency**
    - **Validates: Requirements 5.3, 5.4, 8.2**

- [x] 7. Logbook Management System with Integrity Controls
  - [x] 7.1 Create logbook entry endpoints
    - Implement POST /auth/student/logbook for daily entry creation
    - Implement PUT /auth/student/logbook/{id} for single edit operation
    - Add daily entry uniqueness constraint enforcement
    - _Requirements: 6.1, 6.2_

  - [x] 7.2 Implement supervisor integration and commenting
    - Add supervisor-student linking via email system
    - Implement GET /auth/student/logbook for student logbook view
    - Add lecturer access to assigned student logbooks (via faculty admin service)
    - _Requirements: 6.3, 6.4_

  - [ ]* 7.3 Write property test for logbook entry uniqueness
    - **Property 7: Logbook Entry Uniqueness**
    - **Validates: Requirements 6.1**

  - [ ]* 7.4 Write property test for single edit constraint
    - **Property 8: Single Edit Constraint**
    - **Validates: Requirements 6.2**

- [ ] 8. Email Notification System Enhancement
  - [ ] 8.1 Create tenant-aware email templates
    - Design university admin welcome email template with login URLs
    - Create faculty admin credential email with faculty-specific access
    - Design lecturer one-time password email with first-login instructions
    - _Requirements: 8.1, 8.4_

  - [ ] 8.2 Implement notification delivery system
    - Add assignment notification emails for lecturers
    - Implement assessment request notifications for faculty admins
    - Add tenant-specific branding and URL generation
    - _Requirements: 8.2, 8.3, 8.5_

  - [ ]* 8.3 Write property test for email notification delivery
    - **Property 4: Email Notification Delivery**
    - **Validates: Requirements 1.3, 2.3, 3.3, 8.1, 8.2, 8.3**

- [ ] 9. Security and Access Control Implementation
  - [ ] 9.1 Implement row-level security policies
    - Add tenant_id filtering to all database queries
    - Implement JWT token tenant context validation
    - Add API endpoint access control based on user roles
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ] 9.2 Create role-based dashboard routing
    - Implement company admin multi-tenant dashboard
    - Add university admin single-tenant dashboard
    - Create faculty admin faculty-specific dashboard
    - Add lecturer dashboard with assigned students
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 9.3 Write property test for secure password generation
    - **Property 3: Secure Password Generation**
    - **Validates: Requirements 1.2, 2.3, 3.2**

- [ ] 10. Bulk Student Management System
  - [ ] 10.1 Create student bulk upload endpoints
    - Implement POST /faculty/{id}/students/bulk for CSV upload
    - Add student data validation and course assignment logic
    - Implement tenant and faculty context preservation
    - _Requirements: 10.1, 10.2_

  - [ ] 10.2 Add student data management
    - Create student information update endpoints
    - Implement referential integrity maintenance across related tables
    - Add student registration dropdown population from pre-registered data
    - _Requirements: 10.2, 10.5_

- [x] 11. API Gateway Route Integration
  - [x] 11.1 Add new service routes to API Gateway
    - Add university management routes to company admin proxy
    - Implement faculty management routes for university admins
    - Add faculty admin routes for course and lecturer management
    - Add student registration and logbook routes
    - _Requirements: 7.3_

  - [x] 11.2 Implement tenant-aware routing
    - Add path-based tenant routing (/api/university/*, /api/faculty/*)
    - Implement tenant context extraction from URLs
    - Add tenant validation middleware
    - _Requirements: 7.4_

- [ ] 12. Frontend Dashboard Components
  - [ ] 12.1 Create company admin university management UI
    - Build university creation form with admin credential generation
    - Implement university listing with status and statistics
    - Add university admin credential management interface
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ] 12.2 Build cascading dropdown components
    - Create university selection dropdown for student registration
    - Implement faculty dropdown with university filtering
    - Add course dropdown with faculty filtering
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 13. Checkpoint - Core System Integration
  - Ensure all backend services are properly integrated
  - Verify tenant isolation is working correctly
  - Test email notification delivery
  - Confirm cascading dropdowns are populated correctly
  - Ask the user if questions arise

- [ ] 14. Testing and Validation
  - [ ]* 14.1 Write integration tests for complete workflows
    - Test company admin → university admin → faculty admin → lecturer creation flow
    - Test student registration with cascading dropdowns
    - Test assessment request and lecturer assignment workflow

  - [ ]* 14.2 Write unit tests for business logic
    - Test tenant isolation in database queries
    - Test role-based access control
    - Test logbook entry constraints and edit restrictions
    - Test email template generation and delivery

- [ ] 15. Final Integration and Deployment Preparation
  - [ ] 15.1 Database migration scripts
    - Create production-ready migration scripts for new tables
    - Add data migration for existing tenants and users
    - Implement rollback procedures for schema changes

  - [ ] 15.2 Performance optimization
    - Add database indexes for multi-tenant queries
    - Optimize cascading dropdown query performance
    - Implement caching for frequently accessed tenant data

- [ ] 16. Final Checkpoint - System Validation
  - Ensure all tests pass and system is fully functional
  - Verify complete multi-tenant isolation
  - Test all user roles and permission levels
  - Confirm email notifications are working correctly
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation and user feedback
'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '../../shared-components/Logo';
import { LoadingButton } from '../../shared-components/LoadingSpinner';

interface University {
  id: string;
  name: string;
  location: string;
  domain?: string;
}

interface Faculty {
  id: string;
  name: string;
  university_id: string;
  university_name: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  faculty_id: string;
  faculty_name: string;
  university_id: string;
}

export default function UniversityPortal() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      fetchFaculties(selectedUniversity);
      setSelectedFaculty('');
      setSelectedCourse('');
      setCourses([]);
    } else {
      setFaculties([]);
      setCourses([]);
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedFaculty) {
      fetchCourses(selectedFaculty);
      setSelectedCourse('');
    } else {
      setCourses([]);
    }
  }, [selectedFaculty]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('http://localhost:8002/universities');
      if (response.ok) {
        const data = await response.json();
        setUniversities(data);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchFaculties = async (universityId: string) => {
    try {
      const response = await fetch(`http://localhost:8002/universities/${universityId}/faculties`);
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchCourses = async (facultyId: string) => {
    try {
      const response = await fetch(`http://localhost:8002/faculties/${facultyId}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleContinue = () => {
    if (!selectedUniversity || !selectedRole) {
      alert('Please select your university and role');
      return;
    }

    // For students, require faculty and course selection
    if (selectedRole === 'student' && (!selectedFaculty || !selectedCourse)) {
      alert('Students must select their faculty and course');
      return;
    }

    setLoading(true);

    // Build the redirect URL based on role
    let redirectUrl = '';
    const params = new URLSearchParams({
      university_id: selectedUniversity,
      role: selectedRole
    });

    if (selectedRole === 'student') {
      params.append('faculty_id', selectedFaculty);
      params.append('course_id', selectedCourse);
      redirectUrl = `/auth/student?${params.toString()}`;
    } else if (selectedRole === 'lecturer') {
      redirectUrl = `/auth/lecturer?${params.toString()}`;
    } else if (selectedRole === 'supervisor') {
      redirectUrl = `/auth/supervisor`;
    } else if (selectedRole === 'faculty-admin') {
      redirectUrl = `/auth/faculty-admin?${params.toString()}`;
    } else if (selectedRole === 'university-admin') {
      redirectUrl = `/auth/university-admin?${params.toString()}`;
    }

    // Redirect to the appropriate auth page
    window.location.href = redirectUrl;
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          University Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your industrial attachment management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <div className="space-y-6">
            <div>
              <label htmlFor="university" className="label">
                Select Your University
              </label>
              <select
                id="university"
                name="university"
                className="input-field"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                disabled={loadingUniversities}
              >
                <option value="">
                  {loadingUniversities ? 'Loading universities...' : 'Choose your university...'}
                </option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name} - {university.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="label">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select your role...</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="supervisor">Industry Supervisor</option>
                <option value="faculty-admin">Faculty Administrator</option>
                <option value="university-admin">University Administrator</option>
              </select>
            </div>

            {/* Faculty selection - only show for students */}
            {selectedRole === 'student' && selectedUniversity && (
              <div>
                <label htmlFor="faculty" className="label">
                  Select Your Faculty
                </label>
                <select
                  id="faculty"
                  name="faculty"
                  className="input-field"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="">Choose your faculty...</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Course selection - only show for students after faculty is selected */}
            {selectedRole === 'student' && selectedFaculty && (
              <div>
                <label htmlFor="course" className="label">
                  Select Your Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="input-field"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Choose your course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <LoadingButton
                onClick={handleContinue}
                className="w-full"
                variant="primary"
                size="lg"
                isLoading={loading}
                loadingText="Redirecting..."
                disabled={!selectedUniversity || !selectedRole || (selectedRole === 'student' && (!selectedFaculty || !selectedCourse))}
              >
                Continue to Login
              </LoadingButton>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Need help?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Contact your university administrator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
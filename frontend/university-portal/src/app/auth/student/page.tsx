'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '../../../shared-components/Logo';
import { LoadingButton } from '../../../shared-components/LoadingSpinner';

export default function StudentAuth() {
  const [step, setStep] = useState<'email' | 'register' | 'login'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    // Get parameters from URL
    const params = new URLSearchParams(window.location.search);
    setUniversityId(params.get('university_id') || '');
    setFacultyId(params.get('faculty_id') || '');
    setCourseId(params.get('course_id') || '');
  }, []);

  const handleEmailCheck = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/auth/student/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.exists) {
        setHasPassword(data.hasPassword);
        if (data.hasPassword) {
          setStep('login');
        } else {
          // Validate registration first
          await validateRegistration();
        }
      } else {
        alert('No student account found with this email address. Please contact your university administration.');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      alert('Error checking email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateRegistration = async () => {
    try {
      const response = await fetch('http://localhost:8002/auth/student/validate-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          university_id: universityId,
          faculty_id: facultyId,
          course_id: courseId
        })
      });

      const data = await response.json();
      
      if (data.valid) {
        setStudentId(data.student_id);
        setUniversityName(data.university_name);
        setFacultyName(data.faculty_name);
        setCourseName(data.course_name);
        
        if (data.has_password) {
          setStep('login');
        } else {
          setStep('register');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error validating registration:', error);
      alert('Error validating registration. Please try again.');
    }
  };

  const handleRegistration = async () => {
    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/auth/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          university_id: universityId,
          faculty_id: facultyId,
          course_id: courseId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registration completed successfully! You can now log in.');
        setStep('login');
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!studentId || !password) {
      alert('Please enter your student ID and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          password,
          university_id: universityId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to student dashboard
        window.location.href = '/student/dashboard';
      } else {
        alert(`Login failed: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Student Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' && 'Enter your email to get started'}
          {step === 'register' && 'Set up your password'}
          {step === 'login' && 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your university email"
                />
              </div>

              <div>
                <LoadingButton
                  onClick={handleEmailCheck}
                  className="w-full"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  loadingText="Checking..."
                >
                  Continue
                </LoadingButton>
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800">Account Details</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Student ID:</strong> {studentId}</p>
                  <p><strong>University:</strong> {universityName}</p>
                  <p><strong>Faculty:</strong> {facultyName}</p>
                  <p><strong>Course:</strong> {courseName}</p>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Create Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password (min 8 characters)"
                />
              </div>

              <div>
                <LoadingButton
                  onClick={handleRegistration}
                  className="w-full"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  loadingText="Setting up..."
                >
                  Complete Registration
                </LoadingButton>
              </div>
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="studentId" className="label">
                  Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="input-field"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <LoadingButton
                  onClick={handleLogin}
                  className="w-full"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </LoadingButton>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            ← Back to role selection
          </a>
        </div>
      </div>
    </div>
  );
}
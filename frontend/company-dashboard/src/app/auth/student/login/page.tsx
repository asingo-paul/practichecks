'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  KeyIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Logo } from '../../../../components/Logo';
import { LoadingButton } from '../../../../components/LoadingSpinner';
import Link from 'next/link';

export default function StudentLoginPage() {
  const [step, setStep] = useState<'email' | 'login'>('email');
  const [form, setForm] = useState({
    email: '',
    studentId: '',
    password: '',
    universityId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState([]);

  // Load universities on component mount
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await fetch('/api/auth/universities');
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
        }
      } catch (error) {
        console.error('Failed to load universities:', error);
      }
    };
    loadUniversities();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if student exists and send password setup link
      const response = await fetch('/api/auth/student/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.hasPassword) {
          // Student exists and has password, go to login step
          setStep('login');
        } else if (data.exists && !data.hasPassword) {
          // Student exists but needs to set password
          alert('A password setup link has been sent to your email. Please check your inbox and follow the instructions to set up your password.');
        } else {
          // Student doesn't exist
          setError('No student account found with this email. Please contact your university administrator.');
        }
      } else {
        setError('Failed to verify email. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: form.studentId,
          password: form.password,
          university_id: form.universityId
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/student/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid credentials');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link 
            href="/auth/role-selection" 
            className="flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Role Selection
          </Link>
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white">
              <AcademicCapIcon className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Student Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' 
              ? 'Enter your university email to get started'
              : 'Enter your credentials to access your dashboard'
            }
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    University Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="student@university.edu"
                    />
                  </div>
                </div>

                <LoadingButton
                  type="submit"
                  isLoading={loading}
                  loadingText="Verifying..."
                  className="btn-primary w-full"
                  disabled={!form.email}
                >
                  Continue
                </LoadingButton>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
                    Select University
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="universityId"
                      name="universityId"
                      required
                      value={form.universityId}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                    >
                      <option value="">Choose your university</option>
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name} - {uni.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <div className="mt-1">
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      required
                      value={form.studentId}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your student ID"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    ← Change Email
                  </button>
                  <Link
                    href="/auth/student/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                <LoadingButton
                  type="submit"
                  isLoading={loading}
                  loadingText="Signing in..."
                  className="btn-primary w-full"
                  disabled={!form.studentId || !form.password || !form.universityId}
                >
                  Sign In
                </LoadingButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
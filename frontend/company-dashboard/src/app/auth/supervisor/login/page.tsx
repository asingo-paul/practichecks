'use client';

import React, { useState } from 'react';
import { 
  BriefcaseIcon,
  ArrowLeftIcon,
  KeyIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Logo } from '../../../../components/Logo';
import { LoadingButton } from '../../../../components/LoadingSpinner';
import Link from 'next/link';

export default function SupervisorLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    industry: '',
    position: '',
    phone: '',
    companyAddress: '',
    yearsExperience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    'Technology',
    'Manufacturing',
    'Healthcare',
    'Finance',
    'Education',
    'Construction',
    'Retail',
    'Transportation',
    'Energy',
    'Agriculture',
    'Other'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/supervisor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/supervisor/dashboard';
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/supervisor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          companyName: form.companyName,
          industry: form.industry,
          position: form.position,
          phone: form.phone,
          companyAddress: form.companyAddress,
          yearsExperience: parseInt(form.yearsExperience) || 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/supervisor/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500 text-white">
              <BriefcaseIcon className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Industry Supervisor {mode === 'login' ? 'Login' : 'Registration'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' 
              ? 'Sign in to your supervisor account'
              : 'Create your supervisor account to guide students'
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

            {/* Mode Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Register
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
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
                      placeholder="supervisor@company.com"
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

                <div className="flex items-center justify-end">
                  <Link
                    href="/auth/supervisor/forgot-password"
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
                  disabled={!form.email || !form.password}
                >
                  Sign In
                </LoadingButton>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
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
                        placeholder="supervisor@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
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
                        placeholder="Create a password"
                        minLength={8}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={form.companyName}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="TechCorp Industries"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry *
                    </label>
                    <div className="mt-1">
                      <select
                        id="industry"
                        name="industry"
                        required
                        value={form.industry}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position/Title *
                    </label>
                    <div className="mt-1">
                      <input
                        id="position"
                        name="position"
                        type="text"
                        required
                        value={form.position}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Senior Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <div className="mt-1">
                      <input
                        id="yearsExperience"
                        name="yearsExperience"
                        type="number"
                        min="0"
                        max="50"
                        value={form.yearsExperience}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                <LoadingButton
                  type="submit"
                  isLoading={loading}
                  loadingText="Creating account..."
                  className="btn-primary w-full"
                  disabled={!form.name || !form.email || !form.password || !form.companyName || !form.industry || !form.position}
                >
                  Create Account
                </LoadingButton>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By registering, you agree to supervise students during their industrial attachments and provide constructive feedback.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
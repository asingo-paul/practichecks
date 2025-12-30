'use client';

import React, { useState } from 'react';
import { 
  UserGroupIcon,
  ArrowLeftIcon,
  KeyIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { Logo } from '../../../../components/Logo';
import { LoadingButton } from '../../../../components/LoadingSpinner';
import Link from 'next/link';

export default function LecturerLoginPage() {
  const [form, setForm] = useState({
    staffId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/lecturer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: form.staffId,
          password: form.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.requiresPasswordChange) {
          // First-time login, show password change form
          setShowPasswordChange(true);
        } else {
          // Normal login
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/lecturer/dashboard';
        }
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/lecturer/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: form.staffId,
          currentPassword: form.password,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/lecturer/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white">
              <UserGroupIcon className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            {showPasswordChange ? 'Set New Password' : 'Lecturer Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showPasswordChange 
              ? 'Please set a new password for your account'
              : 'Enter your staff credentials to access your dashboard'
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

            {!showPasswordChange ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
                    Staff ID
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="staffId"
                      name="staffId"
                      type="text"
                      required
                      value={form.staffId}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Enter your staff ID"
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
                    href="/auth/lecturer/forgot-password"
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
                  disabled={!form.staffId || !form.password}
                >
                  Sign In
                </LoadingButton>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Don't have an account? Contact your Faculty Administrator to get your credentials.
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-blue-700">
                    This is your first login. Please set a new password to secure your account.
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <LoadingButton
                  type="submit"
                  isLoading={loading}
                  loadingText="Updating password..."
                  className="btn-primary w-full"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  Set Password & Continue
                </LoadingButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { Logo } from '../../shared-components/Logo';
import { LoadingButton } from '../../shared-components/LoadingSpinner';

export default function UniversityPortal() {
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
                defaultValue=""
              >
                <option value="" disabled>Choose your university...</option>
                <option value="university-of-technology">University of Technology</option>
                <option value="state-university">State University</option>
                <option value="technical-college">Technical College</option>
                <option value="engineering-institute">Engineering Institute</option>
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
                defaultValue=""
              >
                <option value="" disabled>Select your role...</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="supervisor">Industry Supervisor</option>
                <option value="faculty-admin">Faculty Administrator</option>
                <option value="university-admin">University Administrator</option>
              </select>
            </div>

            <div>
              <LoadingButton
                type="submit"
                className="w-full"
                variant="primary"
                size="lg"
              >
                Continue to Dashboard
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
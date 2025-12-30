'use client';

import React from 'react';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Logo } from '../../../components/Logo';
import Link from 'next/link';

const roles = [
  {
    id: 'student',
    name: 'Student',
    description: 'Access your attachment progress, submit reports, and connect with supervisors',
    icon: AcademicCapIcon,
    href: '/auth/student/login',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'lecturer',
    name: 'Lecturer',
    description: 'Monitor student progress, review reports, and manage attachments',
    icon: UserGroupIcon,
    href: '/auth/lecturer/login',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'supervisor',
    name: 'Industry Supervisor',
    description: 'Guide students, provide feedback, and track attachment milestones',
    icon: BriefcaseIcon,
    href: '/auth/supervisor/login',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link 
            href="/" 
            className="flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select how you'd like to access PractiCheck
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {roles.map((role) => (
              <Link
                key={role.id}
                href={role.href}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-primary-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${role.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            ))}
          </div>

          {/* Admin Access Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Faculty Admin and University Admin access is available through secure URLs provided by your institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
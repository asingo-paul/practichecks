'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '../../../components/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  TagIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

export default function PostInternshipPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hirerInfo, setHirerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'On-site' as 'Remote' | 'On-site' | 'Hybrid',
    duration: '',
    salary: '',
    description: '',
    requirements: '',
    tags: '',
  });

  useEffect(() => {
    // Check if hirer is logged in
    const token = localStorage.getItem('hirerToken');
    const user = localStorage.getItem('hirerUser');
    
    if (!token || !user) {
      router.push('/auth/hirer/login');
      return;
    }

    setIsAuthenticated(true);
    const userData = JSON.parse(user);
    setHirerInfo(userData);
    setFormData(prev => ({ ...prev, company: userData.company || '' }));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to my internships page after success
      setTimeout(() => {
        router.push('/hirer/my-internships');
      }, 2000);
    } catch (err) {
      alert('Failed to post internship. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hirerToken');
    localStorage.removeItem('hirerUser');
    router.push('/internships');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {hirerInfo?.company}
              </span>
              <Link
                href="/hirer/my-internships"
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                My Internships
              </Link>
              <Link
                href="/internships"
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                View Internships
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post an Internship</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to post your internship opportunity
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✓ Internship posted successfully! Redirecting to your internships dashboard...
          </div>
        )}

        <div className="bg-white shadow-soft rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            {/* Location and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Duration and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="duration"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 3-6 months"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="salary"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., KES 40,000 - 60,000/month"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <textarea
                id="requirements"
                required
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="List the requirements (one per line)&#10;e.g.,&#10;- Computer Science student&#10;- Knowledge of Python&#10;- Team player"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Software, Engineering, Python, Web Development"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Add relevant tags to help students find your internship
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/internships"
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post Internship'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
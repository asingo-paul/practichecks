'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  EyeIcon,
  UserGroupIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  duration: string;
  salary: string;
  description: string;
  requirements: string;
  tags: string;
  status: 'Active' | 'Paused' | 'Closed';
  postedDate: string;
  applicants: number;
  views: number;
  postedBy: string;
  postedByRole: 'hirer' | 'admin';
}

export default function ViewInternshipPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [internship, setInternship] = useState<Internship | null>(null);

  useEffect(() => {
    // Load internship data
    const loadInternship = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockInternship: Internship = {
          id: internshipId,
          title: 'Software Engineering Intern',
          company: 'Safaricom PLC',
          location: 'Nairobi, Kenya',
          type: 'Hybrid',
          duration: '6 months',
          salary: 'KES 40,000 - 60,000/month',
          description: 'Join our engineering team as a software development intern. You will work on real projects, learn from experienced developers, and contribute to our mobile and web applications. This is an excellent opportunity to gain hands-on experience in a fast-paced technology environment.\n\nYou will be working with our development team on various projects including mobile app development, web applications, and backend services. The internship includes mentorship from senior developers and exposure to modern development practices.',
          requirements: '- Computer Science or related field student\n- Knowledge of JavaScript, Python, or Java\n- Strong problem-solving skills\n- Team player with good communication skills\n- Familiarity with version control (Git)\n- Basic understanding of databases',
          tags: 'Software, Engineering, JavaScript, Python, Mobile',
          status: 'Active',
          postedDate: '2024-01-10',
          applicants: 45,
          views: 234,
          postedBy: 'john@safaricom.co.ke',
          postedByRole: 'hirer'
        };
        
        setInternship(mockInternship);
      } catch (err) {
        alert('Failed to load internship data');
        router.push('/dashboard/internships');
      } finally {
        setIsLoading(false);
      }
    };

    loadInternship();
  }, [internshipId, router]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      // TODO: Replace with actual API call
      router.push('/dashboard/internships');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircleIcon className="h-5 w-5" />;
      case 'Paused': return <PauseIcon className="h-5 w-5" />;
      case 'Closed': return <XCircleIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/internships"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Internship Details</h1>
            <p className="text-gray-600">Loading internship data...</p>
          </div>
        </div>
        
        <div className="bg-white shadow-soft rounded-lg p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/internships"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Internship Not Found</h1>
            <p className="text-gray-600">The requested internship could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/internships"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Internship Details</h1>
            <p className="text-gray-600">
              Posted by: {internship.postedBy} ({internship.postedByRole === 'admin' ? 'Admin' : 'Hirer'})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/internships/${internship.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{internship.title}</h2>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    {internship.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {internship.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {internship.duration}
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(internship.status)}`}>
                {getStatusIcon(internship.status)}
                {internship.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Work Type</div>
                <div className="font-semibold">{internship.type}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Salary Range</div>
                <div className="font-semibold">{internship.salary}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Posted Date</div>
                <div className="font-semibold">{new Date(internship.postedDate).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Tags */}
            {internship.tags && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {internship.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
            <div className="prose prose-sm max-w-none">
              {internship.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="space-y-2">
              {internship.requirements.split('\n').map((requirement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{requirement.replace(/^-\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Applicants</span>
                </div>
                <span className="font-semibold text-gray-900">{internship.applicants}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Views</span>
                </div>
                <span className="font-semibold text-gray-900">{internship.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Posted</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {Math.floor((Date.now() - new Date(internship.postedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                View Applicants
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Download Report
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Share Internship
              </button>
            </div>
          </div>

          {/* Posted By Info */}
          <div className="bg-white shadow-soft rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <div className="font-medium">{internship.postedBy}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Role:</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  internship.postedByRole === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {internship.postedByRole === 'admin' ? 'Admin' : 'Hirer'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
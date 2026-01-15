'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  duration: string;
  salary: string;
  postedDate: string;
  status: 'Active' | 'Paused' | 'Closed';
  applicants: number;
  views: number;
  postedBy: string;
  postedByRole: 'hirer' | 'admin';
}

export default function CompanyAdminInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockInternships: Internship[] = [
      {
        id: '1',
        title: 'Software Engineering Intern',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        type: 'Hybrid',
        duration: '6 months',
        salary: 'KES 40,000 - 60,000/month',
        postedDate: '2024-01-10',
        status: 'Active',
        applicants: 45,
        views: 234,
        postedBy: 'john@safaricom.co.ke',
        postedByRole: 'hirer'
      },
      {
        id: '2',
        title: 'Data Science Intern',
        company: 'Equity Bank',
        location: 'Nairobi, Kenya',
        type: 'On-site',
        duration: '6 months',
        salary: 'KES 50,000 - 70,000/month',
        postedDate: '2024-01-08',
        status: 'Active',
        applicants: 67,
        views: 189,
        postedBy: 'admin@practicheck.com',
        postedByRole: 'admin'
      },
      {
        id: '3',
        title: 'Marketing Intern',
        company: 'Jumia Kenya',
        location: 'Remote',
        type: 'Remote',
        duration: '3 months',
        salary: 'KES 30,000 - 45,000/month',
        postedDate: '2024-01-05',
        status: 'Paused',
        applicants: 23,
        views: 156,
        postedBy: 'hr@jumia.co.ke',
        postedByRole: 'hirer'
      },
      {
        id: '4',
        title: 'UI/UX Design Intern',
        company: 'Andela',
        location: 'Remote',
        type: 'Remote',
        duration: '4 months',
        salary: 'KES 35,000 - 55,000/month',
        postedDate: '2024-01-03',
        status: 'Closed',
        applicants: 89,
        views: 345,
        postedBy: 'design@andela.com',
        postedByRole: 'hirer'
      }
    ];
    setInternships(mockInternships);
  }, []);

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || internship.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Paused' | 'Closed') => {
    setInternships(prev => prev.map(internship => 
      internship.id === id ? { ...internship, status: newStatus } : internship
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      setInternships(prev => prev.filter(internship => internship.id !== id));
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
      case 'Active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'Paused': return <ClockIcon className="h-4 w-4" />;
      case 'Closed': return <XCircleIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internship Management</h1>
          <p className="text-gray-600">Manage all internship postings across the platform</p>
        </div>
        <Link
          href="/dashboard/internships/create"
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Post New Internship
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.filter(i => i.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paused</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.filter(i => i.status === 'Paused').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.filter(i => i.status === 'Closed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.reduce((sum, i) => sum + i.views, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search internships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Internships Table */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInternships.map((internship) => (
                <tr key={internship.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {internship.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {internship.location} • {internship.type} • {internship.duration}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{internship.company}</div>
                    <div className="text-sm text-gray-500">{internship.salary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={internship.status}
                      onChange={(e) => handleStatusChange(internship.id, e.target.value as any)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${getStatusColor(internship.status)}`}
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{internship.applicants}</div>
                    <div className="text-sm text-gray-500">{internship.views} views</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{internship.postedBy}</div>
                    <div className={`text-xs ${internship.postedByRole === 'admin' ? 'text-blue-600' : 'text-green-600'}`}>
                      {internship.postedByRole === 'admin' ? 'Admin' : 'Hirer'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/internships/${internship.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/internships/${internship.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(internship.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
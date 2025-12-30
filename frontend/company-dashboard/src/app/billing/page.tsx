'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  EyeIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner, LoadingOverlay } from '../../components/LoadingSpinner';
import { useAuth } from '../../lib/auth';
import { apiRequest } from '../../lib/auth';
import Link from 'next/link';

interface BillingUniversity {
  id: string;
  name: string;
  location: string;
  plan: string;
  monthlyFee: number;
  status: string;
  lastBillingDate: string;
  nextBillingDate: string;
  totalPaid: number;
  outstandingAmount: number;
  invoiceCount: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<BillingUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/billing/universities');
      setUniversities(data);
    } catch (error) {
      console.error('Error loading billing data:', error);
      // Fallback to mock data
      setUniversities(mockBillingData);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uni.location.toLowerCase().includes(searchTerm.toLowerCase());
    const outstandingAmount = uni.outstandingAmount || 0;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && outstandingAmount === 0) ||
                         (statusFilter === 'outstanding' && outstandingAmount > 0);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (outstandingAmount: number) => {
    if (outstandingAmount === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Paid
        </span>
      );
    } else if (outstandingAmount > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationCircleIcon className="h-3 w-3 mr-1" />
          Outstanding
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Standard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendInvoice = async (universityId: string) => {
    try {
      await apiRequest(`/billing/send-invoice/${universityId}`, {
        method: 'POST'
      });
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const handleDownloadInvoice = async (universityId: string) => {
    try {
      await apiRequest(`/billing/invoice/${universityId}`, {
        method: 'POST'
      });
      alert('Invoice generated successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleBulkInvoices = async () => {
    try {
      const result = await apiRequest('/billing/bulk-invoices', {
        method: 'POST'
      });
      alert(`Bulk invoices sent! ${result.message}`);
    } catch (error) {
      console.error('Error sending bulk invoices:', error);
      alert('Failed to send bulk invoices. Please try again.');
    }
  };

  const handlePaymentReminders = async () => {
    try {
      const result = await apiRequest('/billing/payment-reminders', {
        method: 'POST'
      });
      alert(`Payment reminders sent! ${result.message}`);
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      alert('Failed to send payment reminders. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Billing Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${universities.reduce((sum, uni) => sum + uni.totalPaid, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${universities.reduce((sum, uni) => sum + uni.outstandingAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Outstanding</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{universities.length}</div>
                <div className="text-sm text-gray-500">Active Clients</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {universities.reduce((sum, uni) => sum + uni.invoiceCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Invoices</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="outstanding">Outstanding</option>
              </select>
              <button
                onClick={handleBulkInvoices}
                className="btn-primary"
              >
                Send Bulk Invoices
              </button>
              <button
                onClick={handlePaymentReminders}
                className="btn-outline"
              >
                Payment Reminders
              </button>
            </div>
          </div>
        </div>

        {/* Universities Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">University Billing</h2>
            <p className="text-sm text-gray-500">Manage billing and invoices for all universities</p>
          </div>

          <LoadingOverlay isLoading={loading}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan & Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUniversities.map((university) => (
                    <tr key={university.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{university.name}</div>
                            <div className="text-sm text-gray-500">{university.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(university.plan)}`}>
                            {university.plan}
                          </span>
                          <div className="text-sm font-medium text-gray-900 mt-1">${university.monthlyFee}/month</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(university.outstandingAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {university.nextBillingDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(university.outstandingAmount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/billing/${university.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleSendInvoice(university.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send Invoice"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(university.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Invoice"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
}

// Mock data for development
const mockBillingData: BillingUniversity[] = [
  {
    id: '1',
    name: 'University of Technology',
    location: 'Nairobi, Kenya',
    plan: 'Enterprise',
    monthlyFee: 2500,
    status: 'active',
    lastBillingDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
    totalPaid: 25000,
    outstandingAmount: 0,
    invoiceCount: 12
  },
  {
    id: '2',
    name: 'State University',
    location: 'Mombasa, Kenya',
    plan: 'Professional',
    monthlyFee: 1800,
    status: 'active',
    lastBillingDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
    totalPaid: 18000,
    outstandingAmount: 1800,
    invoiceCount: 10
  },
  {
    id: '3',
    name: 'Technical College',
    location: 'Kisumu, Kenya',
    plan: 'Standard',
    monthlyFee: 1200,
    status: 'active',
    lastBillingDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
    totalPaid: 12000,
    outstandingAmount: 0,
    invoiceCount: 8
  }
];
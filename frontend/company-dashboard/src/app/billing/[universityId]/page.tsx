'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner, LoadingOverlay } from '../../../components/LoadingSpinner';
import { useAuth } from '../../../lib/auth';
import { apiRequest } from '../../../lib/auth';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BillingHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  description: string;
  paidDate?: string;
}

interface UniversityBilling {
  id: string;
  name: string;
  location: string;
  plan: string;
  monthlyFee: number;
  status: string;
  totalPaid: number;
  outstandingAmount: number;
  nextBillingDate: string;
  contactEmail: string;
  billingAddress: string;
  billingHistory: BillingHistory[];
}

export default function UniversityBillingPage() {
  const { user } = useAuth();
  const params = useParams();
  const universityId = params.universityId as string;
  
  const [university, setUniversity] = useState<UniversityBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    location: '',
    monthlyFee: 0,
    contactEmail: '',
    billingAddress: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (universityId) {
      loadUniversityBilling();
    }
  }, [universityId]);

  const loadUniversityBilling = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/admin/billing/universities/${universityId}`);
      setUniversity(data);
      setEditData({
        name: data.name,
        location: data.location,
        monthlyFee: data.monthlyFee,
        contactEmail: data.contactEmail,
        billingAddress: data.billingAddress
      });
    } catch (error) {
      console.error('Error loading university billing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiRequest(`/api/admin/billing/universities/${universityId}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      await loadUniversityBilling();
      setEditMode(false);
      alert('University billing information updated successfully!');
    } catch (error) {
      console.error('Error updating university billing:', error);
      alert('Failed to update university billing information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const amount = university?.monthlyFee || 0;
      const description = `Monthly subscription - ${university?.plan} Plan`;
      
      await apiRequest(`/api/admin/billing/universities/${universityId}/invoices`, {
        method: 'POST',
        body: JSON.stringify({ amount, description })
      });
      
      await loadUniversityBilling();
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await apiRequest(`/api/admin/billing/invoices/${invoiceId}/send`, {
        method: 'POST'
      });
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/billing/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">University not found</h2>
          <p className="text-gray-600 mb-4">The requested university could not be found.</p>
          <Link href="/billing" className="btn-primary">
            Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/billing" className="text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 mr-2 inline" />
                Back to Billing
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">{university.name} - Billing</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* University Info Card */}
        <div className="card mb-8">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">University Information</h2>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn-outline"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{university.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{university.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee</label>
              {editMode ? (
                <input
                  type="number"
                  value={editData.monthlyFee}
                  onChange={(e) => setEditData({ ...editData, monthlyFee: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  step="0.01"
                />
              ) : (
                <p className="text-gray-900">${university.monthlyFee.toLocaleString()}/month</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <p className="text-gray-900">{university.plan}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              {editMode ? (
                <input
                  type="email"
                  value={editData.contactEmail}
                  onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{university.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              {editMode ? (
                <textarea
                  value={editData.billingAddress}
                  onChange={(e) => setEditData({ ...editData, billingAddress: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-line">{university.billingAddress}</p>
              )}
            </div>
          </div>

          {editMode && (
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditMode(false)}
                className="btn-outline"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Billing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${university.totalPaid.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Paid</div>
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
                  ${university.outstandingAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Outstanding</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-lg font-bold text-gray-900">
                  {university.nextBillingDate}
                </div>
                <div className="text-sm text-gray-500">Next Billing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateInvoice}
              className="btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
            <p className="text-sm text-gray-500">All invoices and payment history</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {university.billingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p>No billing history found</p>
                      <p className="text-sm">Create an invoice to get started</p>
                    </td>
                  </tr>
                ) : (
                  university.billingHistory.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-gray-500">{invoice.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download PDF"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Send Invoice"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(`http://localhost:8001/billing/invoices/${invoice.id}/print`, '_blank')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Invoice"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
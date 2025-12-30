'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  PencilIcon,
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner, LoadingOverlay } from '../../../components/LoadingSpinner';
import { useAuth } from '../../../lib/auth';
import { apiRequest } from '../../../lib/auth';
import Link from 'next/link';

interface BillingHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
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
  billingHistory: BillingHistory[];
  contactEmail: string;
  billingAddress: string;
}

export default function UniversityBillingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const universityId = params.universityId as string;
  
  const [university, setUniversity] = useState<UniversityBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistory | null>(null);

  useEffect(() => {
    if (universityId) {
      loadUniversityBilling();
    }
  }, [universityId]);

  const loadUniversityBilling = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/billing/universities/${universityId}`);
      setUniversity(data);
    } catch (error) {
      console.error('Error loading university billing:', error);
      // Fallback to mock data
      setUniversity(mockUniversityBilling);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await apiRequest(`/billing/invoices/${invoiceId}/send`, { method: 'POST' });
      alert('Invoice sent successfully!');
      loadUniversityBilling();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/billing/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

  const handlePrintInvoice = (invoiceId: string) => {
    window.open(`http://localhost:8001/billing/invoices/${invoiceId}/print`, '_blank');
  };

  const handleCreateInvoice = async () => {
    try {
      await apiRequest(`/billing/universities/${universityId}/invoices`, { 
        method: 'POST',
        body: JSON.stringify({
          amount: university?.monthlyFee,
          description: `Monthly subscription - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        })
      });
      alert('Invoice created successfully!');
      loadUniversityBilling();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
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
        return null;
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
          <h2 className="text-2xl font-bold text-gray-900">University not found</h2>
          <Link href="/billing" className="text-primary-600 hover:text-primary-500 mt-4 inline-block">
            ← Back to Billing
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
                ← Back to Billing
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                <h1 className="text-xl font-semibold text-gray-900">{university.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateInvoice}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* University Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* University Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">University Details</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-primary-600 hover:text-primary-900"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <div className="text-sm text-gray-900">{university.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <div className="text-sm text-gray-900">{university.location}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Plan</label>
                <div className="text-sm text-gray-900">{university.plan}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Monthly Fee</label>
                <div className="text-sm font-medium text-gray-900">${university.monthlyFee}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Email</label>
                <div className="text-sm text-gray-900">{university.contactEmail}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Billing Address</label>
                <div className="text-sm text-gray-900">{university.billingAddress}</div>
              </div>
            </div>
          </div>

          {/* Billing Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">${university.totalPaid.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold text-gray-900">${university.outstandingAmount.toLocaleString()}</div>
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
                  <div className="text-lg font-bold text-gray-900">{university.nextBillingDate}</div>
                  <div className="text-sm text-gray-500">Next Billing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
            <p className="text-sm text-gray-500">Complete invoice and payment history</p>
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
                {university.billingHistory.map((invoice) => (
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
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Invoice"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Send Invoice"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Download PDF"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(invoice.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Print Invoice"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          university={university}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Edit University Modal */}
      {showEditModal && (
        <EditUniversityModal
          university={university}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedData) => {
            setUniversity({ ...university, ...updatedData });
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

// Invoice Preview Modal Component
function InvoicePreviewModal({ 
  invoice, 
  university, 
  onClose 
}: { 
  invoice: BillingHistory; 
  university: UniversityBilling; 
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600">#{invoice.invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">PractiCheck Ltd.</p>
                <p>123 Business Street</p>
                <p>Nairobi, Kenya</p>
                <p>info@practicheck.com</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{university.name}</p>
                <p>{university.billingAddress}</p>
                <p>{university.contactEmail}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-gray-600">Invoice Date: <span className="font-medium">{invoice.date}</span></p>
              <p className="text-sm text-gray-600">Due Date: <span className="font-medium">{invoice.dueDate}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status: {getStatusBadge(invoice.status)}</p>
              {invoice.paidDate && (
                <p className="text-sm text-gray-600">Paid Date: <span className="font-medium">{invoice.paidDate}</span></p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="border border-gray-200 rounded-lg mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">{invoice.description}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${invoice.amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                  <td className="px-4 py-3 text-lg font-bold text-gray-900 text-right">${invoice.amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit University Modal Component
function EditUniversityModal({ 
  university, 
  onClose, 
  onSave 
}: { 
  university: UniversityBilling; 
  onClose: () => void; 
  onSave: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    name: university.name,
    location: university.location,
    monthlyFee: university.monthlyFee,
    contactEmail: university.contactEmail,
    billingAddress: university.billingAddress
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/billing/universities/${university.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      onSave(formData);
    } catch (error) {
      console.error('Error updating university:', error);
      alert('Failed to update university. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit University Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
                <input
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Mock data for development
const mockUniversityBilling: UniversityBilling = {
  id: '1',
  name: 'University of Technology',
  location: 'Nairobi, Kenya',
  plan: 'Enterprise',
  monthlyFee: 2500,
  status: 'active',
  totalPaid: 25000,
  outstandingAmount: 0,
  nextBillingDate: '2024-02-01',
  contactEmail: 'billing@uot.ac.ke',
  billingAddress: '123 University Avenue\nNairobi, Kenya\n00100',
  billingHistory: [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-01-01',
      dueDate: '2024-01-31',
      amount: 2500,
      status: 'paid',
      description: 'Monthly subscription - January 2024',
      paidDate: '2024-01-15'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2023-012',
      date: '2023-12-01',
      dueDate: '2023-12-31',
      amount: 2500,
      status: 'paid',
      description: 'Monthly subscription - December 2023',
      paidDate: '2023-12-20'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-011',
      date: '2023-11-01',
      dueDate: '2023-11-30',
      amount: 2500,
      status: 'paid',
      description: 'Monthly subscription - November 2023',
      paidDate: '2023-11-18'
    }
  ]
};
'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LoadingButton } from './LoadingSpinner';
import { apiRequest } from '../lib/auth';

interface AddUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUniversityModal({ isOpen, onClose, onSuccess }: AddUniversityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    password_option: 'auto' // 'auto' or 'custom'
  });
  const [customPassword, setCustomPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        ...(formData.password_option === 'custom' && customPassword ? { admin_password: customPassword } : {})
      };
      delete requestData.password_option; // Remove this field before sending to backend
      
      const result = await apiRequest('/api/admin/universities', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      // Show success message with admin credentials info
      const successMessage = `University created successfully!

University Details:
• Name: ${formData.name}
• Location: ${formData.location}
• University ID: ${result.university_id}
• Dashboard URL: ${result.dashboard_url}

Admin Account:
• Email: ${formData.admin_email}
• Credentials sent to: ${formData.admin_email}
• Email sent: ${result.email_sent ? 'Yes' : 'No'}

The university admin can now log in and start managing their institution!`;
      
      alert(successMessage);
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        password_option: 'auto'
      });
      setCustomPassword('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create university');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New University</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            {/* University Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                University Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., University of Technology"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Nairobi, Kenya"
                required
              />
            </div>

            {/* Admin Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">University Administrator</h3>
              
              {/* Admin Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Name *
                </label>
                <input
                  type="text"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              {/* Admin Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Email *
                </label>
                <input
                  type="email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., admin@university.edu"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Login credentials will be sent to this email
                </p>
              </div>

              {/* Admin Phone (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., +254700000000"
                />
              </div>

              {/* Password Option */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Password
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="auto-password"
                      name="password_option"
                      value="auto"
                      checked={formData.password_option === 'auto'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="auto-password" className="text-sm text-gray-700">
                      Auto-generate secure password (recommended)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="custom-password"
                      name="password_option"
                      value="custom"
                      checked={formData.password_option === 'custom'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="custom-password" className="text-sm text-gray-700">
                      Set custom password
                    </label>
                  </div>
                  {formData.password_option === 'custom' && (
                    <input
                      type="password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="input-field mt-2"
                      placeholder="Enter custom password (min 8 characters)"
                      minLength={8}
                    />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.password_option === 'auto' 
                    ? 'A secure password will be generated and sent via email'
                    : 'Password will be sent to the admin via email'
                  }
                </p>
              </div>
            </div>

            {/* Plan Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• University account will be created with Standard plan</li>
                <li>• Admin credentials will be generated and emailed</li>
                <li>• University admin can access their dashboard immediately</li>
                <li>• Admin can create faculty admins and manage courses</li>
                <li>• Students can register and start using the platform</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={saving}
              loadingText="Creating..."
              className="btn-primary"
              disabled={!formData.name || !formData.location || !formData.admin_name || !formData.admin_email || (formData.password_option === 'custom' && !customPassword)}
            >
              Create University
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
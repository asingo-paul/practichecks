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
    monthly_fee: 1200
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiRequest('/dashboard/universities', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        monthly_fee: 1200
      });
      
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
      [name]: name === 'monthly_fee' ? parseFloat(value) || 0 : value
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

            {/* Monthly Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Monthly Fee (USD) *
              </label>
              <input
                type="number"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Standard plan starts at $1,200/month
              </p>
            </div>

            {/* Plan Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Default Plan Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Student management system</li>
                <li>• Attachment tracking</li>
                <li>• Faculty dashboard</li>
                <li>• Basic reporting</li>
                <li>• Email support</li>
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
              disabled={!formData.name || !formData.location}
            >
              Create University
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';
import { apiRequest } from '../lib/auth';

interface UniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  mode: 'view' | 'edit';
}

export function UniversityModal({ isOpen, onClose, universityId, mode }: UniversityModalProps) {
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && universityId) {
      loadUniversityDetails();
    }
  }, [isOpen, universityId]);

  const loadUniversityDetails = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/admin/dashboard/universities/${universityId}`);
      setUniversity(data);
      setEditData({
        name: data.name,
        location: data.location,
        monthly_fee: data.monthly_fee
      });
    } catch (error) {
      console.error('Error loading university details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiRequest(`/api/admin/dashboard/universities/${universityId}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      await loadUniversityDetails();
      onClose();
    } catch (error) {
      console.error('Error updating university:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'maintenance': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit University' : 'University Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : university ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Name
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-lg font-medium">{university.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <span className="text-gray-900">{university.location}</span>
                  )}
                </div>
              </div>

              {/* Status and Health */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(university.status)}`}>
                    {getStatusIcon(university.status)}
                    <span className="ml-2 capitalize">{university.status}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Score
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {university.health}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Sync
                  </label>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {university.last_sync}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-blue-900">{university.students}</div>
                      <div className="text-sm text-blue-600">Students</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-green-900">{university.attachments}</div>
                      <div className="text-sm text-green-600">Attachments</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-purple-900">{university.faculties}</div>
                      <div className="text-sm text-purple-600">Faculties</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-yellow-900">${university.monthly_fee}</div>
                      <div className="text-sm text-yellow-600">Monthly Fee</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Fee (Edit Mode) */}
              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Fee ($)
                  </label>
                  <input
                    type="number"
                    value={editData.monthly_fee}
                    onChange={(e) => setEditData({...editData, monthly_fee: parseFloat(e.target.value)})}
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {/* Recent Activities */}
              {mode === 'view' && university.recent_activities && university.recent_activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    {university.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{activity.action}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(activity.time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">Failed to load university details</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            {mode === 'edit' ? 'Cancel' : 'Close'}
          </button>
          {mode === 'edit' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  BuildingLibraryIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { Logo } from '../../../components/Logo';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

interface DashboardStats {
  total_courses: number;
  total_students: number;
  total_lecturers: number;
  active_assessments: number;
  pending_assignments: number;
  recent_activities: Array<{
    action: string;
    details: string;
    time: string;
  }>;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  semester?: string;
  year?: number;
  is_active: boolean;
  student_count: number;
  lecturer_count: number;
  created_at: string;
}

interface Lecturer {
  id: string;
  name: string;
  email: string;
  staff_id: string;
  phone?: string;
  office_location?: string;
  specialization?: string;
  max_students: number;
  current_students: number;
  workload_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface AssessmentRequest {
  id: string;
  student_name: string;
  student_email: string;
  course_name: string;
  assessment_type: string;
  description?: string;
  priority: string;
  due_date?: string;
  status: string;
  requested_at: string;
}

export default function FacultyAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>([]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateLecturerModal, setShowCreateLecturerModal] = useState(false);
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const [createLecturerLoading, setCreateLecturerLoading] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchDashboardData();
    }
    setLoading(false);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8004/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch courses
      const coursesResponse = await fetch('http://localhost:8004/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Fetch lecturers
      const lecturersResponse = await fetch('http://localhost:8004/lecturers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (lecturersResponse.ok) {
        const lecturersData = await lecturersResponse.json();
        setLecturers(lecturersData);
      }

      // Fetch assessment requests
      const assessmentsResponse = await fetch('http://localhost:8004/assessment-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json();
        setAssessmentRequests(assessmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleCreateCourse = async (formData: any) => {
    setCreateCourseLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8004/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Course created successfully!');
        setShowCreateCourseModal(false);
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    } finally {
      setCreateCourseLoading(false);
    }
  };

  const handleCreateLecturer = async (formData: any) => {
    setCreateLecturerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8004/lecturers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Lecturer created successfully! ${result.email_sent ? 'Welcome email sent.' : 'Please send credentials manually.'}`);
        setShowCreateLecturerModal(false);
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating lecturer:', error);
      alert('Error creating lecturer. Please try again.');
    } finally {
      setCreateLecturerLoading(false);
    }
  };

  const handleAssignLecturer = async (requestId: string, lecturerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8004/assessment-requests/${requestId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lecturer_id: lecturerId })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      alert('Error assigning lecturer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Faculty Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-primary-600">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  12
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'F'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'Faculty Admin'}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-gray-600">
            Manage faculty operations and oversee student industrial attachments.
          </p>
          {user?.profile?.faculty && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <BuildingLibraryIcon className="h-4 w-4 mr-1" />
              {user.profile.faculty} Faculty
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.total_courses || 0}</div>
                <div className="text-sm text-gray-500">Courses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.total_students || 0}</div>
                <div className="text-sm text-gray-500">Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.total_lecturers || 0}</div>
                <div className="text-sm text-gray-500">Lecturers</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.active_assessments || 0}</div>
                <div className="text-sm text-gray-500">Assessments</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats?.pending_assignments || 0}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assessment Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Assessment Requests</h3>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {assessmentRequests.filter(req => req.status === 'pending').length} pending
                </span>
              </div>
              <div className="p-6">
                {assessmentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment requests</h3>
                    <p className="mt-1 text-sm text-gray-500">Students will submit assessment requests here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessmentRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {request.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.student_name}</p>
                            <p className="text-xs text-gray-500">
                              {request.assessment_type} • {request.course_name} • Priority: {request.priority}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'assigned' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status}
                          </span>
                          {request.status === 'pending' && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignLecturer(request.id, e.target.value);
                                }
                              }}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Assign Lecturer</option>
                              {lecturers.filter(l => l.workload_percentage < 100).map(lecturer => (
                                <option key={lecturer.id} value={lecturer.id}>
                                  {lecturer.name} ({lecturer.workload_percentage.toFixed(0)}% load)
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                <button 
                  onClick={() => setShowCreateLecturerModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center">
                    <UserPlusIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Add Lecturer</span>
                  </div>
                  <PlusIcon className="h-4 w-4 text-gray-400" />
                </button>

                <button 
                  onClick={() => setShowCreateCourseModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Add Course</span>
                  </div>
                  <PlusIcon className="h-4 w-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Review Assessments</span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {stats?.pending_assignments || 0}
                  </span>
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Faculty Reports</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Lecturers Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lecturers Workload</h3>
              </div>
              <div className="p-6">
                {lecturers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No lecturers added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lecturers.slice(0, 5).map((lecturer) => (
                      <div key={lecturer.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lecturer.name}</p>
                          <p className="text-xs text-gray-500">{lecturer.staff_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {lecturer.current_students}/{lecturer.max_students}
                          </p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                lecturer.workload_percentage > 80 ? 'bg-red-500' :
                                lecturer.workload_percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(lecturer.workload_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Courses</h3>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No courses created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{course.name}</p>
                          <p className="text-xs text-gray-500">{course.code} • {course.credits} credits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{course.student_count} students</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <CreateCourseModal
          onClose={() => setShowCreateCourseModal(false)}
          onSubmit={handleCreateCourse}
          loading={createCourseLoading}
        />
      )}

      {/* Create Lecturer Modal */}
      {showCreateLecturerModal && (
        <CreateLecturerModal
          onClose={() => setShowCreateLecturerModal(false)}
          onSubmit={handleCreateLecturer}
          loading={createLecturerLoading}
        />
      )}
    </div>
  );
}

// Create Course Modal Component
function CreateCourseModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Code</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Create Lecturer Modal Component
function CreateLecturerModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    staff_id: '',
    phone: '',
    office_location: '',
    specialization: '',
    max_students: 20
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Lecturer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Staff ID</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.staff_id}
                onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Students</label>
              <input
                type="number"
                min="1"
                max="50"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.max_students}
                onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Lecturer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  PlusIcon,
  CogIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner, LoadingOverlay, Skeleton } from '../../components/LoadingSpinner';
import { Logo } from '../../components/Logo';
import { UniversityModal } from '../../components/UniversityModal';
import { AddUniversityModal } from '../../components/AddUniversityModal';
import { NotificationsModal } from '../../components/NotificationsModal';
import { SessionTimeoutWarning } from '../../components/SessionTimeoutWarning';
import { apiRequest } from '../../lib/auth';
import { useAuth } from '../../lib/auth';
import Link from 'next/link';

// Enhanced mock data
const mockStats = {
  totalUniversities: 24,
  activeStudents: 1847,
  activeAttachments: 892,
  systemHealth: 98.5,
  monthlyRevenue: 45600,
  monthlyGrowth: {
    universities: 12.5,
    students: 23.8,
    attachments: 18.2,
    revenue: 15.3
  }
};

const mockUniversities = [
  { 
    id: 1, 
    name: 'University of Technology', 
    students: 245, 
    status: 'active', 
    health: 99.2, 
    lastSync: '2 minutes ago',
    plan: 'Enterprise',
    monthlyFee: 2500,
    attachments: 89,
    faculties: 8,
    location: 'Nairobi, Kenya'
  },
  { 
    id: 2, 
    name: 'State University', 
    students: 189, 
    status: 'active', 
    health: 97.8, 
    lastSync: '5 minutes ago',
    plan: 'Professional',
    monthlyFee: 1800,
    attachments: 67,
    faculties: 6,
    location: 'Mombasa, Kenya'
  },
  { 
    id: 3, 
    name: 'Technical College', 
    students: 156, 
    status: 'maintenance', 
    health: 85.4, 
    lastSync: '1 hour ago',
    plan: 'Standard',
    monthlyFee: 1200,
    attachments: 45,
    faculties: 4,
    location: 'Kisumu, Kenya'
  },
  { 
    id: 4, 
    name: 'Engineering Institute', 
    students: 203, 
    status: 'active', 
    health: 98.9, 
    lastSync: '3 minutes ago',
    plan: 'Professional',
    monthlyFee: 1800,
    attachments: 78,
    faculties: 7,
    location: 'Eldoret, Kenya'
  },
];

const mockAlerts = [
  { id: 1, type: 'warning', message: 'High CPU usage on University of Technology cluster', time: '5 minutes ago', severity: 'medium' },
  { id: 2, type: 'info', message: 'Scheduled maintenance for State University at 2:00 AM', time: '1 hour ago', severity: 'low' },
  { id: 3, type: 'success', message: 'Successfully onboarded Technical College', time: '2 hours ago', severity: 'low' },
  { id: 4, type: 'error', message: 'Database connection timeout for Engineering Institute', time: '10 minutes ago', severity: 'high' },
];

const mockSystemMetrics = {
  cpuUsage: 68,
  memoryUsage: 72,
  diskUsage: 45,
  networkTraffic: 1.2, // GB/hour
  activeConnections: 1247,
  responseTime: 145 // ms
};

const mockRecentActivities = [
  { id: 1, action: 'University Created', target: 'Coastal Technical Institute', user: 'Admin', time: '2 hours ago' },
  { id: 2, action: 'System Update', target: 'Platform v2.1.3', user: 'System', time: '6 hours ago' },
  { id: 3, action: 'Billing Updated', target: 'State University', user: 'Finance Team', time: '1 day ago' },
  { id: 4, action: 'Maintenance Completed', target: 'Technical College', user: 'DevOps', time: '2 days ago' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, loading, prefix = '', suffix = '' }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-lg" variant="rectangular" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="h-4 w-20 mb-2" variant="text" />
            <Skeleton className="h-6 w-16" variant="text" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </div>
              {change !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 flex-shrink-0 self-center" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 flex-shrink-0 self-center" />
                  )}
                  <span className="sr-only">{change >= 0 ? 'Increased' : 'Decreased'} by</span>
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

const UniversityCard: React.FC<{ university: any; loading?: boolean; onAction: (action: string, university: any) => void }> = ({ 
  university, 
  loading, 
  onAction 
}) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" variant="text" />
            <Skeleton className="h-4 w-24 mb-1" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'maintenance': return 'badge-warning';
      case 'error': return 'badge-error';
      default: return 'badge-gray';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Standard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">{university.name}</h3>
            <span className={`badge ${getPlanColor(university.plan)}`}>
              {university.plan}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-2">{university.location}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Students:</span>
              <span className="ml-1 font-medium">{university.students}</span>
            </div>
            <div>
              <span className="text-gray-500">Attachments:</span>
              <span className="ml-1 font-medium">{university.attachments}</span>
            </div>
            <div>
              <span className="text-gray-500">Faculties:</span>
              <span className="ml-1 font-medium">{university.faculties}</span>
            </div>
            <div>
              <span className="text-gray-500">Monthly:</span>
              <span className="ml-1 font-medium">${university.monthlyFee}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Health: </span>
                <span className={`ml-1 text-sm font-medium ${getHealthColor(university.health)}`}>
                  {university.health}%
                </span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{university.lastSync}</span>
              </div>
            </div>
            <span className={`badge ${getStatusColor(university.status)}`}>
              {university.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button 
            onClick={() => onAction('view', university)}
            className="btn-outline text-xs px-2 py-1"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            View
          </button>
          <button 
            onClick={() => onAction('edit', university)}
            className="btn-outline text-xs px-2 py-1"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="flex space-x-1">
          {university.status === 'active' ? (
            <button 
              onClick={() => onAction('pause', university)}
              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
              title="Pause"
            >
              <PauseIcon className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={() => onAction('start', university)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Start"
            >
              <PlayIcon className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={() => onAction('restart', university)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Restart"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AlertItem: React.FC<{ alert: any; onDismiss: (id: number) => void }> = ({ alert, onDismiss }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className={`flex items-start space-x-3 py-3 px-3 border-l-4 ${getSeverityColor(alert.severity)} bg-gray-50 rounded-r`}>
      <div className="flex-shrink-0">
        {getAlertIcon(alert.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{alert.message}</p>
        <p className="text-xs text-gray-500">{alert.time}</p>
      </div>
      <button 
        onClick={() => onDismiss(alert.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const SystemMetricsCard: React.FC<{ metrics: any; loading: boolean }> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <Skeleton className="h-5 w-32" variant="text" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-2 w-32" variant="rectangular" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">System Metrics</h3>
        <p className="text-sm text-gray-500">Real-time system performance</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">CPU Usage</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(metrics.cpuUsage)}`}
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{metrics.cpuUsage}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Memory Usage</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(metrics.memoryUsage)}`}
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{metrics.memoryUsage}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Disk Usage</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(metrics.diskUsage)}`}
                style={{ width: `${metrics.diskUsage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{metrics.diskUsage}%</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Connections</span>
            <span className="font-medium">{metrics.activeConnections?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Response Time</span>
            <span className="font-medium">{metrics.responseTime}ms</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network Traffic</span>
            <span className="font-medium">{metrics.networkTraffic} GB/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ManagementDashboard() {
  const { user, logout, showTimeoutWarning, extendSession, timeRemaining } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [universities, setUniversities] = useState(mockUniversities);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [systemMetrics, setSystemMetrics] = useState(mockSystemMetrics);
  const [recentActivities, setRecentActivities] = useState(mockRecentActivities);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');
  const [addUniversityModalOpen, setAddUniversityModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  useEffect(() => {
    // Load real data from API
    const loadData = async () => {
      try {
        const [statsData, universitiesData, alertsData, metricsData] = await Promise.all([
          apiRequest('/dashboard/stats'),
          apiRequest('/dashboard/universities'),
          apiRequest('/dashboard/alerts'),
          apiRequest('/dashboard/metrics')
        ]);

        // Ensure stats has the expected structure
        const safeStats = {
          totalUniversities: statsData.totalUniversities || statsData.total_universities || 0,
          activeStudents: statsData.activeStudents || statsData.active_students || 0,
          activeAttachments: statsData.activeAttachments || statsData.active_attachments || 0,
          monthlyRevenue: statsData.monthlyRevenue || statsData.monthly_revenue || 0,
          systemHealth: statsData.systemHealth || statsData.system_health || 100,
          monthlyGrowth: statsData.monthlyGrowth || statsData.monthly_growth || {
            universities: 0,
            students: 0,
            attachments: 0,
            revenue: 0
          }
        };

        setStats(safeStats);
        setUniversities(universitiesData);
        setAlerts(alertsData);
        setSystemMetrics(metricsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data on error, but with proper UUID format
        try {
          const fallbackUniversities = await apiRequest('/dashboard/universities');
          setUniversities(fallbackUniversities);
        } catch (uniError) {
          console.error('Error loading universities:', uniError);
          setUniversities(mockUniversities);
        }
        
        // Use mock stats with proper structure
        setStats(mockStats);
        setAlerts(mockAlerts);
        setSystemMetrics(mockSystemMetrics);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      const [statsData, universitiesData, alertsData, metricsData] = await Promise.all([
        apiRequest('/dashboard/stats'),
        apiRequest('/dashboard/universities'),
        apiRequest('/dashboard/alerts'),
        apiRequest('/dashboard/metrics')
      ]);

      // Ensure stats has the expected structure
      const safeStats = {
        totalUniversities: statsData.totalUniversities || statsData.total_universities || 0,
        activeStudents: statsData.activeStudents || statsData.active_students || 0,
        activeAttachments: statsData.activeAttachments || statsData.active_attachments || 0,
        monthlyRevenue: statsData.monthlyRevenue || statsData.monthly_revenue || 0,
        systemHealth: statsData.systemHealth || statsData.system_health || 100,
        monthlyGrowth: statsData.monthlyGrowth || statsData.monthly_growth || {
          universities: 0,
          students: 0,
          attachments: 0,
          revenue: 0
        }
      };

      setStats(safeStats);
      setUniversities(universitiesData);
      setAlerts(alertsData);
      setSystemMetrics(metricsData);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Refresh data when modal closes to show any updates
    refreshData();
  };
  const handleUniversityAction = async (action: string, university: any) => {
    console.log(`Action: ${action} on university:`, university.name);
    
    try {
      switch (action) {
        case 'view':
          setSelectedUniversityId(university.id);
          setModalMode('view');
          setModalOpen(true);
          break;
          
        case 'edit':
          setSelectedUniversityId(university.id);
          setModalMode('edit');
          setModalOpen(true);
          break;
          
        case 'pause':
        case 'start':
        case 'restart':
          // Show loading state
          const updatedUniversitiesBefore = universities.map(u => 
            u.id === university.id ? { ...u, loading: true } : u
          );
          setUniversities(updatedUniversitiesBefore);

          await apiRequest(`/dashboard/universities/${university.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ action })
          });
          
          // Refresh universities list
          const updatedUniversities = await apiRequest('/dashboard/universities');
          setUniversities(updatedUniversities);
          
          // Show success message
          const actionMessages = {
            pause: 'paused',
            start: 'started',
            restart: 'restarted'
          };
          alert(`University ${actionMessages[action]} successfully!`);
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error performing university action:', error);
      
      // Remove loading state
      const updatedUniversitiesError = universities.map(u => 
        u.id === university.id ? { ...u, loading: false } : u
      );
      setUniversities(updatedUniversitiesError);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to perform action. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDismissAlert = async (alertId: number) => {
    try {
      await apiRequest(`/dashboard/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleBulkInvoices = async () => {
    try {
      const result = await apiRequest('/billing/bulk-invoices', { method: 'POST' });
      alert(`Bulk invoices sent! ${result.message}`);
    } catch (error) {
      console.error('Error sending bulk invoices:', error);
      alert('Failed to send bulk invoices. Please try again.');
    }
  };

  const handlePaymentReminders = async () => {
    try {
      const result = await apiRequest('/billing/payment-reminders', { method: 'POST' });
      alert(`Payment reminders sent! ${result.message}`);
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      alert('Failed to send payment reminders. Please try again.');
    }
  };

  const handleDownloadInvoice = async (universityId: string) => {
    try {
      const result = await apiRequest(`/billing/invoice/${universityId}`, { method: 'POST' });
      alert(`Invoice generated: ${result.invoice_data.invoice_number}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleSendInvoice = async (universityId: string) => {
    try {
      const result = await apiRequest(`/billing/send-invoice/${universityId}`, { method: 'POST' });
      alert(result.message);
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'universities', name: 'Universities', icon: BuildingOfficeIcon },
    { id: 'system', name: 'System Health', icon: ServerIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Logo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">System Operational</span>
              </div>
              <button 
                className="relative p-2 text-gray-600 hover:text-primary-600"
                onClick={() => setNotificationsModalOpen(true)}
              >
                <BellIcon className="h-6 w-6" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Monitor and manage your university attachment platform
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              <StatCard
                title="Total Universities"
                value={loading ? 0 : stats.totalUniversities}
                change={loading ? undefined : stats.monthlyGrowth?.universities}
                icon={BuildingOfficeIcon}
                loading={loading}
              />
              <StatCard
                title="Active Students"
                value={loading ? 0 : stats.activeStudents}
                change={loading ? undefined : stats.monthlyGrowth?.students}
                icon={UsersIcon}
                loading={loading}
              />
              <StatCard
                title="Active Attachments"
                value={loading ? 0 : stats.activeAttachments}
                change={loading ? undefined : stats.monthlyGrowth?.attachments}
                icon={ChartBarIcon}
                loading={loading}
              />
              <StatCard
                title="Monthly Revenue"
                value={loading ? 0 : stats.monthlyRevenue}
                change={loading ? undefined : stats.monthlyGrowth?.revenue}
                icon={CreditCardIcon}
                loading={loading}
                prefix="$"
              />
              <StatCard
                title="System Health"
                value={loading ? '0%' : `${stats.systemHealth}%`}
                icon={ServerIcon}
                loading={loading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-1">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
                    <p className="text-sm text-gray-500">Latest platform activities</p>
                  </div>
                  <LoadingOverlay isLoading={loading}>
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.target}</p>
                            <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </LoadingOverlay>
                </div>
              </div>

              {/* System Metrics */}
              <div className="lg:col-span-1">
                <SystemMetricsCard metrics={systemMetrics} loading={loading} />
              </div>

              {/* Alerts & Notifications */}
              <div className="lg:col-span-1">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">System Alerts</h2>
                    <p className="text-sm text-gray-500">Active notifications and alerts</p>
                  </div>
                  <LoadingOverlay isLoading={loading}>
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <AlertItem key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
                      ))}
                    </div>
                  </LoadingOverlay>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'universities' && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">University Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage university tenants and their configurations
                </p>
              </div>
              <button 
                className="btn-primary"
                onClick={() => setAddUniversityModalOpen(true)}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add University
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {universities.map((university) => (
                <UniversityCard 
                  key={university.id} 
                  university={university} 
                  onAction={handleUniversityAction}
                />
              ))}
            </div>
          </>
        )}

        {selectedTab === 'system' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
              <p className="mt-2 text-gray-600">
                Monitor system performance and infrastructure
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SystemMetricsCard metrics={systemMetrics} loading={loading} />
              
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Infrastructure Status</h2>
                  <p className="text-sm text-gray-500">Kubernetes cluster health</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">API Gateway</span>
                    </div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Database Cluster</span>
                    </div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium">Redis Cache</span>
                    </div>
                    <span className="text-sm text-yellow-600">Warning</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Load Balancer</span>
                    </div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'billing' && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Revenue</h1>
                <p className="mt-2 text-gray-600">
                  Track revenue, subscriptions, and billing information
                </p>
              </div>
              <Link href="/billing" className="btn-primary">
                <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                Manage Billing
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Revenue by University</h2>
                    <p className="text-sm text-gray-500">Monthly subscription revenue</p>
                  </div>
                  <div className="space-y-4">
                    {universities.slice(0, 5).map((university) => (
                      <div key={university.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{university.name}</h3>
                              <p className="text-sm text-gray-500">{university.plan} Plan</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${university.monthlyFee}/month</p>
                              <p className="text-sm text-gray-500">{university.students} students</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/billing/${university.id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            View Billing →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/billing" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                      View All Universities →
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Revenue Summary</h2>
                    <p className="text-sm text-gray-500">Current month</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="font-medium">${stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Subscriptions</span>
                      <span className="font-medium">{universities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average per University</span>
                      <span className="font-medium">${universities.length > 0 ? Math.round(stats.monthlyRevenue / universities.length).toLocaleString() : '0'}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Growth Rate</span>
                        <span className="font-medium text-green-600">+{stats.monthlyGrowth?.revenue || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mt-6">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                  </div>
                  <div className="space-y-3">
                    <Link href="/billing" className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">View All Invoices</div>
                          <div className="text-xs text-gray-500">Manage billing history</div>
                        </div>
                      </div>
                    </Link>
                    <button className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <PaperAirplaneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Send Bulk Invoices</div>
                          <div className="text-xs text-gray-500">Send to all universities</div>
                        </div>
                      </div>
                    </button>
                    <button className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Payment Reminders</div>
                          <div className="text-xs text-gray-500">Send overdue notices</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'settings' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="mt-2 text-gray-600">
                Configure platform-wide settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Platform security configuration</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                    </div>
                    <button className="bg-primary-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Session Timeout</h3>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <select className="text-sm border-gray-300 rounded-md">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-500">Configure alert preferences</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Send alerts via email</p>
                    </div>
                    <button className="bg-primary-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Slack Integration</h3>
                      <p className="text-sm text-gray-500">Send alerts to Slack channels</p>
                    </div>
                    <button className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* University Modal */}
      <UniversityModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        universityId={selectedUniversityId}
        mode={modalMode}
      />
      
      {/* Add University Modal */}
      <AddUniversityModal
        isOpen={addUniversityModalOpen}
        onClose={() => setAddUniversityModalOpen(false)}
        onSuccess={refreshData}
      />
      
      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
      
      {/* Session Timeout Warning */}
      <SessionTimeoutWarning
        isVisible={showTimeoutWarning}
        onExtendSession={extendSession}
        onLogout={logout}
        timeRemaining={timeRemaining}
      />
    </div>
  );
}
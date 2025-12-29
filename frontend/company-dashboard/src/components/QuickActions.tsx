import React from 'react';
import { 
  PlusIcon, 
  DocumentChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  ServerIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

interface QuickActionsProps {
  onAction: (actionType: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions: QuickAction[] = [
    {
      name: 'Add University',
      description: 'Onboard a new university tenant',
      icon: PlusIcon,
      action: () => onAction('add-university'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Generate Report',
      description: 'Create platform analytics report',
      icon: DocumentChartBarIcon,
      action: () => onAction('generate-report'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'System Health',
      description: 'Check infrastructure status',
      icon: ServerIcon,
      action: () => onAction('system-health'),
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      name: 'Manage Users',
      description: 'Admin user management',
      icon: UserGroupIcon,
      action: () => onAction('manage-users'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Notifications',
      description: 'Configure alert settings',
      icon: BellIcon,
      action: () => onAction('notifications'),
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      name: 'Settings',
      description: 'Platform configuration',
      icon: CogIcon,
      action: () => onAction('settings'),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action) => (
        <button
          key={action.name}
          onClick={action.action}
          className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 text-left`}
        >
          <action.icon className="h-6 w-6 mb-2" />
          <h3 className="font-medium text-sm">{action.name}</h3>
          <p className="text-xs opacity-90 mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  );
};
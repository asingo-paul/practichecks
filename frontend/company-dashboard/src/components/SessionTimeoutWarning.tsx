'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SessionTimeoutWarningProps {
  isVisible: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  timeRemaining: number;
}

export function SessionTimeoutWarning({ 
  isVisible, 
  onExtendSession, 
  onLogout, 
  timeRemaining 
}: SessionTimeoutWarningProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) return;

    setCountdown(timeRemaining);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, timeRemaining, onLogout]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                Your session will expire in <strong>{countdown} seconds</strong> due to inactivity.
                Would you like to extend your session?
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={onExtendSession}
                className="btn-primary text-sm px-4 py-2"
              >
                Extend Session
              </button>
              <button
                onClick={onLogout}
                className="btn-outline text-sm px-4 py-2"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
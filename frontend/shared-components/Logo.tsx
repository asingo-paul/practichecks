import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: { icon: 'h-6 w-6', text: 'text-lg' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl' },
  xl: { icon: 'h-16 w-16', text: 'text-3xl' },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className,
  showText = true,
}) => {
  const { icon: iconSize, text: textSize } = sizeClasses[size];

  if (variant === 'text') {
    return (
      <div className={clsx('flex items-center', className)}>
        <span className={clsx('font-bold text-primary-600', textSize)}>
          PractiCheck
        </span>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={clsx('flex items-center', className)}>
        <div className={clsx('rounded-lg bg-primary-600 p-2', iconSize)}>
          <svg
            className="h-full w-full text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      {/* Logo Icon - Using the provided image or fallback */}
      <div className={clsx('flex-shrink-0', iconSize)}>
        <div className="relative h-full w-full">
          {/* Fallback icon if image not available */}
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary-600">
            <svg
              className="h-2/3 w-2/3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={clsx('font-bold text-primary-600', textSize)}>
            PractiCheck
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-xs text-gray-500 font-medium">
              Industrial Attachment Platform
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Animated logo for loading states
export const AnimatedLogo: React.FC<Omit<LogoProps, 'variant'>> = (props) => {
  return (
    <div className="animate-pulse-slow">
      <Logo {...props} variant="full" />
    </div>
  );
};

// Logo for different contexts
export const HeaderLogo: React.FC = () => (
  <Logo size="md" variant="full" className="cursor-pointer" />
);

export const SidebarLogo: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => (
  <Logo 
    size="md" 
    variant={collapsed ? "icon" : "full"} 
    showText={!collapsed}
    className="transition-all duration-200"
  />
);

export const AuthLogo: React.FC = () => (
  <Logo size="xl" variant="full" className="justify-center" />
);

export const FaviconLogo: React.FC = () => (
  <Logo size="sm" variant="icon" />
);
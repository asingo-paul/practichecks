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
  sm: { icon: 'h-6 w-6', text: 'text-lg', image: 'h-6 w-auto' },
  md: { icon: 'h-8 w-8', text: 'text-xl', image: 'h-8 w-auto' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl', image: 'h-12 w-auto' },
  xl: { icon: 'h-16 w-16', text: 'text-3xl', image: 'h-16 w-auto' },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className,
  showText = true,
}) => {
  const { icon: iconSize, text: textSize, image: imageSize } = sizeClasses[size];

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
        <div className={clsx('flex-shrink-0', iconSize)}>
          <Image
            src="/logo.png"
            alt="PractiCheck"
            width={64}
            height={64}
            className={clsx('object-contain', imageSize)}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      {/* Logo Image */}
      <div className={clsx('flex-shrink-0', iconSize)}>
        <Image
          src="/logo.png"
          alt="PractiCheck Logo"
          width={64}
          height={64}
          className={clsx('object-contain', imageSize)}
          priority
        />
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
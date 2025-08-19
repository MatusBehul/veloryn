import React from 'react';

interface VelorynLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'light';
}

export function VelorynLogo({ className = '', size = 'md', variant = 'full' }: VelorynLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const IconSVG = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
      {/* Dark blue V */}
      <path
        d="M15 25 L40 75 L50 55 L35 25 Z"
        fill={variant === 'light' ? '#E2E8F0' : '#1E293B'}
      />
      {/* Light blue checkmark/arrow part */}
      <path
        d="M50 55 L40 75 L65 75 L85 35 L75 25 L55 45 Z"
        fill={variant === 'light' ? '#CBD5E1' : '#3B82F6'}
      />
      {/* Green upward arrow */}
      <path
        d="M55 45 L75 25 L85 35 L75 45 L85 55 L75 45 L65 55 Z"
        fill={variant === 'light' ? '#A7F3D0' : '#10B981'}
      />
    </svg>
  );

  const FullLogo = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <IconSVG />
      <span 
        className={`font-bold text-xl ${
          variant === 'light' ? 'text-white' : 'text-slate-800'
        }`}
      >
        Veloryn
      </span>
    </div>
  );

  if (variant === 'icon') {
    return <IconSVG />;
  }

  return <FullLogo />;
}

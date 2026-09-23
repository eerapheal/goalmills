'use client';

import React from 'react';

export type BrandColorVariant = 'blue' | 'red' | 'yellow';

export interface BrandBadgeProps {
  /**
   * Semantic brand variant:
   * - 'blue' (1st: Primary navigation, tabs, links, category tag)
   * - 'red' (2nd: Live indicator, in-play match, breaking alert)
   * - 'yellow' (3rd: Points, golden boot goals, trophy, ratings)
   */
  variant?: BrandColorVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * BrandBadge
 *
 * Standardized badge component adhering to Blue (1st), Red (2nd), Yellow (3rd).
 */
export function BrandBadge({
  variant = 'blue',
  children,
  icon,
  pulse = false,
  size = 'md',
  className = '',
}: BrandBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const variantClasses = {
    blue: 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-blue-500/10',
    red: 'bg-red-600/20 border-red-500/40 text-red-300 shadow-red-500/10',
    yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 shadow-yellow-500/10',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-bold font-mono uppercase tracking-wider rounded-xl border transition-all ${sizeClasses} ${variantClasses} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'blue' ? 'bg-blue-400' : variant === 'red' ? 'bg-red-400' : 'bg-yellow-400'
          }`}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default BrandBadge;

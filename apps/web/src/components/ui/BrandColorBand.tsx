'use client';

import React from 'react';

export interface BrandColorBandProps {
  /** Height in pixels or Tailwind height class (e.g. 'h-1', 'h-1.5', 'h-2') */
  height?: string;
  /** Whether corners are rounded */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Optional animated glow effect */
  animated?: boolean;
  /** Additional classes */
  className?: string;
}

/**
 * BrandColorBand
 * 
 * Visual signature component enforcing the GoalMills color hierarchy:
 * Blue (1st) -> Red (2nd) -> Yellow (3rd / Last)
 */
export function BrandColorBand({
  height = 'h-1',
  rounded = 'full',
  animated = false,
  className = '',
}: BrandColorBandProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`w-full ${height} ${roundedClass} bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 shadow-sm ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export default BrandColorBand;

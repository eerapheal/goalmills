/**
 * GoalMills Brand Color System
 * 
 * Hierarchy:
 * 1. Blue (Primary) - Brand foundation, headers, primary buttons, active tabs
 * 2. Red (Secondary) - Live matches, in-play pulses, breaking news, alerts
 * 3. Yellow (Tertiary / Accent) - Standings points, golden boot goals, trophies, ratings
 * 
 * Order Rule: Always Blue -> Red -> Yellow across all gradients, progress bars, and trims.
 */

export const BRAND_COLORS = {
  blue: {
    name: 'Electric Blue',
    primary: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    glow: 'rgba(37, 99, 235, 0.4)',
    tw: {
      text: 'text-blue-400',
      bg: 'bg-blue-600',
      bgSoft: 'bg-blue-600/20',
      border: 'border-blue-500/40',
      borderGlow: 'border-blue-400',
    },
  },
  red: {
    name: 'Live Red',
    primary: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.4)',
    tw: {
      text: 'text-red-400',
      bg: 'bg-red-600',
      bgSoft: 'bg-red-600/20',
      border: 'border-red-500/40',
      borderGlow: 'border-red-400',
    },
  },
  yellow: {
    name: 'Championship Gold',
    primary: '#eab308',
    light: '#facc15',
    dark: '#ca8a04',
    glow: 'rgba(234, 179, 8, 0.4)',
    tw: {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500',
      bgSoft: 'bg-yellow-500/20',
      border: 'border-yellow-500/40',
      borderGlow: 'border-yellow-400',
    },
  },
} as const;

export const BRAND_TRIO = {
  sequence: ['blue', 'red', 'yellow'] as const,
  gradientClass: 'bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500',
  gradient135Class: 'bg-gradient-to-br from-blue-600 via-red-500 to-yellow-500',
  gradientTextClass: 'bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 bg-clip-text text-transparent',
  borderClass: 'border-transparent bg-origin-border [border-image:linear-gradient(90deg,#2563eb,#ef4444,#eab308)_1]',
};

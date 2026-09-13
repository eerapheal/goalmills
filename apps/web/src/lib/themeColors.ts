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

// ─────────────────────────────────────────────────────────────────
// Sport → Brand Color Mapping
// ─────────────────────────────────────────────────────────────────
export type SportColor = 'blue' | 'red' | 'yellow';

export const SPORT_THEME: Record<string, SportColor> = {
  football: 'blue',
  cricket: 'red',
  basketball: 'yellow',
};

/** Get the brand color key for a given sport. Falls back to 'blue'. */
export function sportTheme(sport: string): SportColor {
  return SPORT_THEME[sport.toLowerCase()] ?? 'blue';
}

// ─────────────────────────────────────────────────────────────────
// Per-Sport Tailwind Class Presets
// ─────────────────────────────────────────────────────────────────
export interface SportThemeClasses {
  activeBg: string;
  activeText: string;
  activeShadow: string;
  cardBorder: string;
  liveBorder: string;
  accentText: string;
  containerBg: string;
  focusBorder: string;
  iconColor: string;
}

export const SPORT_CLASSES: Record<SportColor, SportThemeClasses> = {
  blue: {
    activeBg: 'bg-blue-600',
    activeText: 'text-blue-400',
    activeShadow: 'shadow-blue-600/30',
    cardBorder: 'border-blue-500/20',
    liveBorder: 'border-blue-500/50',
    accentText: 'text-blue-400',
    containerBg: 'bg-[#08142A]/90',
    focusBorder: 'focus:border-blue-400/50',
    iconColor: 'text-blue-400',
  },
  red: {
    activeBg: 'bg-red-600',
    activeText: 'text-red-400',
    activeShadow: 'shadow-red-600/30',
    cardBorder: 'border-red-500/20',
    liveBorder: 'border-red-500/50',
    accentText: 'text-red-400',
    containerBg: 'bg-[#170B10]/90',
    focusBorder: 'focus:border-red-400/50',
    iconColor: 'text-red-400',
  },
  yellow: {
    activeBg: 'bg-yellow-600',
    activeText: 'text-yellow-400',
    activeShadow: 'shadow-yellow-600/30',
    cardBorder: 'border-yellow-500/20',
    liveBorder: 'border-yellow-500/50',
    accentText: 'text-yellow-400',
    containerBg: 'bg-[#1A1608]/90',
    focusBorder: 'focus:border-yellow-400/50',
    iconColor: 'text-yellow-400',
  },
};

/** Get sport-specific Tailwind class presets by sport name. */
export function getThemeClasses(sport: string): SportThemeClasses {
  return SPORT_CLASSES[sportTheme(sport)];
}

// ─────────────────────────────────────────────────────────────────
// Semantic Role Color Helpers
// ─────────────────────────────────────────────────────────────────
export const semanticColors = {
  /** Positive outcome — brand blue */
  win: 'text-blue-400',
  /** Negative outcome — brand red */
  loss: 'text-red-400',
  /** Neutral outcome */
  draw: 'text-slate-400',
  /** Stats / points / golden boot — brand yellow */
  stat: 'text-yellow-400',
  /** Live indicator */
  livePulse: 'bg-red-500 animate-pulse',
  /** Success confirmation */
  success: 'text-blue-400',
  /** Copied / confirmed action */
  confirm: 'text-blue-400',
} as const;

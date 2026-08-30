// Unified Enterprise Design System Tokens (Web & Mobile Synchronized)

export const THEME = {
  dark: {
    background: '#0B0F17', // Deep Obsidian
    surface: '#141C2B', // Dark Slate Card
    surfaceElevated: '#1E293B', // Elevated Card / Modal
    surfaceHighlight: '#27354A', // Active / Hover State
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#00E599', // Live Neon Emerald
    accentGlow: 'rgba(0, 229, 153, 0.25)',
    live: '#10B981', // Live Match Green
    livePulse: 'rgba(16, 185, 129, 0.2)',
    brandBlue: '#3B82F6',
    warning: '#F59E0B', // Yellow Card
    danger: '#EF4444', // Red Card / Cancelled
    info: '#06B6D4',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    surfaceHighlight: '#E2E8F0',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accent: '#059669',
    accentGlow: 'rgba(5, 150, 105, 0.2)',
    live: '#10B981',
    livePulse: 'rgba(16, 185, 129, 0.15)',
    brandBlue: '#2563EB',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0891B2',
  },
};

// Global shorthand COLORS (defaults to modern dark sports palette)
export const COLORS = {
  // Brand & Accents (Unified with Web #3B82F6 Electric Blue)
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryGlow: 'rgba(59, 130, 246, 0.25)',
  secondary: '#F59E0B',
  accent: '#00E599',
  brandBlue: '#3B82F6',
  brandEmerald: '#10B981',

  // Status & Sports Indicators
  live: '#10B981',
  livePulse: 'rgba(16, 185, 129, 0.2)',
  success: '#2ECC40',
  warning: '#F59E0B',
  yellowCard: '#F59E0B',
  danger: '#EF4444',
  redCard: '#DC2626',
  info: '#06B6D4',

  // Surfaces & Backgrounds
  background: '#0B0F17',
  backgroundDark: '#0B0F17',
  surface: '#141C2B',
  surfaceElevated: '#1E293B',
  surfaceHighlight: '#27354A',
  card: '#141C2B',

  // Text
  text: '#F8FAFC',
  textLight: '#94A3B8',
  textMuted: '#64748B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  yellow: '#F59E0B',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  glowLive: '0 0 12px rgba(16, 185, 129, 0.4)',
  glowAccent: '0 0 16px rgba(0, 229, 153, 0.35)',
};

// Utility functions
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// GoalMills Unified Brand Loader Configuration
export const LOADER_THEME = {
  orbitElectricBlue: '#3B82F6',
  orbitLiveEmerald: '#10B981',
  orbitGold: '#F59E0B',
  coreBackground: '#0E1726',
  coreText: '#FFFFFF',
  liveDot: '#10B981',
  glow: 'rgba(59, 130, 246, 0.35)',
};

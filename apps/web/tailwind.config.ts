import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // Very dark slate/navy
        surface: '#0f172a', // Dark slate for cards
        surfaceHighlight: '#1e293b', // Lighter slate for hovers
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#ef4444', // Red (Live / Alerts)
          dark: '#dc2626',
          light: '#f87171',
        },
        tertiary: {
          DEFAULT: '#eab308', // Yellow (Points / Golden Boot / Stats)
          dark: '#ca8a04',
          light: '#facc15',
        },
        accent: {
          blue: '#3b82f6',
          red: '#ef4444',
          yellow: '#eab308',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'], // Could change to 'Outfit' later if added
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom, transparent, #020617)',
        'blue-gradient': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
        'brand-trio': 'linear-gradient(90deg, #2563eb 0%, #ef4444 50%, #eab308 100%)',
        'brand-trio-135': 'linear-gradient(135deg, #2563eb 0%, #ef4444 50%, #eab308 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

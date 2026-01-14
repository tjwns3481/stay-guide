import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Warm Coral
        primary: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD1C7',
          300: '#FFB3A3',
          400: '#F08E7A',
          500: '#E07A5F', // Main
          600: '#C96A52',
          700: '#A85544',
          800: '#874337',
          900: '#6B362D',
        },
        // Secondary - Sage Green
        secondary: {
          50: '#F4F9F6',
          100: '#E8F3ED',
          200: '#D1E7DB',
          300: '#B3D6C3',
          400: '#9AC7AD',
          500: '#81B29A', // Main
          600: '#6A9A82',
          700: '#567D6A',
          800: '#436354',
          900: '#354F43',
        },
        // Accent - Warm Sand
        accent: {
          50: '#FDFCFA',
          100: '#FAF8F3',
          200: '#F5F0E6',
          300: '#EDE4D3',
          400: '#E3D5BD',
          500: '#F2CC8F', // Main
          600: '#D9B87A',
          700: '#BFA065',
          800: '#998052',
          900: '#7A6642',
        },
        // Neutrals
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Background
        background: '#FDFBF7',
        surface: '#FFFFFF',
        // Text
        text: {
          primary: '#3D405B',
          secondary: '#6B6D7C',
          muted: '#9CA3AF',
        },
        // Status
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
        card: '0 4px 16px rgba(0, 0, 0, 0.06)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      animationDelay: {
        100: '100ms',
        200: '200ms',
      },
    },
  },
  plugins: [],
}

export default config

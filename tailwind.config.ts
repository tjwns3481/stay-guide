import type { Config } from 'tailwindcss';

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
        // Primary: Warm Brown (감성적인 따뜻함)
        primary: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#E8DFD0',
          300: '#D4C4A8',
          400: '#BFA880',
          500: '#8B7355', // Main
          600: '#6B5A45',
          700: '#4A3F30',
          800: '#2D2620',
          900: '#1A1714',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Secondary: Soft Beige (부드러운 배경)
        secondary: {
          50: '#FEFDFB',
          100: '#FDF9F3',
          200: '#F9F1E3',
          300: '#F3E6D0',
          400: '#EBD7B8',
          500: '#D4C4A8',
          600: '#B8A88C',
          700: '#9C8C70',
          800: '#807054',
          900: '#645438',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Accent: Terracotta (포인트 컬러) - Design System 업데이트
        accent: {
          50: '#FDF2ED',
          100: '#FAE5DB',
          200: '#F4CBB7',
          300: '#EFB193',
          400: '#E9976F',
          500: '#C17C60', // Main - Terracotta
          600: '#A66A52',
          700: '#8B5845',
          800: '#6F4638',
          900: '#54342A',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Neutral: Warm Gray
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
        // Design System Colors (warm palette)
        warm: {
          50: '#FAF7F2',  // Cream
          100: '#F5F0E8',
          200: '#E8E2D9', // Light Tan
          300: '#D4C4B0', // Soft Beige
          400: '#C17C60', // Terracotta
          500: '#8B7355', // Warm Brown (Primary)
          600: '#6B6560', // Warm Gray
          700: '#5C4D3D', // Deep Brown
          800: '#2D2A26', // Charcoal
        },
        // shadcn/ui base colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '16px',
        button: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(139, 115, 85, 0.08)',
        'card-hover': '0 4px 16px rgba(139, 115, 85, 0.12)',
        button: '0 2px 4px rgba(139, 115, 85, 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

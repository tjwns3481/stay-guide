import type { Config } from 'tailwindcss';

const config: Config = {
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
        },
        // Accent: Deep Green (포인트 컬러)
        accent: {
          50: '#F0F5F3',
          100: '#D9E8E2',
          200: '#B3D1C5',
          300: '#8DBAA8',
          400: '#67A38B',
          500: '#4A7C5F',
          600: '#3D664D',
          700: '#30503C',
          800: '#233A2B',
          900: '#16241A',
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
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(139, 115, 85, 0.08)',
        'card-hover': '0 4px 16px rgba(139, 115, 85, 0.12)',
        'button': '0 2px 4px rgba(139, 115, 85, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Kanit', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
      },
      colors: {
        // Primary Brand Colors - Deep Emerald & Gold
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5ca',
          300: '#8bd2a6',
          400: '#4db87d',
          500: '#2E8B57', // Premium Emerald
          600: '#257a4a',
          700: '#1d623b',
          800: '#174e30',
          900: '#0f3a24',
        },
        // Accent Colors - Royal Purple & Sapphire
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B5CF6', // Royal Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Premium Blue - Sapphire
        sapphire: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0EA5E9', // Bright Sapphire
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Luxury Gold & Bronze
        luxury: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D4AF37', // Premium Gold
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Alert/Status Colors - Refined
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        // Neutrals - Sophisticated Gray Scale
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        // Dark Theme - Deep Charcoal & Navy
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      // Premium background colors
      backgroundColor: {
        'dark-primary': '#0a0f1a',
        'dark-secondary': '#111827',
        'dark-tertiary': '#1f2937',
        'premium-card': 'rgba(255, 255, 255, 0.02)',
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#e2e8f0',
        'dark-muted': '#94a3b8',
      },
      // Luxury gradients
      backgroundImage: {
        'gradient-emerald': 'linear-gradient(135deg, #2E8B57 0%, #10B981 100%)',
        'gradient-sapphire': 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
        'gradient-royal': 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%)',
        'gradient-premium': 'linear-gradient(135deg, #2E8B57 0%, #0EA5E9 50%, #8B5CF6 100%)',
      },
      // Additional premium styling
      boxShadow: {
        'premium': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'premium-lg': '0 16px 48px rgba(0, 0, 0, 0.18)',
        'premium-dark': '0 8px 32px rgba(0, 0, 0, 0.32)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 20px rgba(46, 139, 87, 0.3)' },
          '100%': { 'box-shadow': '0 0 30px rgba(46, 139, 87, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
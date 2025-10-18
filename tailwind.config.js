/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
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
        // Primary Brand Colors - Lime Green
        primary: {
          50: '#f9ffe6',
          100: '#f0ffc7',
          200: '#e5ff99',
          300: '#d4f766',
          400: '#C4D600', // Primary Lime Green
          500: '#a8b800',
          600: '#8BC34A', // Secondary Lime Green
          700: '#6d9c36',
          800: '#527a2b',
          900: '#3d5c20',
        },
        // Accent Colors - Orange/Coral
        accent: {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffcdb3',
          300: '#ffab80',
          400: '#FF6B35', // Primary Orange
          500: '#FF7043', // Coral
          600: '#f4511e',
          700: '#e64a19',
          800: '#d84315',
          900: '#bf360c',
        },
        // Cyan/Blue Highlights
        cyan: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4DD0E1', // Light Cyan
          400: '#00BCD4', // Primary Cyan
          500: '#00acc1',
          600: '#0097a7',
          700: '#00838f',
          800: '#006064',
          900: '#004d40',
        },
        // Alert/Error Colors
        alert: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#FF5252', // Primary Red
          500: '#F44336', // Error Red
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        // Gold/Yellow
        gold: {
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#FFD700', // Primary Gold
          500: '#FFC107', // Amber
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        // Neutrals - Gray Scale
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Dark Theme Colors
        dark: {
          50: '#eceff1',
          100: '#cfd8dc',
          200: '#b0bec5',
          300: '#90a4ae',
          400: '#78909c',
          500: '#607d8b',
          600: '#546e7a',
          700: '#455a64',
          800: '#37474f',
          900: '#263238',
        }
      },
      // Add specific dark mode background colors
      backgroundColor: {
        'dark-primary': '#0f1419',
        'dark-secondary': '#1a2028',
        'dark-tertiary': '#252d38',
      },
      textColor: {
        'dark-primary': '#e6e6e6',
        'dark-secondary': '#b3b3b3',
        'dark-muted': '#808080',
      },
      // Financial app specific gradients
      backgroundImage: {
        'gradient-lime': 'linear-gradient(135deg, #C4D600 0%, #8BC34A 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF6B35 0%, #FF7043 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #4DD0E1 0%, #00BCD4 100%)',
      }
    },
  },
  plugins: [],
};
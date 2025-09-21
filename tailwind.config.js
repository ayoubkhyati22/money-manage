/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
      },
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#f7fdf0',
          100: '#ecfbdb',
          200: '#daf6bd',
          300: '#bfec90',
          400: '#B3DD62', // Primary Green
          500: '#9bc73f',
          600: '#7ba42f',
          700: '#5f7f27',
          800: '#4d6624',
          900: '#425521',
        },
        accent: {
          50: '#fdf9f3',
          100: '#fbf1e3',
          200: '#f6e0c1',
          300: '#efc895',
          400: '#DDAD71', // Accent Orange
          500: '#d4924a',
          600: '#c67a3f',
          700: '#a56135',
          800: '#845030',
          900: '#6c4229',
        },
        dark: {
          50: '#f0f4f3',
          100: '#dce6e4',
          200: '#b9cec9',
          300: '#90aea7',
          400: '#6a8d84',
          500: '#2C5E54', // Dark Green
          600: '#245048',
          700: '#1f423b',
          800: '#1c3731',
          900: '#1a2f2a',
        },
        mint: {
          50: '#f2fbf7',
          100: '#d3f5e8',
          200: '#a7ebd1',
          300: '#ABDAC5', // Soft Mint (using as 300)
          400: '#6dd4ad',
          500: '#4abe96',
          600: '#37a07b',
          700: '#2e8064',
          800: '#286651',
          900: '#235544',
        },
        // Keep existing colors for backward compatibility
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      }
    },
  },
  plugins: [],
};
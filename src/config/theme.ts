// src/config/theme.ts
export interface ThemeColors {
    primary: {
      50: string
      100: string
      200: string
      300: string
      400: string // Main Primary Green
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    accent: {
      50: string
      100: string
      200: string
      300: string
      400: string // Accent Orange
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    dark: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string // Dark Green
      600: string
      700: string
      800: string
      900: string
    }
    mint: {
      50: string
      100: string
      200: string
      300: string // Soft Mint
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    neutral: {
      white: string
    }
  }
  
  export interface ThemeTypography {
    fontFamily: string
    weights: {
      regular: string
      medium: string
      semibold: string
    }
  }
  
  // Default FinanceFlow Theme
  export const financeFlowTheme: ThemeColors & { typography: ThemeTypography } = {
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
      300: '#ABDAC5', // Soft Mint
      400: '#6dd4ad',
      500: '#4abe96',
      600: '#37a07b',
      700: '#2e8064',
      800: '#286651',
      900: '#235544',
    },
    neutral: {
      white: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter',
      weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
      },
    },
  }
  
  // Alternative theme example
  export const alternativeTheme: ThemeColors & { typography: ThemeTypography } = {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa', // Blue primary
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171', // Red accent
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    dark: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#374151', // Gray dark
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    mint: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac', // Green mint
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    neutral: {
      white: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter',
      weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
      },
    },
  }
  
  // Current active theme - change this to switch themes
  export const currentTheme = financeFlowTheme
  
  // Theme utilities
  export const getThemeColor = (path: string) => {
    const keys = path.split('.')
    let value: any = currentTheme
    
    for (const key of keys) {
      value = value[key]
      if (value === undefined) return '#000000'
    }
    
    return value
  }
  
  // CSS Custom Properties Generator
  export const generateThemeCSS = (theme: ThemeColors & { typography: ThemeTypography }) => {
    return `
      :root {
        /* Primary Colors */
        --color-primary-50: ${theme.primary[50]};
        --color-primary-100: ${theme.primary[100]};
        --color-primary-200: ${theme.primary[200]};
        --color-primary-300: ${theme.primary[300]};
        --color-primary-400: ${theme.primary[400]};
        --color-primary-500: ${theme.primary[500]};
        --color-primary-600: ${theme.primary[600]};
        --color-primary-700: ${theme.primary[700]};
        --color-primary-800: ${theme.primary[800]};
        --color-primary-900: ${theme.primary[900]};
        
        /* Accent Colors */
        --color-accent-50: ${theme.accent[50]};
        --color-accent-100: ${theme.accent[100]};
        --color-accent-200: ${theme.accent[200]};
        --color-accent-300: ${theme.accent[300]};
        --color-accent-400: ${theme.accent[400]};
        --color-accent-500: ${theme.accent[500]};
        --color-accent-600: ${theme.accent[600]};
        --color-accent-700: ${theme.accent[700]};
        --color-accent-800: ${theme.accent[800]};
        --color-accent-900: ${theme.accent[900]};
        
        /* Dark Colors */
        --color-dark-50: ${theme.dark[50]};
        --color-dark-100: ${theme.dark[100]};
        --color-dark-200: ${theme.dark[200]};
        --color-dark-300: ${theme.dark[300]};
        --color-dark-400: ${theme.dark[400]};
        --color-dark-500: ${theme.dark[500]};
        --color-dark-600: ${theme.dark[600]};
        --color-dark-700: ${theme.dark[700]};
        --color-dark-800: ${theme.dark[800]};
        --color-dark-900: ${theme.dark[900]};
        
        /* Mint Colors */
        --color-mint-50: ${theme.mint[50]};
        --color-mint-100: ${theme.mint[100]};
        --color-mint-200: ${theme.mint[200]};
        --color-mint-300: ${theme.mint[300]};
        --color-mint-400: ${theme.mint[400]};
        --color-mint-500: ${theme.mint[500]};
        --color-mint-600: ${theme.mint[600]};
        --color-mint-700: ${theme.mint[700]};
        --color-mint-800: ${theme.mint[800]};
        --color-mint-900: ${theme.mint[900]};
        
        /* Neutral */
        --color-neutral-white: ${theme.neutral.white};
        
        /* Typography */
        --font-family: ${theme.typography.fontFamily}, system-ui, sans-serif;
        --font-weight-regular: ${theme.typography.weights.regular};
        --font-weight-medium: ${theme.typography.weights.medium};
        --font-weight-semibold: ${theme.typography.weights.semibold};
      }
    `
  }
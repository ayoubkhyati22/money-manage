// src/config/theme.ts
export interface ThemeColors {
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // Main Primary
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
    400: string
    500: string // Main Accent
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
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  luxury: {
    gold: string
    platinum: string
    silver: string
    bronze: string
  }
  state: {
    success: string
    warning: string
    error: string
    info: string
  }
  surface: {
    background: string
    card: string
    hover: string
    border: string
  }
}

export interface ThemeTypography {
  fontFamily: {
    primary: string
    secondary: string
    mono: string
  }
  weights: {
    light: string
    regular: string
    medium: string
    semibold: string
    bold: string
  }
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
}

export interface ThemeEffects {
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  gradients: {
    primary: string
    accent: string
    luxury: string
  }
  backdrop: {
    blur: string
    saturate: string
  }
}

// Premium FinanceFlow Theme
export const premiumFinanceFlowTheme: ThemeColors & { 
  typography: ThemeTypography
  effects: ThemeEffects
} = {
  primary: {
    50: '#f0fdf8',
    100: '#ccfbef',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf', // Emerald Teal
    500: '#14b8a6', // Main Primary
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c', // Vibrant Orange
    500: '#f97316', // Main Accent
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
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
  },
  luxury: {
    gold: '#ffd700',
    platinum: '#e5e4e2',
    silver: '#c0c0c0',
    bronze: '#cd7f32',
  },
  state: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  surface: {
    background: '#ffffff',
    card: '#fafafa',
    hover: '#f8fafc',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: {
      primary: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'SF Mono, Monaco, "Cascadia Mono", monospace',
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  effects: {
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      accent: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      luxury: 'linear-gradient(135deg, #ffd700 0%, #fbbf24 100%)',
    },
    backdrop: {
      blur: 'blur(20px)',
      saturate: 'saturate(180%)',
    },
  },
}

// Dark Premium Theme
export const premiumDarkTheme: ThemeColors & { 
  typography: ThemeTypography
  effects: ThemeEffects
} = {
  ...premiumFinanceFlowTheme,
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Emerald
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
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
  },
  surface: {
    background: '#0f172a',
    card: '#1e293b',
    hover: '#334155',
    border: '#374151',
  },
}

// Luxury Gold Theme
export const luxuryGoldTheme: ThemeColors & { 
  typography: ThemeTypography
  effects: ThemeEffects
} = {
  ...premiumFinanceFlowTheme,
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  luxury: {
    gold: '#ffd700',
    platinum: '#e5e4e2',
    silver: '#c0c0c0',
    bronze: '#cd7f32',
  },
}

// Current active theme
export const currentTheme = premiumFinanceFlowTheme

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

// Premium CSS Custom Properties Generator
export const generateThemeCSS = (theme: ThemeColors & { typography: ThemeTypography; effects: ThemeEffects }) => {
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
      
      /* Luxury Colors */
      --color-luxury-gold: ${theme.luxury.gold};
      --color-luxury-platinum: ${theme.luxury.platinum};
      --color-luxury-silver: ${theme.luxury.silver};
      --color-luxury-bronze: ${theme.luxury.bronze};
      
      /* State Colors */
      --color-state-success: ${theme.state.success};
      --color-state-warning: ${theme.state.warning};
      --color-state-error: ${theme.state.error};
      --color-state-info: ${theme.state.info};
      
      /* Surface Colors */
      --color-surface-background: ${theme.surface.background};
      --color-surface-card: ${theme.surface.card};
      --color-surface-hover: ${theme.surface.hover};
      --color-surface-border: ${theme.surface.border};
      
      /* Typography */
      --font-family-primary: ${theme.typography.fontFamily.primary};
      --font-family-secondary: ${theme.typography.fontFamily.secondary};
      --font-family-mono: ${theme.typography.fontFamily.mono};
      
      --font-weight-light: ${theme.typography.weights.light};
      --font-weight-regular: ${theme.typography.weights.regular};
      --font-weight-medium: ${theme.typography.weights.medium};
      --font-weight-semibold: ${theme.typography.weights.semibold};
      --font-weight-bold: ${theme.typography.weights.bold};
      
      /* Effects */
      --shadow-sm: ${theme.effects.shadows.sm};
      --shadow-md: ${theme.effects.shadows.md};
      --shadow-lg: ${theme.effects.shadows.lg};
      --shadow-xl: ${theme.effects.shadows.xl};
      --shadow-2xl: ${theme.effects.shadows['2xl']};
      
      --gradient-primary: ${theme.effects.gradients.primary};
      --gradient-accent: ${theme.effects.gradients.accent};
      --gradient-luxury: ${theme.effects.gradients.luxury};
      
      --backdrop-blur: ${theme.effects.backdrop.blur};
      --backdrop-saturate: ${theme.effects.backdrop.saturate};
    }
  `
}

// Premium theme variants
export const themeVariants = {
  light: premiumFinanceFlowTheme,
  dark: premiumDarkTheme,
  luxury: luxuryGoldTheme,
} as const

export type ThemeVariant = keyof typeof themeVariants
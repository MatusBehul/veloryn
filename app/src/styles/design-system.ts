// Veloryn Design System
// A cohesive color palette and design tokens for financial intelligence platform

export const velorynColors = {
  // Primary Brand Colors (based on logo)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#3b82f6', // Main blue from logo
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary - Emerald Green (from logo arrow)
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main green from logo
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Neutral Grays (professional, financial)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b', // Dark blue-gray from logo
    900: '#0f172a',
  },
  
  // Status Colors
  success: '#10b981', // Same as secondary green
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6', // Same as primary blue
};

export const velorynTheme = {
  colors: velorynColors,
  
  // Typography
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  // Spacing follows 8px grid
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
};

// Component-specific color mappings
export const componentColors = {
  // Buttons
  button: {
    primary: {
      bg: velorynColors.primary[500],
      hover: velorynColors.primary[600],
      text: 'white',
    },
    secondary: {
      bg: velorynColors.secondary[500],
      hover: velorynColors.secondary[600],
      text: 'white',
    },
    outline: {
      border: velorynColors.slate[300],
      hover: velorynColors.slate[50],
      text: velorynColors.slate[700],
    }
  },
  
  // Cards
  card: {
    bg: 'white',
    border: velorynColors.slate[200],
    shadow: velorynTheme.shadows.md,
  },
  
  // Status indicators
  status: {
    premium: velorynColors.secondary[500],
    analysis: velorynColors.primary[500],
    recommendations: '#8b5cf6', // Purple
    charts: '#f59e0b', // Orange
  },
  
  // Backgrounds
  background: {
    primary: velorynColors.slate[50],
    secondary: 'white',
    accent: velorynColors.primary[50],
  }
};

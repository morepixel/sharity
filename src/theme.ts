export const theme = {
  colors: {
    primary: '#2196F3', // Main blue
    secondary: '#4CAF50', // Green for sustainability
    accent: '#FF9800', // Orange for energy
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B00020',
    text: {
      primary: '#000000DE', // 87% black
      secondary: '#0000008A', // 54% black
      disabled: '#00000061', // 38% black
      inverse: '#FFFFFF'
    }
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28
    },
    body1: {
      fontSize: 16,
      lineHeight: 24
    },
    body2: {
      fontSize: 14,
      lineHeight: 20
    },
    caption: {
      fontSize: 12,
      lineHeight: 16
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3
    }
  }
};

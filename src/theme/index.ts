export const theme = {
  colors: {
    primary: '#2196F3', // Hauptfarbe - Blau für Vertrauen und Zuverlässigkeit
    secondary: '#4CAF50', // Sekundärfarbe - Grün für Nachhaltigkeit
    accent: '#FF9800', // Akzentfarbe - Orange für Energie und Freundlichkeit
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
      inverse: '#FFFFFF'
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
      info: '#2196F3'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold'
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold'
    },
    h3: {
      fontSize: 20,
      fontWeight: '600'
    },
    body1: {
      fontSize: 16,
      fontWeight: 'normal'
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal'
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal'
    }
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24
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

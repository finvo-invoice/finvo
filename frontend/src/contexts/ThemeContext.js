import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create the context
export const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

// Create the ThemeProvider component
export const ThemeContextProvider = ({ children }) => {
  // Get the user's preference from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Save to localStorage
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Create the theme based on the current mode
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: 14 * 0.9,
          h1: { fontWeight: 700, fontSize: '2.5rem' * 0.9 },
          h2: { fontWeight: 700, fontSize: '2rem' * 0.9 },
          h3: { fontWeight: 600, fontSize: '1.75rem' * 0.9 },
          h4: { fontWeight: 600, fontSize: '1.5rem' * 0.9 },
          h5: { fontWeight: 600, fontSize: '1.25rem' * 0.9 },
          h6: { fontWeight: 600, fontSize: '1rem' * 0.9 },
          subtitle1: { fontSize: '1rem' * 0.9 },
          subtitle2: { fontSize: '0.875rem' * 0.9 },
          body1: { fontSize: '1rem' * 0.9 },
          body2: { fontSize: '0.875rem' * 0.9 },
          button: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem' * 0.9,
          },
          caption: { fontSize: '0.75rem' * 0.9 },
        },
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: {
                  main: '#2563EB',
                  light: '#60A5FA',
                  dark: '#1E40AF',
                  contrastText: '#FFFFFF',
                },
                secondary: {
                  main: '#7C3AED',
                  light: '#A78BFA',
                  dark: '#5B21B6',
                  contrastText: '#FFFFFF',
                },
                error: {
                  main: '#EF4444',
                  light: '#FCA5A5',
                  dark: '#B91C1C',
                },
                warning: {
                  main: '#F59E0B',
                  light: '#FCD34D',
                  dark: '#B45309',
                },
                info: {
                  main: '#3B82F6',
                  light: '#93C5FD',
                  dark: '#1D4ED8',
                },
                success: {
                  main: '#10B981',
                  light: '#6EE7B7',
                  dark: '#047857',
                },
                background: {
                  default: '#F9FAFB',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#1F2937',
                  secondary: '#6B7280',
                  disabled: '#9CA3AF',
                },
                divider: '#E5E7EB',
              }
            : {
                // Dark mode palette
                primary: {
                  main: '#60A5FA',
                  light: '#93C5FD',
                  dark: '#2563EB',
                  contrastText: '#FFFFFF',
                },
                secondary: {
                  main: '#A78BFA',
                  light: '#C4B5FD',
                  dark: '#7C3AED',
                  contrastText: '#FFFFFF',
                },
                error: {
                  main: '#F87171',
                  light: '#FCA5A5',
                  dark: '#EF4444',
                },
                warning: {
                  main: '#FBBF24',
                  light: '#FCD34D',
                  dark: '#F59E0B',
                },
                info: {
                  main: '#60A5FA',
                  light: '#93C5FD',
                  dark: '#3B82F6',
                },
                success: {
                  main: '#34D399',
                  light: '#6EE7B7',
                  dark: '#10B981',
                },
                background: {
                  default: '#111827',
                  paper: '#1F2937',
                },
                text: {
                  primary: '#F9FAFB',
                  secondary: '#D1D5DB',
                  disabled: '#6B7280',
                },
                divider: '#374151',
              }),
        },
        shape: {
          borderRadius: 8 * 0.9,
        },
        spacing: (factor) => `${0.9 * 8 * factor}px`,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 500,
                borderRadius: 8 * 0.9,
                boxShadow: 'none',
                padding: `${6 * 0.9}px ${16 * 0.9}px`,
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 8px rgba(0, 0, 0, 0.1)',
                },
              },
              contained: {
                '&:hover': {
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.04), 0px 5px 15px rgba(0, 0, 0, 0.08)',
                },
              },
              outlined: {
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  : '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 2px rgba(0, 0, 0, 0.12)',
                borderRadius: 12 * 0.9,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12 * 0.9,
                boxShadow: mode === 'light'
                  ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  : '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 2px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden',
              },
            },
          },
          MuiSvgIcon: {
            styleOverrides: {
              root: {
                fontSize: '1.5rem' * 0.9,
              },
              fontSizeSmall: {
                fontSize: '1.25rem' * 0.9,
              },
              fontSizeLarge: {
                fontSize: '2.25rem' * 0.9,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: `${16 * 0.9}px ${16 * 0.9}px`,
              },
              head: {
                fontWeight: 600,
                backgroundColor: mode === 'light' ? '#F9FAFB' : '#1F2937',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  : '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 2px rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
      }),
    [mode]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
}; 
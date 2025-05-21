'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Theme Provider component
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('midwifery_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme(THEMES.DARK);
    }
    
    setMounted(true);
  }, []);

  useEffect(() => {
    // Apply theme class to document
    if (mounted) {
      localStorage.setItem('midwifery_theme', theme);
      
      if (theme === THEMES.DARK) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };

  // Set specific theme
  const setThemeMode = (themeMode) => {
    if (Object.values(THEMES).includes(themeMode)) {
      setTheme(themeMode);
    }
  };

  // Context value
  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === THEMES.DARK,
    isLight: theme === THEMES.LIGHT,
    isSystem: theme === THEMES.SYSTEM
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

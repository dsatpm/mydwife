'use client';

import { useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';

/**
 * Helper hook to set the theme based on user preferences
 * Returns a boolean indicating if the theme is set to dark mode
 */
export function useThemeSetup() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  useEffect(() => {
    // Check if the user has a saved theme preference or use system preference
    const savedTheme = localStorage.getItem('midwifery_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Save the theme preference to localStorage
    if (theme) {
      localStorage.setItem('midwifery_theme', theme);
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!savedTheme) {
        // Only auto-switch if the user hasn't explicitly chosen a theme
        if (e.matches && theme !== THEMES.DARK) {
          toggleTheme();
        } else if (!e.matches && theme !== THEMES.LIGHT) {
          toggleTheme();
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isDark, toggleTheme]);
  
  return isDark;
}

/**
 * Utility to generate appropriate text color classes based on theme
 */
export function getTextColorClass(lightColor, darkColor) {
  return `${lightColor} dark:${darkColor}`;
}

/**
 * Utility to generate appropriate background color classes based on theme
 */
export function getBackgroundColorClass(lightColor, darkColor) {
  return `${lightColor} dark:${darkColor}`;
}

/**
 * Utility to generate appropriate border color classes based on theme
 */
export function getBorderColorClass(lightColor, darkColor) {
  return `${lightColor} dark:${darkColor}`;
}

/**
 * Save user theme preference to local storage
 */
export function saveThemePreference(theme) {
  localStorage.setItem('midwifery_theme', theme);
}

/**
 * Get theme name for display
 */
export function getThemeName(theme) {
  return theme === THEMES.DARK ? 'Dark Mode' : 'Light Mode';
}

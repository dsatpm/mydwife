'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { getThemeName } from '../../utils/themeUtils';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [prefersDarkSystem, setPrefersDarkSystem] = useState(false);
  
  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setPrefersDarkSystem(prefersDark);
  }, []);
  
  const handleToggleTheme = () => {
    toggleTheme();
    setSaved(true);
    
    // Reset the saved message after 2 seconds
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 max-w-lg mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-400">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your application preferences
            </p>
          </header>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-medium dark:text-white">Appearance</h2>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="font-medium dark:text-white">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current: {getThemeName(theme)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    System preference: {prefersDarkSystem ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>
                <button
                  onClick={handleToggleTheme}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  Toggle Theme
                </button>
              </div>
              
              {saved && (
                <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Theme preference saved!
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h3 className="font-medium mb-2 dark:text-white">Text & Contrast</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Our application uses darker text colors to ensure readability across all devices and lighting conditions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-medium dark:text-white">Offline Mode</h2>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This application works offline. Your data will be synchronized when you reconnect.
              </p>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded text-sm text-purple-800 dark:text-purple-300">
                <p>Your data is securely stored on your device when offline.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

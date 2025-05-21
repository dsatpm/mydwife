'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initDB, patientService, appointmentService, healthRecordService } from '../services/db';
import { networkService } from '../services/network';

// Create AppContext
const AppContext = createContext();

// App Context Provider component
export function AppProvider({ children }) {
  // State for tracking database initialization
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // State for tracking online status
  const [isOnline, setIsOnline] = useState(true);
  
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize database and network services
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await initDB();
        setDbInitialized(true);
        
        // Initialize network service and set up online status tracking
        const onlineStatus = networkService.init((status) => {
          setIsOnline(status);
          if (status) {
            // If we're back online, try to sync data
            networkService.syncData();
          }
        });
        
        setIsOnline(onlineStatus);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    }
    
    initialize();
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);
  
  // Context value with database services and app state
  const contextValue = {
    dbInitialized,
    isOnline,
    isLoading,
    patientService,
    appointmentService,
    healthRecordService,
    networkService,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

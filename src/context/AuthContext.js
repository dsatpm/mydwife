'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authService, ROLES } from '../services/auth';
import { useRouter } from 'next/navigation';

// Create Authentication Context
const AuthContext = createContext();

// Auth Provider component
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      localStorage.setItem('midwifery_token', result.token);
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      localStorage.setItem('midwifery_token', result.token);
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout a user
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!user;

  // Check if user is a midwife
  const isMidwife = () => user?.role === ROLES.MIDWIFE;

  // Check if user is a client
  const isClient = () => user?.role === ROLES.CLIENT;
  
  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Update current user data
  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    // In a real app with JWT, you might need to refresh the token here
  };

  // Context value
  const value = {
    user,
    loading,
    authError,
    register,
    login,
    logout,
    isAuthenticated,
    isMidwife,
    isClient,
    clearAuthError,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, checkAdminPermission } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userResult = await getCurrentUser();
        
        if (userResult && userResult.isAdmin) {
          setCurrentUser(userResult.user);
          setIsAdmin(true);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } catch (error) {

        setError(error.message);
        setCurrentUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const checkPermission = async () => {
    try {
      const hasPermission = await checkAdminPermission();
      setIsAdmin(hasPermission);
      return hasPermission;
    } catch (error) {

      setIsAdmin(false);
      return false;
    }
  };

  const updateAuthState = async (user, adminStatus) => {
    setCurrentUser(user);
    setIsAdmin(adminStatus);
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    error,
    checkPermission,
    updateAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

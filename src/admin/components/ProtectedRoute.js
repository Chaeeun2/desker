import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();



  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.8rem',
        fontFamily: 'Pretendard, sans-serif'
      }}>
        로딩 중...
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
          return <Navigate to="/admin/login" replace />;
    }
  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth();

  console.log('🛡️ ProtectedRoute Debug:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    hasToken: !!token,
    user: user ? { id: user.id, name: user.name, email: user.email } : null
  });

  if (loading) {
    console.log('🛡️ Loading state, showing spinner');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ User not authenticated, redirecting to welcome');
    return <Navigate to="/welcome" replace />;
  }

  console.log('🛡️ User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute; 
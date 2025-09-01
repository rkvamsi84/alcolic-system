import React from 'react';
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import Login from "./pages/Login/Login";
import { Box, CircularProgress } from "@mui/material";
import './App.css';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createAdminTheme } from './config/unified-config';

const theme = createTheme(createAdminTheme());

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const theme = useTheme();

  console.log('AppContent: isAuthenticated =', isAuthenticated, 'loading =', loading);
  console.log('AppContent: user =', user);

  if (loading) {
    console.log('AppContent: Showing loading spinner');
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ height: '100vh' }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('AppContent: Showing Login component');
    return <Login />;
  }

  console.log('AppContent: Showing Dashboard component');
  return (
    <Box display="flex" sx={{ height: '100vh', backgroundColor: theme.palette.background.default }}>
      <Sidebar />
      <Box flex={1} sx={{ overflow: 'auto', p: 3 }}>
        <AppRoutes />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <AppContent />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;

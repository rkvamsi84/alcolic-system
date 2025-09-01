import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'testuser1756713371311@alcolic.com',
    password: 'TestPass123!',
  });
  const [loading, setLoading] = useState(false);

  // Auto-login for development/testing
  const handleAutoLogin = async () => {
    setLoading(true);
    try {
      const result = await login('testuser1756713371311@alcolic.com', 'TestPass123!');
      if (result.success) {
        toast.success('Auto-login successful!');
        navigate('/home');
      } else {
        toast.error(result.message || 'Auto-login failed. Please register a new account first.');
      }
    } catch (error) {
      toast.error('Auto-login failed. Please register a new account first.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/home');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Use these test credentials to login:
            <br />
            Email: test@alcolic.com
            <br />
            Password: password123
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={handleAutoLogin}
              sx={{ mt: 2 }}
            >
              Quick Demo Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
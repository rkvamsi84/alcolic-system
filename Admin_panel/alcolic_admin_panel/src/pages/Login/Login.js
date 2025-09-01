import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Card,
  CardContent,
  Divider,
  Fade,
  Slide,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  Store,
  LocalShipping,
  Security,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/authService';

const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', formData.email);
      // Try customer role first, then admin role if that fails
      let data;
      try {
        data = await authService.login(formData.email, formData.password, 'customer');
      } catch (customerError) {
        console.log('Customer login failed, trying admin role...');
        data = await authService.login(formData.email, formData.password, 'admin');
      }
      console.log('Login successful:', data);
      login(data.user, data.token);
      console.log('User logged in, should redirect automatically');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.light} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          right: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      <Container maxWidth="lg">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          gap={4}
        >
          {/* Left side - Branding */}
          <Slide direction="right" in={true} timeout={800}>
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                maxWidth: 450
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Store sx={{ fontSize: 60, mr: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                <LocalShipping sx={{ fontSize: 60, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              </Box>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  mb: 2
                }}
              >
                Liquor Delivery
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 3,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Admin Panel
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  Secure Business Management
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  Real-time Analytics & Insights
                </Typography>
              </Box>
            </Box>
          </Slide>

          {/* Right side - Login Form */}
          <Slide direction="left" in={true} timeout={800}>
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                width: 450,
                maxWidth: '100%'
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  padding: 3,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Sign in to your admin dashboard
                </Typography>
              </Box>

              <CardContent sx={{ padding: 4 }}>
                {error && (
                  <Fade in={true}>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  </Fade>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabled,
                        boxShadow: 'none',
                        transform: 'none',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <Divider sx={{ my: 4 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
                    Demo Access
                  </Typography>
                </Divider>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">
                    Test Credentials
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Email:</strong> admin@liquordelivery.com
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Password:</strong> admin123
                    </Typography>
                  </Box>
                </Paper>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Secure access to your liquor delivery business management
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Box>
      </Container>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;
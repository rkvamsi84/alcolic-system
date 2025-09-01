import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { PromotionProvider } from './contexts/PromotionContext';
import { BannerProvider } from './contexts/BannerContext';
import { LocationProvider } from './contexts/LocationContext';
import { StoreProvider } from './contexts/StoreContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { SupportProvider } from './contexts/SupportContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

// Components
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import StoreLoginScreen from './components/auth/StoreLoginScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';
import StoreRegistrationPage from './components/pages/StoreRegistrationPage';
import StoreRegistrationSuccessPage from './components/pages/StoreRegistrationSuccessPage';
import DeliveryManLoginScreen from './components/pages/DeliveryManLoginScreen';
import DeliveryManRegistrationPage from './components/pages/DeliveryManRegistrationPage';
import DeliveryManRegistrationSuccessPage from './components/pages/DeliveryManRegistrationSuccessPage';
import DeliveryDashboard from './components/pages/DeliveryDashboard';
import OrderTrackingPage from './components/pages/OrderTrackingPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ZoneSelectorTest from './pages/ZoneSelectorTest';
import LoginTest from './components/debug/LoginTest';
import ConfigDebug from './components/debug/ConfigDebug';



// Import unified configuration
import { createUnifiedTheme } from './config/unified-config';

// Create theme using unified configuration
const theme = createTheme(createUnifiedTheme());

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const onboardingSeen = localStorage.getItem('onboarding_seen');
    if (onboardingSeen) {
      setHasSeenOnboarding(true);
    }
    
    // Simulate splash screen
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!hasSeenOnboarding) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <FavoritesProvider>
                <ProductProvider>
                  <OrderProvider>
                    <PromotionProvider>
                      <BannerProvider>
                        <LocationProvider>
                          <StoreProvider>
                            <LanguageProvider>
                              <SecurityProvider>
                                <LoyaltyProvider>
                                  <SupportProvider>
                                    <AnalyticsProvider>
                                    <Router
                                      future={{
                                        v7_startTransition: true,
                                        v7_relativeSplatPath: true,
                                      }}
                                    >
                                      <Toaster
                                        position="top-center"
                                        toastOptions={{
                                          duration: 4000,
                                          style: {
                                            background: '#363636',
                                            color: '#fff',
                                          },
                                        }}
                                      />
                                      <Routes>
                                        {/* Public Routes */}
                        <Route path="/zone-test" element={<ZoneSelectorTest />} />
                        <Route path="/login-test" element={<LoginTest />} />
                        <Route path="/config-debug" element={<ConfigDebug />} />
                        <Route path="/welcome" element={<WelcomeScreen />} />
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/signup" element={<SignUpScreen />} />
                        <Route path="/store/login" element={<StoreLoginScreen />} />
                        <Route path="/delivery/login" element={<DeliveryManLoginScreen />} />
                        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                        <Route path="/reset-password" element={<ResetPasswordScreen />} />
                        <Route path="/store/register" element={<StoreRegistrationPage />} />
                        <Route path="/store/registration-success" element={<StoreRegistrationSuccessPage />} />
                        <Route path="/delivery/register" element={<DeliveryManRegistrationPage />} />
                        <Route path="/delivery/registration-success" element={<DeliveryManRegistrationSuccessPage />} />
                                        
                                        {/* Delivery Dashboard Route - Must come before catch-all route */}
                                        <Route path="/delivery/dashboard" element={<ProtectedRoute><DeliveryDashboard /></ProtectedRoute>} />
                                        
                                        {/* Order Tracking Route - Public access */}
                                        <Route path="/track/:trackingCode" element={<OrderTrackingPage />} />
                                        <Route path="/order/:orderId/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                                        
                                        {/* Protected Routes - Catch-all for customer routes */}
                                        <Route
                                          path="/*"
                                          element={
                                            <ProtectedRoute>
                                              <MainLayout />
                                            </ProtectedRoute>
                                          }
                                        />
                                        
                                        {/* Default redirect */}
                                        <Route path="/" element={<Navigate to="/home" replace />} />
                                      </Routes>
                                    </Router>
                                    </AnalyticsProvider>
                                  </SupportProvider>
                                </LoyaltyProvider>
                              </SecurityProvider>
                            </LanguageProvider>
                          </StoreProvider>
                        </LocationProvider>
                      </BannerProvider>
                    </PromotionProvider>
                  </OrderProvider>
                </ProductProvider>
              </FavoritesProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
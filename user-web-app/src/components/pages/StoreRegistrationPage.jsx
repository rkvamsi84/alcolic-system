import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Store,
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Map,
  MyLocation,
  Search,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { apiService, ENDPOINTS } from '../../config/api';
import { toast } from 'react-hot-toast';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';

const steps = ['Store Information', 'Owner Details', 'Contact & Address', 'Zone Selection', 'Review & Submit'];

const StoreRegistrationPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Store Information
    name: '',
    description: '',
    
    // Owner Details
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    
    // Contact Information
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    
    // Zone Selection
    zone: {
      id: null,
      name: '',
      coordinates: null
    },
    
    // Business Hours (optional)
    businessHours: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '22:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '20:00', isOpen: true }
    }
  });
  const [errors, setErrors] = useState({});
  
  // Zone selection state
  const [allZones, setAllZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  
  
  
             const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: 'store-registration-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.API_KEY,
    libraries: GOOGLE_MAPS_CONFIG.LIBRARIES,
    version: GOOGLE_MAPS_CONFIG.VERSION,
  });

  // Load all zones
  const loadZones = async () => {
    try {
      setMapLoading(true);
      const response = await apiService.get(ENDPOINTS.zones.getAll);
      if (response.success) {
        setAllZones(response.data || []);
      } else {
        toast.error('Failed to load delivery zones');
      }
    } catch (error) {
      console.error('Error loading zones:', error);
      // Don't show error toast for connection issues during development
      if (!error.message?.includes('Failed to fetch')) {
        toast.error('Failed to load delivery zones');
      }
    } finally {
      setMapLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        toast.success('Location detected! Select a zone on the map.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        toast.error('Failed to get your location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Search address and update map center
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    try {
      setMapLoading(true);
      const response = await apiService.post(ENDPOINTS.zones.geocode, { address: searchAddress });
      if (response.success && response.data) {
        setMapCenter({ lat: response.data.lat, lng: response.data.lng });
        toast.success('Address found! Select a zone on the map.');
      } else {
        toast.error('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Don't show error toast for connection issues during development
      if (!error.message?.includes('Failed to fetch')) {
        toast.error('Failed to find address. Please try again.');
      }
    } finally {
      setMapLoading(false);
    }
  };

  // Handle zone selection
  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setFormData(prev => ({
      ...prev,
      zone: {
        id: zone.id,
        name: zone.name,
        coordinates: zone.coordinates || { lat: mapCenter.lat, lng: mapCenter.lng }
      }
    }));
    toast.success(`Selected zone: ${zone.name}`);
  };

  // Load zones when component mounts
  useEffect(() => {
    loadZones();
  }, []);

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field] || (nested && errors[`${nested}.${field}`])) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[`${nested}.${field}`];
        return newErrors;
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Store Information
        if (!formData.name.trim()) newErrors.name = 'Store name is required';
        break;
        
      case 1: // Owner Details
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Invalid email format';
        if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone is required';
        if (!formData.ownerPassword.trim()) newErrors.ownerPassword = 'Password is required';
        else if (formData.ownerPassword.length < 6) newErrors.ownerPassword = 'Password must be at least 6 characters';
        break;
        
      case 2: // Contact & Address
        if (!formData.contactInfo.phone.trim()) newErrors['contactInfo.phone'] = 'Store phone is required';
        if (!formData.contactInfo.email.trim()) newErrors['contactInfo.email'] = 'Store email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) newErrors['contactInfo.email'] = 'Invalid email format';
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
        if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
        if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'Zip code is required';
        break;
        
      case 3: // Zone Selection
        if (!formData.zone.id) newErrors['zone.id'] = 'Please select a delivery zone';
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return; // Validate final step
    
    setLoading(true);
    try {
      const response = await apiService.post(ENDPOINTS.store.register, formData);
      
      if (response.success) {
        toast.success('Store registration submitted successfully!');
        navigate('/store-registration-success', { 
          state: { 
            storeData: response.data,
            message: response.message 
          } 
        });
      } else {
        toast.error(response.message || 'Registration failed');
        if (response.errors) {
          const newErrors = {};
          response.errors.forEach(error => {
            newErrors[error.param] = error.msg;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Store registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Store Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Store />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Store Description (Optional)"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                helperText="Describe your store and what makes it special"
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Owner Full Name"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                error={!!errors.ownerName}
                helperText={errors.ownerName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Owner Email"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                error={!!errors.ownerEmail}
                helperText={errors.ownerEmail || "This will be your login email"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Owner Phone"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                error={!!errors.ownerPhone}
                helperText={errors.ownerPhone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.ownerPassword}
                onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                error={!!errors.ownerPassword}
                helperText={errors.ownerPassword || "Minimum 6 characters"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Store Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Store Phone"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value, 'contactInfo')}
                error={!!errors['contactInfo.phone']}
                helperText={errors['contactInfo.phone']}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Store Email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value, 'contactInfo')}
                error={!!errors['contactInfo.email']}
                helperText={errors['contactInfo.email']}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website (Optional)"
                value={formData.contactInfo.website}
                onChange={(e) => handleInputChange('website', e.target.value, 'contactInfo')}
                helperText="Your store's website URL"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Store Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                error={!!errors['address.street']}
                helperText={errors['address.street']}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                error={!!errors['address.city']}
                helperText={errors['address.city']}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                error={!!errors['address.state']}
                helperText={errors['address.state']}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value, 'address')}
                error={!!errors['address.zipCode']}
                helperText={errors['address.zipCode']}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.address.country}
                onChange={(e) => handleInputChange('country', e.target.value, 'address')}
              />
            </Grid>
          </Grid>
        );
        
      case 3: // Zone Selection
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Your Delivery Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the delivery zone where your store will operate. This helps us connect you with customers in your area.
              </Typography>
            </Grid>
            
            {/* Zone Selection Controls */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Map />}
                  onClick={() => {
                    loadZones();
                    setShowMapDialog(true);
                  }}
                  sx={{ mr: 2, mb: 2 }}
                >
                  Open Map View
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocation />}
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  sx={{ mr: 2, mb: 2 }}
                >
                  Use My Location
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search address..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={mapLoading ? <CircularProgress size={16} /> : <Search />}
                    onClick={handleSearchAddress}
                    disabled={mapLoading || !searchAddress.trim()}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            {/* Selected Zone Display */}
            {selectedZone && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ backgroundColor: 'success.50', borderColor: 'success.200' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <CheckCircle color="success" />
                      <Box>
                        <Typography variant="h6" color="success.dark">
                          Selected Zone: {selectedZone.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your store will serve customers in this delivery zone
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Zone List */}
            {allZones.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Zones
                </Typography>
                <List>
                  {allZones.map((zone) => (
                    <ListItem key={zone.id} disablePadding>
                      <ListItemButton
                        selected={selectedZone?.id === zone.id}
                        onClick={() => handleZoneSelect(zone)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.50',
                            border: '1px solid',
                            borderColor: 'primary.200',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <LocationOn color={selectedZone?.id === zone.id ? 'primary' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={zone.name}
                          secondary={zone.description || 'Delivery zone'}
                        />
                        {selectedZone?.id === zone.id && (
                          <CheckCircle color="primary" />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {errors['zone.id'] && (
              <Grid item xs={12}>
                <Alert severity="error">{errors['zone.id']}</Alert>
              </Grid>
            )}
          </Grid>
        );
        
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review your information before submitting. Your store registration will be reviewed by our team.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Store Information
                  </Typography>
                  <Typography><strong>Name:</strong> {formData.name}</Typography>
                  {formData.description && (
                    <Typography><strong>Description:</strong> {formData.description}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Owner Details
                  </Typography>
                  <Typography><strong>Name:</strong> {formData.ownerName}</Typography>
                  <Typography><strong>Email:</strong> {formData.ownerEmail}</Typography>
                  <Typography><strong>Phone:</strong> {formData.ownerPhone}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contact & Address
                  </Typography>
                  <Typography><strong>Store Phone:</strong> {formData.contactInfo.phone}</Typography>
                  <Typography><strong>Store Email:</strong> {formData.contactInfo.email}</Typography>
                  {formData.contactInfo.website && (
                    <Typography><strong>Website:</strong> {formData.contactInfo.website}</Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Address:</strong></Typography>
                  <Typography>
                    {formData.address.street}<br />
                    {formData.address.city}, {formData.address.state} {formData.address.zipCode}<br />
                    {formData.address.country}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Delivery Zone
                  </Typography>
                  {formData.zone.id ? (
                    <Box display="flex" alignItems="center" gap={2}>
                      <CheckCircle color="success" />
                      <Box>
                        <Typography><strong>Selected Zone:</strong> {formData.zone.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your store will serve customers in this delivery zone
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="error">
                      No delivery zone selected
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Register Your Store
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Join our platform and start selling your products to customers in your area.
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper sx={{ p: 4 }}>
          {renderStepContent(activeStep)}
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </motion.div>
      
      {/* Map Dialog for Zone Selection */}
      <Dialog
        open={showMapDialog}
        onClose={() => setShowMapDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Select Delivery Zone on Map
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
            {mapLoadError ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1
              }}>
                <Alert severity="error">
                  Failed to load Google Maps. Please check your internet connection.
                </Alert>
              </Box>
            ) : !isMapLoaded ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1
              }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Map...</Typography>
              </Box>
            ) : (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px'
                }}
                center={mapCenter}
                zoom={12}
                options={{
                  zoomControl: true,
                  mapTypeControl: false,
                  scaleControl: true,
                  streetViewControl: false,
                  rotateControl: false,
                  fullscreenControl: true,
                  disableDefaultUi: false,
                }}
              >
                {/* Zone markers */}
                {allZones.map((zone) => (
                  <Marker
                    key={zone.id}
                    position={zone.coordinates || { lat: 37.7749, lng: -122.4194 }}
                    title={zone.name}
                    onClick={() => handleZoneSelect(zone)}
                  />
                ))}
                
                {/* Selected zone marker */}
                {selectedZone && (
                  <Marker
                    position={selectedZone.coordinates || { lat: 37.7749, lng: -122.4194 }}
                    title={selectedZone.name}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/>
                          <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      `),
                      scaledSize: new window.google.maps.Size(24, 24)
                    }}
                  />
                )}
              </GoogleMap>
            )}
          </Box>
          
          {/* Zone List in Dialog */}
          {allZones.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Available Zones
              </Typography>
              <List dense>
                {allZones.map((zone) => (
                  <ListItem key={zone.id} disablePadding>
                    <ListItemButton
                      selected={selectedZone?.id === zone.id}
                      onClick={() => handleZoneSelect(zone)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.50',
                          border: '1px solid',
                          borderColor: 'primary.200',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LocationOn color={selectedZone?.id === zone.id ? 'primary' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={zone.name}
                        secondary={zone.description || 'Delivery zone'}
                      />
                      {selectedZone?.id === zone.id && (
                        <CheckCircle color="primary" />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMapDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowMapDialog(false)}
            disabled={!selectedZone}
          >
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreRegistrationPage;
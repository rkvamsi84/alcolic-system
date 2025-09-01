import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  MyLocation,
  Search,
  CheckCircle,
  Error,
  Warning,
  Map,
  Phone,
  Home,
  Work,
  Business,
  Save
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../config/api';
import { toast } from 'react-hot-toast';

const AddressVerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [, setVerifying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });
  const [, setShowAddressDialog] = useState(false);
  const [, setEditingAddress] = useState(null);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get current location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      // Simulated reverse geocoding - in real app, use Google Maps API or similar
      const mockAddress = {
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      };

      setAddressForm(prev => ({
        ...prev,
        ...mockAddress
      }));

      // Verify the address
      await verifyAddress(mockAddress);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error('Failed to get address from location');
    } finally {
      setSearching(false);
    }
  };

  // Search for addresses
  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    setSearching(true);
    try {
      // Simulated address search - in real app, use Google Places API or similar
      const mockResults = [
        {
          id: 1,
          address: '123 Main Street, New York, NY 10001',
          details: {
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States'
          },
          verified: true
        },
        {
          id: 2,
          address: '456 Broadway, New York, NY 10013',
          details: {
            address: '456 Broadway',
            city: 'New York',
            state: 'NY',
            zipCode: '10013',
            country: 'United States'
          },
          verified: true
        },
        {
          id: 3,
          address: '789 5th Avenue, New York, NY 10022',
          details: {
            address: '789 5th Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10022',
            country: 'United States'
          },
          verified: false
        }
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Address search error:', error);
      toast.error('Failed to search for addresses');
    } finally {
      setSearching(false);
    }
  };

  // Verify address
  const verifyAddress = async (addressData) => {
    setVerifying(true);
    try {
      // Simulated address verification - in real app, use address verification service
      const response = await apiService.post('/addresses/verify', addressData);
      
      if (response.success) {
        toast.success('Address verified successfully');
        return true;
      } else {
        toast.error('Address verification failed - please check the details');
        return false;
      }
    } catch (error) {
      console.error('Address verification error:', error);
      toast.error('Failed to verify address');
      return false;
    } finally {
      setVerifying(false);
    }
  };

  // Select address from search results
  const handleSelectAddress = (result) => {
    setSelectedAddress(result);
    setAddressForm(prev => ({
      ...prev,
      ...result.details
    }));
    setSearchResults([]);
    setSearchQuery(result.address);
  };

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Save address
  const handleSaveAddress = async () => {
    if (!addressForm.address.trim()) {
      toast.error('Address is required');
      return;
    }

    if (!addressForm.city.trim()) {
      toast.error('City is required');
      return;
    }

    if (!addressForm.state.trim()) {
      toast.error('State is required');
      return;
    }

    if (!addressForm.zipCode.trim()) {
      toast.error('ZIP code is required');
      return;
    }

    try {
      setLoading(true);
      
      // Verify address before saving
      const isVerified = await verifyAddress(addressForm);
      
      if (isVerified) {
        const response = await apiService.post('/user/addresses', addressForm);
        
        if (response.success) {
          toast.success('Address saved successfully');
          setShowAddressDialog(false);
          setAddressForm({
            type: 'home',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
            phone: '',
            isDefault: false
          });
          setSelectedAddress(null);
          navigate('/addresses');
        } else {
          toast.error(response.message || 'Failed to save address');
        }
      }
    } catch (error) {
      console.error('Save address error:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  // Open map dialog
  const handleOpenMap = () => {
    setShowMap(true);
  };

  // Close map dialog
  const handleCloseMap = () => {
    setShowMap(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/addresses')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Address Verification
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          {/* Location Services */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MyLocation sx={{ mr: 1 }} />
                  Current Location
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Use your current location to automatically fill in your address details.
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={searching ? <CircularProgress size={20} /> : <MyLocation />}
                  onClick={getCurrentLocation}
                  disabled={searching}
                  sx={{ mb: 2 }}
                >
                  {searching ? 'Detecting Location...' : 'Use Current Location'}
                </Button>

                {currentLocation && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="success.contrastText">
                      Location detected: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Address Search */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Search sx={{ mr: 1 }} />
                  Search Address
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Enter address to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddressSearch();
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleAddressSearch}
                    disabled={searching}
                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    {searching ? <CircularProgress size={20} color="inherit" /> : <Search />}
                  </IconButton>
                </Box>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Search Results:
                    </Typography>
                    <List dense>
                      {searchResults.map((result) => (
                        <ListItem
                          key={result.id}
                          button
                          onClick={() => handleSelectAddress(result)}
                          sx={{ borderRadius: 1, mb: 1 }}
                        >
                          <ListItemIcon>
                            {result.verified ? (
                              <CheckCircle color="success" />
                            ) : (
                              <Warning color="warning" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={result.address}
                            secondary={result.verified ? 'Verified address' : 'Unverified address'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Address Form */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Address Details
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Map />}
                    onClick={handleOpenMap}
                  >
                    View on Map
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {/* Address Type */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Address Type"
                      value={addressForm.type}
                      onChange={handleInputChange('type')}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1 }}>
                            {addressForm.type === 'home' && <Home />}
                            {addressForm.type === 'work' && <Work />}
                            {addressForm.type === 'other' && <Business />}
                          </Box>
                        )
                      }}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </TextField>
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={addressForm.phone}
                      onChange={handleInputChange('phone')}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>

                  {/* Street Address */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={addressForm.address}
                      onChange={handleInputChange('address')}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>

                  {/* City, State, ZIP */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={addressForm.city}
                      onChange={handleInputChange('city')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={addressForm.state}
                      onChange={handleInputChange('state')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={addressForm.zipCode}
                      onChange={handleInputChange('zipCode')}
                    />
                  </Grid>

                  {/* Country */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={addressForm.country}
                      onChange={handleInputChange('country')}
                    />
                  </Grid>
                </Grid>

                {/* Verification Status */}
                {selectedAddress && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="success.contrastText" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ mr: 1 }} />
                      Address verified and ready to save
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/addresses')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSaveAddress}
                    disabled={loading || !addressForm.address.trim()}
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Map Dialog */}
      <Dialog
        open={showMap}
        onClose={handleCloseMap}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Address Location
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Map integration would be implemented here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddressVerificationPage;
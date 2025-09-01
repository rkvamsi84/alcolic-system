import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Store,
  DirectionsCar,
  AccessTime,
  FlashOn,
  Map,
  LocationSearching,
  CheckCircle,
  Cancel,
  Warning,
  LocalShipping,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLocation } from '../../contexts/LocationContext';
import { apiService, ENDPOINTS } from '../../config/api';
import { toast } from 'react-hot-toast';

const DeliveryZonesPage = () => {
  const {
    currentLocation,
    currentZone,
    isLoading,
    getCurrentLocation,
    getZoneForLocation,
  } = useLocation();

  const [deliveryZones, setDeliveryZones] = useState([]);
  const [coverageResults, setCoverageResults] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [testAddress, setTestAddress] = useState('');
  const [testOrderAmount, setTestOrderAmount] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckingCoverage, setIsCheckingCoverage] = useState(false);
  // const [expanded, setExpanded] = useState('panel1'); // Unused
  const [showValidationDialog, setShowValidationDialog] = useState(false);

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      checkCoverageForCurrentLocation();
    }
  }, [currentLocation]); // checkCoverageForCurrentLocation is defined in the same component

  const fetchDeliveryZones = async () => {
    try {
      const response = await apiService.get(ENDPOINTS.zones.deliveryInfo);
      if (response.success) {
        setDeliveryZones(response.data);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      toast.error('Failed to load delivery zones');
    }
  };

  const checkCoverageForCurrentLocation = async () => {
    if (!currentLocation) return;

    setIsCheckingCoverage(true);
    try {
      const response = await apiService.post('/zones/check-coverage', {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });

      if (response.success) {
        setCoverageResults(response.data);
      }
    } catch (error) {
      console.error('Error checking coverage:', error);
      toast.error('Failed to check delivery coverage');
    } finally {
      setIsCheckingCoverage(false);
    }
  };

  const validateDeliveryAddress = async () => {
    if (!testAddress || !testOrderAmount) {
      toast.error('Please enter both address and order amount');
      return;
    }

    setIsValidating(true);
    try {
      // First geocode the address
      const geocodeResponse = await apiService.get('/location/geocode', {
        params: { address: testAddress }
      });

      if (!geocodeResponse.success) {
        toast.error('Could not find the address');
        return;
      }

      const coordinates = geocodeResponse.data.geometry.location;

      // Validate delivery for the coordinates
      const response = await apiService.post('/zones/validate-delivery', {
        lat: coordinates.lat,
        lng: coordinates.lng,
        orderAmount: parseFloat(testOrderAmount),
      });

      if (response.success) {
        setValidationResult(response.data);
        setShowValidationDialog(true);
      }
    } catch (error) {
      console.error('Error validating delivery:', error);
      toast.error('Failed to validate delivery address');
    } finally {
      setIsValidating(false);
    }
  };

  const handleGetLocation = async () => {
    const location = await getCurrentLocation({
      highAccuracy: true,
      timeout: 15000,
    });
    
    if (location) {
      await getZoneForLocation(location);
    }
  };

  // const handleAccordionChange = (panel) => (event, isExpanded) => {
  //   setExpanded(isExpanded ? panel : false);
  // }; // Unused

  // const formatDistance = (meters) => {
  //   if (meters < 1000) {
  //     return `${Math.round(meters)}m`;
  //   }
  //   return `${(meters / 1000).toFixed(1)}km`;
  // }; // Unused

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCoverageStatus = (result) => {
    if (result.inPolygon) return 'primary';
    if (result.inRange) return 'warning';
    return 'error';
  };

  const getCoverageIcon = (result) => {
    if (result.inPolygon) return <CheckCircle />;
    if (result.inRange) return <Warning />;
    return <Cancel />;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Delivery Zones
        </Typography>

        <Grid container spacing={3}>
          {/* Current Location & Zone */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MyLocation sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Current Location</Typography>
                </Box>

                {currentLocation ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </Typography>
                    {currentLocation.accuracy && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Accuracy: ±{Math.round(currentLocation.accuracy)}m
                      </Typography>
                    )}
                    
                    {currentZone && (
                      <Box mt={2}>
                        <Chip
                          label={`Zone: ${currentZone.name}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No location detected
                  </Typography>
                )}

                <Button
                  variant="contained"
                  startIcon={<MyLocation />}
                  onClick={handleGetLocation}
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Getting Location...' : 'Get Current Location'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Coverage Results */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Map sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Coverage Status</Typography>
                </Box>

                {isCheckingCoverage ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography>Checking coverage...</Typography>
                  </Box>
                ) : coverageResults ? (
                  <Box>
                    <Alert 
                      severity={coverageResults.hasCoverage ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    >
                      {coverageResults.hasCoverage 
                        ? 'Delivery available in your area' 
                        : 'Delivery not available in your area'
                      }
                    </Alert>

                    <List dense>
                      {coverageResults.coverageResults.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {getCoverageIcon(result)}
                          </ListItemIcon>
                          <ListItemText
                            primary={result.zoneName}
                            secondary={`${result.distance}km away (max: ${result.maximumDistance}km)`}
                          />
                          <Chip
                            label={result.inPolygon ? 'In Zone' : result.inRange ? 'In Range' : 'Out of Range'}
                            color={getCoverageStatus(result)}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Get your location to check coverage
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Zones Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Available Delivery Zones</Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Zone Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Min Order</TableCell>
                        <TableCell>Delivery Fee</TableCell>
                        <TableCell>Delivery Time</TableCell>
                        <TableCell>Max Distance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deliveryZones.map((zone) => (
                        <TableRow key={zone.id}>
                          <TableCell>
                            <Typography variant="subtitle2">{zone.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={zone.status}
                              color={getStatusColor(zone.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              ${zone.minimumOrder}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                Min: ${zone.deliveryFee.minimum}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                +${zone.deliveryFee.perKm}/km
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {zone.deliveryTime.min}-{zone.deliveryTime.max} min
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {zone.maximumDistance}km
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Validation */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationSearching sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Test Delivery Address</Typography>
                </Box>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Enter Address"
                      value={testAddress}
                      onChange={(e) => setTestAddress(e.target.value)}
                      placeholder="e.g., 123 Main St, New York, NY"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Order Amount ($)"
                      type="number"
                      value={testOrderAmount}
                      onChange={(e) => setTestOrderAmount(e.target.value)}
                      placeholder="25.00"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={validateDeliveryAddress}
                      disabled={isValidating || !testAddress || !testOrderAmount}
                      startIcon={isValidating ? <CircularProgress size={16} /> : <LocationSearching />}
                    >
                      {isValidating ? 'Validating...' : 'Check Delivery'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setTestAddress('');
                        setTestOrderAmount('');
                        setValidationResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Validation Result Dialog */}
        <Dialog
          open={showValidationDialog}
          onClose={() => setShowValidationDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              {validationResult?.isDeliverable ? (
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              ) : (
                <Cancel sx={{ mr: 1, color: 'error.main' }} />
              )}
              Delivery Validation Result
            </Box>
          </DialogTitle>
          <DialogContent>
            {validationResult && (
              <Box>
                {validationResult.isDeliverable ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Delivery available to this address!
                    </Alert>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Zone
                        </Typography>
                        <Typography variant="body1">
                          {validationResult.zone.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography variant="body1">
                          {validationResult.distance}km
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delivery Fee
                        </Typography>
                        <Typography variant="body1" color="primary.main" fontWeight="bold">
                          ${validationResult.deliveryFee}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delivery Time
                        </Typography>
                        <Typography variant="body1">
                          {validationResult.deliveryTime.min}-{validationResult.deliveryTime.max} min
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {validationResult.reason}
                    </Alert>
                    
                    {validationResult.minimumOrder && (
                      <Typography variant="body2" color="text.secondary">
                        Minimum order amount: ${validationResult.minimumOrder}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowValidationDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default DeliveryZonesPage;
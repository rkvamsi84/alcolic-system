import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error,
  Info,
  Close,
  UploadFile,
  QrCode,
  Description,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const BulkImport = () => {
  const { token } = useAuth();
  const theme = useTheme();
  

  
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle'); // idle, importing, completed, error
  const [importResults, setImportResults] = useState(null);
  const [barcodeLookupOpen, setBarcodeLookupOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  
  // Single product import states
  const [singleImportOpen, setSingleImportOpen] = useState(false);
  const [singleImportData, setSingleImportData] = useState({
    barcode: '',
    price: '',
    stock: '',
    category: '',
    store: ''
  });
  const [singleImportLoading, setSingleImportLoading] = useState(false);
  const [singleImportResult, setSingleImportResult] = useState(null);
  
  // Single import barcode lookup states
  const [singleBarcodeResult, setSingleBarcodeResult] = useState(null);
  const [singleBarcodeLoading, setSingleBarcodeLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportStatus('idle');
      setImportResults(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const downloadTemplate = async () => {
    if (!token) {
      alert('Authentication token not available. Please log in again.');
      return;
    }
    
    try {
      const response = await fetch('https://alcohol.gnritservices.com/api/v1/products/bulk-import/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products_import_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download template');
      }
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    if (!token) {
      alert('Authentication token not available. Please log in again.');
      return;
    }

    setImportStatus('importing');
    setImportProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://alcohol.gnritservices.com/api/v1/products/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setImportResults(result.data);
        setImportStatus('completed');
        setImportProgress(100);
      } else {
        setImportStatus('error');
        alert(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      alert('Import failed');
    }
  };

  const testBarcodeLookup = async () => {
    if (!barcodeInput.trim()) {
      alert('Please enter a barcode');
      return;
    }

    if (!token) {
      alert('Authentication token not available. Please log in again.');
      return;
    }

    setBarcodeLoading(true);
    try {
              const response = await fetch(`https://alcohol.gnritservices.com/api/v1/products/barcode-lookup/${barcodeInput.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setBarcodeResult(result.data);
      } else {
        setBarcodeResult(null);
        alert(result.message || 'Barcode not found');
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert('Barcode lookup failed');
    } finally {
      setBarcodeLoading(false);
    }
  };

  const resetBulkImport = () => {
    setSelectedFile(null);
    setImportProgress(0);
    setImportStatus('idle');
    setImportResults(null);
  };

  const testSingleBarcodeLookup = async () => {
    if (!singleImportData.barcode.trim()) {
      alert('Please enter a barcode first');
      return;
    }

    if (!token) {
      alert('Authentication token not available. Please log in again.');
      return;
    }

    setSingleBarcodeLoading(true);
    setSingleBarcodeResult(null);

    try {
              const response = await fetch(`https://alcohol.gnritservices.com/api/v1/products/barcode-lookup/${singleImportData.barcode.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSingleBarcodeResult(result.data);
      } else {
        setSingleBarcodeResult(null);
        alert(result.message || 'Barcode not found');
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert('Barcode lookup failed');
    } finally {
      setSingleBarcodeLoading(false);
    }
  };

  const handleSingleImport = async () => {
    if (!token) {
      alert('Authentication token not available. Please log in again.');
      return;
    }

    // Validate required fields
    const { barcode, price, stock, category, store } = singleImportData;
    if (!barcode || !price || !stock || !category || !store) {
      alert('Please fill in all required fields');
      return;
    }

    setSingleImportLoading(true);
    setSingleImportResult(null);

    try {
              const response = await fetch('https://alcohol.gnritservices.com/api/v1/products/single-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(singleImportData)
      });

      const result = await response.json();

      if (response.ok) {
        setSingleImportResult({
          success: true,
          data: result.data
        });
        // Reset form
        setSingleImportData({
          barcode: '',
          price: '',
          stock: '',
          category: '',
          store: ''
        });
        setSingleBarcodeResult(null);
      } else {
        setSingleImportResult({
          success: false,
          message: result.message || 'Import failed'
        });
      }
    } catch (error) {
      console.error('Single import error:', error);
      setSingleImportResult({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setSingleImportLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}>
        Bulk Import Products
      </Typography>



      <Grid container spacing={3}>
        {/* Main Import Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Import Products from CSV
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  Select CSV File
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileSelect}
                  />
                </Button>
                
                {selectedFile && (
                  <Chip
                    label={selectedFile.name}
                    onDelete={() => setSelectedFile(null)}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {importStatus === 'importing' && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={importProgress} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Importing products... {importProgress}%
                  </Typography>
                </Box>
              )}

              {importResults && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.default }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Import Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          {importResults.successCount}
                        </Typography>
                        <Typography variant="body2">Successful</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="error.main">
                          {importResults.errorCount}
                        </Typography>
                        <Typography variant="body2">Errors</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="info.main">
                          {importResults.barcodeLookupCount}
                        </Typography>
                        <Typography variant="body2">Barcode Lookups</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary.main">
                          {importResults.totalProcessed}
                        </Typography>
                        <Typography variant="body2">Total Processed</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {importResults.errors && importResults.errors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Errors:
                      </Typography>
                      <List dense>
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Error color="error" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Row ${error.row}: ${error.error}`}
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      {importResults.errors.length > 5 && (
                        <Typography variant="body2" color="text.secondary">
                          ... and {importResults.errors.length - 5} more errors
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleBulkImport}
                  disabled={!selectedFile || importStatus === 'importing'}
                  startIcon={<UploadFile />}
                  color="primary"
                >
                  {importStatus === 'importing' ? 'Importing...' : 'Start Import'}
                </Button>
                
                {importResults && (
                  <Button
                    variant="outlined"
                    onClick={resetBulkImport}
                    color="primary"
                  >
                    Import Another File
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tools Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Tools
              </Typography>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
                color="primary"
                sx={{ mb: 2 }}
              >
                Download Template
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCode />}
                onClick={() => setBarcodeLookupOpen(true)}
                color="primary"
              >
                Test Barcode Lookup
              </Button>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Features
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="CSV Import" 
                    secondary="Upload product data via CSV"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Go-UPC Integration" 
                    secondary="Automatic product data enhancement"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Error Reporting" 
                    secondary="Detailed error messages with row numbers"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Progress Tracking" 
                    secondary="Real-time import progress"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Single Product Import Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode />
                Single Product Import
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Import a single product by barcode. The system will automatically fetch product details from Go-UPC.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Barcode"
                      value={singleImportData.barcode}
                      onChange={(e) => setSingleImportData({...singleImportData, barcode: e.target.value})}
                      placeholder="e.g., 049000028904"
                    />
                    <Button
                      variant="outlined"
                      onClick={testSingleBarcodeLookup}
                      disabled={!singleImportData.barcode.trim() || singleBarcodeLoading}
                      color="primary"
                      sx={{ 
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      {singleBarcodeLoading ? 'Testing...' : 'Test'}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={singleImportData.price}
                    onChange={(e) => setSingleImportData({...singleImportData, price: e.target.value})}
                    placeholder="e.g., 2.99"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    type="number"
                    value={singleImportData.stock}
                    onChange={(e) => setSingleImportData({...singleImportData, stock: e.target.value})}
                    placeholder="e.g., 100"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={singleImportData.category}
                    onChange={(e) => setSingleImportData({...singleImportData, category: e.target.value})}
                    placeholder="e.g., Beer"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Store"
                    value={singleImportData.store}
                    onChange={(e) => setSingleImportData({...singleImportData, store: e.target.value})}
                    placeholder="e.g., Main Store"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSingleImport}
                    disabled={singleImportLoading}
                    startIcon={<QrCode />}
                    color="success"
                  >
                    {singleImportLoading ? 'Importing...' : 'Import Single Product'}
                  </Button>
                </Grid>
              </Grid>

              {/* Barcode Lookup Results */}
              {singleBarcodeResult && (
                <Box sx={{ mt: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.success.main }}>
                      ✅ Barcode Lookup Results
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Product Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {singleBarcodeResult.name || 'Not available'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Brand
                        </Typography>
                        <Typography variant="body1">
                          {singleBarcodeResult.brand || 'Not available'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '0.9rem' }}>
                          {singleBarcodeResult.description ? 
                            singleBarcodeResult.description.substring(0, 150) + '...' : 
                            'Not available'
                          }
                        </Typography>
                      </Grid>
                      {singleBarcodeResult.specifications && (
                        <>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Volume
                            </Typography>
                            <Typography variant="body1">
                              {singleBarcodeResult.specifications.volume || 'Not available'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Manufacturer
                            </Typography>
                            <Typography variant="body1">
                              {singleBarcodeResult.specifications.manufacturer || 'Not available'}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info" sx={{ fontSize: '0.9rem' }}>
                        <strong>Ready to Import:</strong> This product data will be automatically used when you click "Import Single Product".
                      </Alert>
                    </Box>
                  </Paper>
                </Box>
              )}

              {singleImportResult && (
                <Box sx={{ mt: 3 }}>
                  <Alert 
                    severity={singleImportResult.success ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    {singleImportResult.success ? 'Product imported successfully!' : singleImportResult.message}
                  </Alert>
                  
                  {singleImportResult.success && singleImportResult.data && (
                    <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Imported Product Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Product Name
                          </Typography>
                          <Typography variant="body1">
                            {singleImportResult.data.product.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Brand
                          </Typography>
                          <Typography variant="body1">
                            {singleImportResult.data.product.brand}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Price
                          </Typography>
                          <Typography variant="body1">
                            ${singleImportResult.data.product.price}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Stock
                          </Typography>
                          <Typography variant="body1">
                            {singleImportResult.data.product.stock}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body1">
                            {singleImportResult.data.product.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Store
                          </Typography>
                          <Typography variant="body1">
                            {singleImportResult.data.product.store}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barcode Lookup Dialog */}
      <Dialog 
        open={barcodeLookupOpen} 
        onClose={() => setBarcodeLookupOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Test Barcode Lookup</Typography>
            <IconButton onClick={() => setBarcodeLookupOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Enter Barcode"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="e.g., 1234567890123"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={testBarcodeLookup}
              disabled={barcodeLoading || !barcodeInput.trim()}
              startIcon={<QrCode />}
              color="primary"
            >
              {barcodeLoading ? 'Looking up...' : 'Lookup Barcode'}
            </Button>
          </Box>

          {barcodeResult && (
            <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Product Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {barcodeResult.name || 'Not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Brand
                  </Typography>
                  <Typography variant="body1">
                    {barcodeResult.brand || 'Not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {barcodeResult.description || 'Not available'}
                  </Typography>
                </Grid>
                {barcodeResult.specifications && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Volume
                      </Typography>
                      <Typography variant="body1">
                        {barcodeResult.specifications.volume || 'Not available'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Manufacturer
                      </Typography>
                      <Typography variant="body1">
                        {barcodeResult.specifications.manufacturer || 'Not available'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeLookupOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkImport;
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Alert, CircularProgress, Snackbar, IconButton, LinearProgress, List, ListItem, ListItemText, ListItemIcon, useTheme
} from "@mui/material";
import { Add, Edit, Delete, Search, FilterList, CloudUpload, Download, CheckCircle, Error, Info } from "@mui/icons-material";

const getProductImageUrl = (product) => {
  if (product.images && product.images.length > 0 && product.images[0].url) {
    const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/api\/v1$/, '');
    return `${baseUrl}${product.images[0].url}`.replace(/([^:]\/)\/+/, '$1/');
  }
  return '/assets/placeholder.png';
};

export default function Products() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    category: '',
    store: '',
    price: '',
    stock: '',
    alcoholContent: '',
    volume: '',
    description: '',
    status: 'active',
    isFeatured: false,
    isPopular: false,
    tags: '',
    lowStockThreshold: '',
    trackInventory: false,
    allowBackorder: false,
    minimumAge: '',
    requiresIdVerification: false,
    restrictedHours: false,
    licenseRequired: false,
    volumeUnit: 'ml',
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Bulk import states
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [importResults, setImportResults] = useState(null);
  const [barcodeLookupOpen, setBarcodeLookupOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        console.log('Categories fetched:', data.data);
      } else {
        console.error('Failed to fetch categories:', data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch stores from backend
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/stores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStores(data.data);
        console.log('Stores fetched:', data.data);
      } else {
        console.error('Failed to fetch stores:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  // Download CSV template
  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/bulk-import/template`, {
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
        
        setSnackbar({
          open: true,
          message: 'Template downloaded successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download template: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Handle file selection for bulk import
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      setSnackbar({
        open: true,
        message: 'Please select a valid CSV file',
        severity: 'error'
      });
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please select a file to import',
        severity: 'error'
      });
      return;
    }

    try {
      setImportStatus('uploading');
      setImportProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setImportStatus('completed');
        setImportResults(result.data);
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        
        // Refresh products list
        await fetchProducts();
      } else {
        setImportStatus('error');
        setSnackbar({
          open: true,
          message: result.message || 'Import failed',
          severity: 'error'
        });
      }
    } catch (error) {
      setImportStatus('error');
      setSnackbar({
        open: true,
        message: 'Import failed: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Test barcode lookup
  const testBarcodeLookup = async () => {
    if (!barcodeInput.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a barcode',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/barcode-lookup/${barcodeInput.trim()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setBarcodeResult(result.data);
        setSnackbar({
          open: true,
          message: 'Barcode lookup successful!',
          severity: 'success'
        });
      } else {
        setBarcodeResult(null);
        setSnackbar({
          open: true,
          message: result.message || 'Barcode not found',
          severity: 'warning'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Barcode lookup failed: ' + error.message,
        severity: 'error'
      });
    }
  };

  // Reset bulk import
  const resetBulkImport = () => {
    setSelectedFile(null);
    setImportProgress(0);
    setImportStatus('idle');
    setImportResults(null);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStores();
  }, []);

  const brands = [...new Set(products.map(p => p.brand))];
  const storeNames = [...new Set(products.map(p => p.store?.name || p.store))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category?.name === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    const matchesStore = !storeFilter || (product.store?.name || product.store) === storeFilter;
    const matchesPriceMin = !priceMin || product.price?.regular >= parseFloat(priceMin);
    const matchesPriceMax = !priceMax || product.price?.regular <= parseFloat(priceMax);
    return matchesSearch && matchesCategory && matchesStatus && matchesBrand && matchesStore && matchesPriceMin && matchesPriceMax;
  });

  // Handle Edit
  const handleEdit = (product) => {
    setEditProduct(product);
    setEditMode(true);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      brand: product.brand || '',
      category: product.category?._id || product.category || '',
      store: product.store?._id || product.store || '',
      price: product.price?.regular || '',
      stock: product.inventory?.quantity || '',
      alcoholContent: product.specifications?.alcoholContent || '',
      volume: product.specifications?.volume || '',
      description: product.description || '',
      status: product.status || 'active',
      isFeatured: product.isFeatured || false,
      isPopular: product.isPopular || false,
      tags: product.tags || '',
      lowStockThreshold: product.lowStockThreshold || '',
      trackInventory: product.trackInventory || false,
      allowBackorder: product.allowBackorder || false,
      minimumAge: product.minimumAge || '',
      requiresIdVerification: product.requiresIdVerification || false,
      restrictedHours: product.restrictedHours || false,
      licenseRequired: product.licenseRequired || false,
      volumeUnit: product.volumeUnit || 'ml',
    });
    setOpenDialog(true);
  };

  // Handle Delete
  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== productId));
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to delete product', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    }
  };

  // Handle Dialog Close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditMode(false);
    setEditProduct(null);
    setFormData({
      name: '',
      sku: '',
      brand: '',
      category: '',
      store: '',
      price: '',
      stock: '',
      alcoholContent: '',
      volume: '',
      description: '',
      status: 'active',
      isFeatured: false,
      isPopular: false,
      tags: '',
      lowStockThreshold: '',
      trackInventory: false,
      allowBackorder: false,
      minimumAge: '',
      requiresIdVerification: false,
      restrictedHours: false,
      licenseRequired: false,
      volumeUnit: 'ml',
    });
  };

  // Handle Save
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });
      selectedImages.forEach((img) => {
        formDataToSend.append('images', img);
      });

      const url = editMode 
        ? `${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products/${editProduct._id}`
        : `${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/products`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        if (editMode) {
          setProducts(products.map(p => p._id === editProduct._id ? data.data : p));
          setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
        } else {
          setProducts([data.data, ...products]);
          setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
        }
        handleDialogClose();
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to save product', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save product', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchProducts}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Products</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<CloudUpload />} 
            onClick={() => setBulkImportOpen(true)}
            color="primary"
          >
            Bulk Import
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />} 
            onClick={downloadTemplate}
            color="primary"
          >
            Download Template
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Info />} 
            onClick={() => setBarcodeLookupOpen(true)}
            color="primary"
          >
            Test Barcode
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setOpenDialog(true)} 
            color="primary"
          >
            Add Product
          </Button>
        </Box>
      </Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField label="Search" variant="outlined" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 220 }} />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {categories.map(cat => <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}><FilterList /></IconButton>
        {moreFiltersOpen && (
          <>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Brand</InputLabel>
              <Select value={brandFilter} label="Brand" onChange={e => setBrandFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {brands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Store</InputLabel>
              <Select value={storeFilter} label="Store" onChange={e => setStoreFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {storeNames.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Min Price" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} sx={{ minWidth: 120 }} />
            <TextField label="Max Price" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} sx={{ minWidth: 120 }} />
          </>
        )}
      </Paper>
      <Grid container spacing={3}>
        {filteredProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative' }}>
              <CardMedia component="img" height="180" image={getProductImageUrl(product)} alt={product.name} sx={{ objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">{product.brand}</Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>₹{product.price?.regular}</Typography>
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  {product.isFeatured && <Chip label="Featured" color="success" size="small" />}
                  {product.isPopular && <Chip label="Popular" color="warning" size="small" />}
                  {product.status === 'active' ? <Chip label="Active" color="primary" size="small" /> : <Chip label="Inactive" color="default" size="small" />}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(product)}>Edit</Button>
                <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(product._id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportOpen} onClose={() => setBulkImportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h6">Bulk Import Products</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Import multiple products from a CSV file. The system will automatically enhance product data using Go-UPC barcode lookup when barcodes are provided.
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  color="primary"
                >
                  Select CSV File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  ✓ {selectedFile.name}
                </Typography>
              )}
            </Box>

            {importStatus === 'uploading' && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Processing import...
                </Typography>
              </Box>
            )}

            {importResults && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Import completed successfully!
                </Alert>
                <Typography variant="h6" sx={{ mb: 1 }}>Import Results:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={`${importResults.successCount} products imported successfully`}
                    />
                  </ListItem>
                  {importResults.barcodeLookupCount > 0 && (
                    <ListItem>
                      <ListItemIcon><Info color="info" /></ListItemIcon>
                      <ListItemText 
                        primary={`${importResults.barcodeLookupCount} products enhanced with Go-UPC data`}
                      />
                    </ListItem>
                  )}
                  {importResults.errorCount > 0 && (
                    <ListItem>
                      <ListItemIcon><Error color="error" /></ListItemIcon>
                      <ListItemText 
                        primary={`${importResults.errorCount} errors encountered`}
                      />
                    </ListItem>
                  )}
                </List>
                
                {importResults.errors && importResults.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Errors:</Typography>
                    <List dense>
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><Error color="error" /></ListItemIcon>
                          <ListItemText 
                            primary={`Row ${error.row}: ${error.error}`}
                          />
                        </ListItem>
                      ))}
                      {importResults.errors.length > 5 && (
                        <ListItem>
                          <ListItemText 
                            primary={`... and ${importResults.errors.length - 5} more errors`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkImportOpen(false)}>Cancel</Button>
          {importStatus === 'completed' && (
            <Button onClick={resetBulkImport} color="primary">
              Import Another File
            </Button>
          )}
          {importStatus === 'idle' && selectedFile && (
            <Button 
              onClick={handleBulkImport} 
              variant="contained"
              color="primary"
            >
              Start Import
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Barcode Lookup Dialog */}
      <Dialog open={barcodeLookupOpen} onClose={() => setBarcodeLookupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Info color="primary" />
            <Typography variant="h6">Test Go-UPC Barcode Lookup</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test the Go-UPC barcode lookup service to see what product information can be retrieved.
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Enter Barcode (UPC/EAN)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g., 1234567890123"
                sx={{ mb: 2 }}
              />
              <Button 
                onClick={testBarcodeLookup}
                variant="contained"
                color="primary"
              >
                Lookup Product
              </Button>
            </Box>

            {barcodeResult && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Product found in Go-UPC database!
                </Alert>
                <Typography variant="h6" sx={{ mb: 1 }}>Product Information:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Name"
                      secondary={barcodeResult.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Brand"
                      secondary={barcodeResult.brand}
                    />
                  </ListItem>
                  {barcodeResult.description && (
                    <ListItem>
                      <ListItemText 
                        primary="Description"
                        secondary={barcodeResult.description}
                      />
                    </ListItem>
                  )}
                  {barcodeResult.specifications && (
                    <>
                      {barcodeResult.specifications.volume && (
                        <ListItem>
                          <ListItemText 
                            primary="Volume"
                            secondary={barcodeResult.specifications.volume}
                          />
                        </ListItem>
                      )}
                      {barcodeResult.specifications.manufacturer && (
                        <ListItem>
                          <ListItemText 
                            primary="Manufacturer"
                            secondary={barcodeResult.specifications.manufacturer}
                          />
                        </ListItem>
                      )}
                    </>
                  )}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBarcodeLookupOpen(false);
            setBarcodeInput('');
            setBarcodeResult(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Product Name" 
                variant="outlined" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="SKU" 
                variant="outlined" 
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Brand" 
                variant="outlined" 
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select 
                  label="Category" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select 
                  label="Store" 
                  value={formData.store}
                  onChange={(e) => setFormData({...formData, store: e.target.value})}
                  required
                >
                  {stores.length > 0 ? (
                    stores.map(store => (
                      <MenuItem key={store._id} value={store._id}>{store.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No stores available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Price" 
                variant="outlined" 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Stock Quantity" 
                variant="outlined" 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Alcohol Content (%)" 
                variant="outlined" 
                type="number"
                value={formData.alcoholContent}
                onChange={(e) => setFormData({...formData, alcoholContent: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Volume (ml)" 
                variant="outlined" 
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({...formData, volume: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Description" 
                variant="outlined" 
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 1 }}
              >
                {selectedImages.length > 0 ? `${selectedImages.length} image(s) selected` : "Upload Product Images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setSelectedImages(files);
                    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
                  }}
                />
              </Button>
              {previewUrls.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {previewUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Preview ${idx + 1}`} style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4 }} />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{editMode ? "Save Changes" : "Add Product"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
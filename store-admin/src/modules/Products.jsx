import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  Tabs,
  Tab,
  Avatar,
  Rating,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import PageContainer from '../components/PageContainer';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ToysIcon from '@mui/icons-material/Toys';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useAuth } from '../auth/AuthContext';

const MotionCard = motion(Card);

const Products = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Calculate dynamic stats from real data
  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      change: `${products.filter(p => p.status === 'active').length} active`,
      icon: <InventoryIcon />,
    },
    {
      title: 'Categories',
      value: categories.length.toString(),
      change: categoriesLoading ? 'Loading...' : 'Available',
      icon: <CategoryIcon />,
    },
    {
      title: 'Low Stock',
      value: products.filter(p => p.inventory?.stock < 10).length.toString(),
      change: 'Need attention',
      icon: <LocalOfferIcon />,
    },
    {
      title: 'In Stock',
      value: products.filter(p => p.inventory?.stock > 0).length.toString(),
      change: 'Available now',
      icon: <TrendingUpIcon />,
    },
  ];

  const handleOpenMenu = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'low_stock':
        return theme.palette.warning.main;
      case 'out_of_stock':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  const handleOpenDialog = (product = null) => {
    setEditProduct(product ? { ...product } : {
      name: '',
      sku: '',
      brand: '',
      category: categories[0]?._id || '',
      price: '',
      stock: '',
      alcoholContent: '',
      volume: '',
      status: 'active',
      description: ''
    });
    setOpenDialog(true);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditProduct(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (!user?.storeId) {
        setSnackbar({ open: true, message: 'No store ID found', severity: 'error' });
        return;
      }
      
      const formData = new FormData();
      formData.append('name', editProduct.name);
      formData.append('sku', editProduct.sku || `SKU-${Date.now()}`);
      formData.append('brand', editProduct.brand || 'Unknown Brand');
      formData.append('category', editProduct.category);
      formData.append('store', user.storeId);
      formData.append('price', parseFloat(editProduct.price));
      formData.append('stock', parseInt(editProduct.stock));
      formData.append('alcoholContent', parseFloat(editProduct.alcoholContent) || 0);
      formData.append('volume', parseFloat(editProduct.volume) || 750);
      formData.append('status', editProduct.status || 'active');
      formData.append('description', editProduct.description || '');
      if (selectedImage) {
        formData.append('images', selectedImage);
      }

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products`;
      const method = editProduct?._id ? 'PUT' : 'POST';
      const url = editProduct?._id ? `${apiUrl}/${editProduct._id}` : apiUrl;
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the products list
        const productsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products?store=${user.storeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const productsData = await productsResponse.json();
        if (productsData.success) {
          setProducts(productsData.data);
        }
        
        setSnackbar({ 
          open: true, 
          message: editProduct?._id ? 'Product updated successfully' : 'Product created successfully', 
          severity: 'success' 
        });
        setOpenDialog(false);
        setEditProduct(null);
        setSelectedImage(null);
        setPreviewUrl(null);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to save product', severity: 'error' });
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setSnackbar({ open: true, message: 'Failed to save product', severity: 'error' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to delete product', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    }
    handleCloseMenu();
  };

  const handleDuplicateProduct = async (product) => {
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY-${Date.now()}`,
        analytics: { sales: 0, views: 0, revenue: 0 },
        rating: { average: 0, count: 0 }
      };
      
      const productData = {
        name: duplicatedProduct.name,
        sku: duplicatedProduct.sku,
        brand: duplicatedProduct.brand,
        category: duplicatedProduct.category,
        store: user.storeId,
        price: duplicatedProduct.price,
        inventory: duplicatedProduct.inventory,
        specifications: duplicatedProduct.specifications,
        status: 'active',
        description: duplicatedProduct.description
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      if (data.success) {
        setProducts(prevProducts => [data.data, ...prevProducts]);
        setSnackbar({ open: true, message: 'Product duplicated successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to duplicate product', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to duplicate product', severity: 'error' });
    }
    handleCloseMenu();
  };

  const handleArchiveProduct = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'inactive' })
      });
      const data = await response.json();
      if (data.success) {
        setProducts(prevProducts =>
          prevProducts.map(p => p._id === productId ? { ...p, status: 'inactive' } : p)
        );
        setSnackbar({ open: true, message: 'Product archived successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to archive product', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to archive product', severity: 'error' });
    }
    handleCloseMenu();
  };



  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error('Failed to fetch categories:', data.message);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?.storeId) throw new Error('No store ID found for user');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb'}/products?store=${user.storeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch products');
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && token) {
      fetchProducts();
      fetchCategories();
    }
  }, [user, token]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <PageContainer title="Products">
      <Typography variant="h4" mb={2}>Products</Typography>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h5" component="h1">
              Products
            </Typography>
          </Grid>
          <Grid item>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 1, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    All Products
                    <Chip
                      label={products.length}
                      size="small"
                      sx={{ bgcolor: 'primary.lighter' }}
                    />
                  </Box>
                }
                disableRipple
              />
              {categories.map((category) => (
                <Tab
                  key={category._id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.name}
                      <Chip
                        label={products.filter(p => p.category?._id === category._id).length}
                        size="small"
                        sx={{ bgcolor: 'primary.lighter' }}
                      />
                    </Box>
                  }
                  disableRipple
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ minWidth: 100 }}
            >
              Filter
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price & Stock</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={product.images && product.images.length > 0 ? product.images[0].url : product.image}
                          sx={{ width: 48, height: 48 }}
                        >
                          {product.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {product.name}
                            {product.trending && (
                              <TrendingUpIcon
                                color="primary"
                                fontSize="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku} • Updated {new Date(product.updatedAt).toLocaleDateString()}
                        </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          label={product.category?.name || product.category}
                          size="small"
                          sx={{ bgcolor: 'primary.lighter' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {product.brand}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        ${product.price?.regular || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.inventory?.quantity || 0} in stock
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Rating value={product.rating?.average || 0} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {product.rating?.count || 0} reviews • {product.analytics?.sales || 0} sales
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(product.status)}
                        size="small"
                        sx={{
                          color: getStatusColor(product.status),
                          bgcolor: `${getStatusColor(product.status)}15`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenMenu(event, product)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>{editProduct?._id ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Product Name"
                      fullWidth
                      value={editProduct?.name || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="SKU"
                      fullWidth
                      value={editProduct?.sku || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Brand"
                      fullWidth
                      value={editProduct?.brand || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editProduct?.category || ''}
                        label="Category"
                        onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                        required
                        disabled={categoriesLoading}
                      >
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No categories available</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Price"
                      type="number"
                      fullWidth
                      value={editProduct?.price || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Stock"
                      type="number"
                      fullWidth
                      value={editProduct?.stock || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Alcohol Content (%)"
                      type="number"
                      fullWidth
                      value={editProduct?.alcoholContent || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, alcoholContent: parseFloat(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Volume (ml)"
                      type="number"
                      fullWidth
                      value={editProduct?.volume || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, volume: parseFloat(e.target.value) })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editProduct?.status || 'active'}
                        label="Status"
                        onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      value={editProduct?.description || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mt: 1 }}
                      startIcon={<CloudUploadIcon />}
                    >
                      {selectedImage ? selectedImage.name : "Upload Product Image"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: 120, marginTop: 8 }} />
                    )}
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveProduct}>
                {editProduct?._id ? 'Update' : 'Add'} Product
              </Button>
            </DialogActions>
          </Dialog>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleOpenDialog(selectedProduct);
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Edit
            </MenuItem>
            <MenuItem onClick={() => handleDuplicateProduct(selectedProduct)}>
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              Duplicate
            </MenuItem>
            <MenuItem onClick={() => handleArchiveProduct(selectedProduct.id)}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              Archive
            </MenuItem>
            <MenuItem 
              onClick={() => handleDeleteProduct(selectedProduct.id)}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Delete
            </MenuItem>
          </Menu>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>


    </PageContainer>
  );
};

export default Products;

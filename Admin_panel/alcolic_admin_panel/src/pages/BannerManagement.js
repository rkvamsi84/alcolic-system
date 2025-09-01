import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
// Removed MUI date picker imports - using HTML date inputs instead

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    linkType: 'none',
    linkId: '',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    targetAudience: 'all'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const linkTypes = [
    { value: 'none', label: 'No Link' },
    { value: 'product', label: 'Product' },
    { value: 'category', label: 'Category' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'external', label: 'External URL' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Users' },
    { value: 'new_users', label: 'New Users' },
    { value: 'existing_users', label: 'Existing Users' },
    { value: 'premium_users', label: 'Premium Users' }
  ];

  useEffect(() => {
    fetchBanners();
    fetchAnalytics();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      console.log('Fetching banners with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Banners data:', data);
        setBanners(data.data || []);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError(errorData.message || 'Failed to fetch banners');
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setError('Failed to fetch banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      linkType: 'none',
      linkId: '',
      order: 0,
      isActive: true,
      startDate: '',
      endDate: '',
      targetAudience: 'all'
    });
    setImageFile(null);
    setImagePreview('');
    setEditingBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'startDate' || key === 'endDate') {
            if (formData[key]) {
              formDataToSend.append(key, new Date(formData[key]).toISOString());
            }
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingBanner 
        ? `${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners/${editingBanner._id}`
        : `${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners`;

      const response = await fetch(url, {
        method: editingBanner ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        setOpenDialog(false);
        resetForm();
        fetchBanners();
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save banner');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      linkType: banner.linkType || 'none',
      linkId: banner.linkId || '',
      order: banner.order || 0,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
      targetAudience: banner.targetAudience || 'all'
    });
    setImagePreview(banner.image ? `${process.env.REACT_APP_API_BASE_URL?.replace('/api.php', '') || 'https://alcohol.gnritservices.com'}${banner.image}` : '');
    setOpenDialog(true);
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchBanners();
        setError('');
      } else {
        throw new Error('Failed to delete banner');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchBanners();
        setError('');
      } else {
        throw new Error('Failed to toggle banner status');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (banner) => {
    if (!banner.isActive) return 'error';
    if (banner.endDate && new Date(banner.endDate) < new Date()) return 'warning';
    return 'success';
  };

  const getStatusText = (banner) => {
    if (!banner.isActive) return 'Inactive';
    if (banner.endDate && new Date(banner.endDate) < new Date()) return 'Expired';
    return 'Active';
  };

  // Filter banners based on search term and status
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && banner.isActive) ||
                         (statusFilter === 'inactive' && !banner.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Banner Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                const token = localStorage.getItem('admin_token');
                const user = localStorage.getItem('admin_user');
                console.log('Auth check - Token exists:', !!token);
                console.log('Auth check - User exists:', !!user);
                console.log('Auth check - User data:', user);
                console.log('Testing backend connection...');
                fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/banners`)
                  .then(res => console.log('Backend response:', res.status))
                  .catch(err => console.error('Backend error:', err));
              }}
            >
              Test Auth & Backend
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add New Banner
            </Button>
          </Box>
        </Box>

        {/* Analytics Cards */}
        {analytics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Banners
                  </Typography>
                  <Typography variant="h4">
                    {analytics.totalBanners}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Banners
                  </Typography>
                  <Typography variant="h4">
                    {analytics.activeBanners}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Clicks
                  </Typography>
                  <Typography variant="h4">
                    {analytics.totalClicks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Impressions
                  </Typography>
                  <Typography variant="h4">
                    {analytics.totalImpressions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchBanners}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Banners Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Target Audience</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Impressions</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No banners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      {banner.image && (
                        <img
                          src={`${process.env.REACT_APP_API_BASE_URL?.replace('/api.php', '') || 'https://alcohol.gnritservices.com'}${banner.image}`}
                          alt={banner.title}
                          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{banner.title}</Typography>
                      {banner.description && (
                        <Typography variant="caption" color="textSecondary">
                          {banner.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(banner)}
                        color={getStatusColor(banner)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <Chip
                        label={targetAudiences.find(t => t.value === banner.targetAudience)?.label || 'All'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{banner.clicks || 0}</TableCell>
                    <TableCell>{banner.impressions || 0}</TableCell>
                    <TableCell>
                      {new Date(banner.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                      >
                        {banner.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(banner)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(banner._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingBanner ? 'Edit Banner' : 'Add New Banner'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Link Type</InputLabel>
                    <Select
                      value={formData.linkType}
                      label="Link Type"
                      onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                    >
                      {linkTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Link URL"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    disabled={formData.linkType === 'none'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                      value={formData.targetAudience}
                      label="Target Audience"
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      {targetAudiences.map((audience) => (
                        <MenuItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="banner-image"
                  />
                  <label htmlFor="banner-image">
                    <Button variant="outlined" component="span">
                      Upload Image
                    </Button>
                  </label>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: 200, maxHeight: 150, objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : (editingBanner ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
  );
};

export default BannerManagement;
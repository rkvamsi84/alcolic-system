import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch,
  IconButton,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Image, Add, Edit, Delete, History, UploadFile, Search } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';
import { useAuth } from '../auth/AuthContext';

const STATUS_COLORS = { Active: 'success', Inactive: 'default', Scheduled: 'warning' };

function BannerManagement() {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [openLog, setOpenLog] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      
              const response = await fetch('https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/banners?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await response.json();
      setBanners(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
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
    setEditBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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

      const url = editBanner 
        ? `https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/banners/${editBanner._id}?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`
        : 'https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/banners?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';

      const response = await fetch(url, {
        method: editBanner ? 'PUT' : 'POST',
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
    setEditBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      link: banner.link || '',
      linkType: banner.linkType || 'none',
      linkId: banner.linkId || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      targetAudience: banner.targetAudience || 'all'
    });
            setImagePreview(banner.image ? `https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app${banner.image}?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb` : '');
    setOpenDialog(true);
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/banners/${bannerId}?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchBanners();
      } else {
        throw new Error('Failed to delete banner');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`https://nextjs-backend-ge4ituwno-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/banners/${bannerId}?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        fetchBanners();
      } else {
        throw new Error('Failed to update banner status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banner = null) => {
    if (banner) {
      handleEdit(banner);
    } else {
      resetForm();
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const filteredBanners = banners.filter((banner) =>
    (!search || banner.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || (filterStatus === 'Active' ? banner.isActive : !banner.isActive))
  );

  const getStatusText = (banner) => {
    if (!banner.isActive) return 'Inactive';
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return 'Scheduled';
    if (banner.endDate && new Date(banner.endDate) < now) return 'Expired';
    return 'Active';
  };

  const getStatusColor = (banner) => {
    const status = getStatusText(banner);
    return STATUS_COLORS[status] || 'default';
  };

  if (loading && banners.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Image sx={{ mr: 1 }} />Banner Management</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField 
          label="Search title" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add Banner
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          disabled={selected.length === 0 || loading}
          onClick={() => handleBulkAction('activate')}
        >
          Activate
        </Button>
        <Button 
          variant="outlined" 
          color="warning" 
          disabled={selected.length === 0 || loading}
          onClick={() => handleBulkAction('deactivate')}
        >
          Deactivate
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          disabled={selected.length === 0 || loading}
          onClick={() => handleBulkAction('delete')}
        >
          Delete
        </Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>
          Regulatory Logs
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === filteredBanners.length && filteredBanners.length > 0}
                  indeterminate={selected.length > 0 && selected.length < filteredBanners.length}
                  onChange={(e) => {
                    setSelected(e.target.checked ? filteredBanners.map(b => b._id) : []);
                  }}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBanners.map((banner) => (
              <TableRow key={banner._id} selected={selected.includes(banner._id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(banner._id)}
                    onChange={(e) => {
                      setSelected(e.target.checked
                        ? [...selected, banner._id]
                        : selected.filter(id => id !== banner._id));
                    }}
                  />
                </TableCell>
                <TableCell>{banner.title}</TableCell>
                <TableCell>
                  {banner.image && (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://alcolic-backend.onrender.com'}${banner.image}`} 
                      alt={banner.title} 
                      style={{ width: 60, height: 32, objectFit: 'cover', borderRadius: 4 }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{banner.link || '-'}</TableCell>
                <TableCell>
                  <Switch 
                    checked={banner.isActive} 
                    onChange={() => handleToggleStatus(banner._id, banner.isActive)} 
                    color="success" 
                    disabled={loading}
                  />
                  <Chip 
                    label={getStatusText(banner)} 
                    color={getStatusColor(banner)} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </TableCell>
                <TableCell>{banner.order}</TableCell>
                <TableCell>
                  {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(banner)}
                    disabled={loading}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDelete(banner._id)}
                    disabled={loading}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredBanners.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center" color="text.secondary">
                    No banners found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Banner Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              <TextField 
                label="Title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                fullWidth 
                size="small"
                required
              />
              
              <TextField 
                label="Description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                fullWidth 
                size="small"
                multiline
                rows={3}
              />

              <Box>
                <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {imagePreview && (
                  <Box mt={2}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} 
                    />
                  </Box>
                )}
              </Box>

              <TextField 
                label="Link" 
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                fullWidth 
                size="small"
                placeholder="https://example.com"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Link Type</InputLabel>
                <Select
                  value={formData.linkType}
                  label="Link Type"
                  onChange={(e) => setFormData({...formData, linkType: e.target.value})}
                >
                  {linkTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField 
                label="Order" 
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                fullWidth 
                size="small" 
                type="number"
              />

              <Stack direction="row" spacing={2}>
                <TextField 
                  label="Start Date" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }}
                />
                <TextField 
                  label="End Date" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <FormControl fullWidth size="small">
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  label="Target Audience"
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                >
                  {targetAudiences.map((audience) => (
                    <MenuItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Banners" />
    </Box>
  );
}

export default BannerManagement;

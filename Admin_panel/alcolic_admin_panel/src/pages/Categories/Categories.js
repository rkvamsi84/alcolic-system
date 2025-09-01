import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Alert, Snackbar, useTheme } from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  Search,
  LocalDrink,
  WineBar,
  SportsBar,
  Liquor,
  LocalBar,
  Restaurant,
  Celebration,
  LocalCafe,
  LocalPizza,
  LocalDining,
} from "@mui/icons-material";

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

const getCategoryImageUrl = (cat) => {
  if (cat.image) {
    const baseUrl = API_BASE.replace(/\/api\/v1$/, '');
    return `${baseUrl}${cat.image}`.replace(/([^:]\/)\/+/, '$1/');
  }
  return '/assets/placeholder.png';
};

export default function Categories() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("Main");
  const [catStatus, setCatStatus] = useState("Active");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState("local_drink");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Icon options for alcoholic beverage categories
  const iconOptions = [
    { value: "local_drink", label: "General Drink", icon: <LocalDrink /> },
    { value: "wine_bar", label: "Wine", icon: <WineBar /> },
    { value: "sports_bar", label: "Beer", icon: <SportsBar /> },
    { value: "liquor", label: "Whiskey/Spirits", icon: <Liquor /> },
    { value: "local_bar", label: "Vodka/Gin/Rum", icon: <LocalBar /> },
    { value: "celebration", label: "Champagne/Sparkling", icon: <Celebration /> },
    { value: "local_cafe", label: "Cocktails", icon: <LocalCafe /> },
    { value: "restaurant", label: "Restaurant", icon: <Restaurant /> },
    { value: "local_dining", label: "Food/Snacks", icon: <LocalDining /> },
    { value: "local_pizza", label: "Pizza/Fast Food", icon: <LocalPizza /> },
  ];

  // Icon mapping function
  const getCategoryIcon = (iconName) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : <LocalDrink />;
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => {
    return (
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Open Add dialog
  const handleAdd = () => {
    setEditMode(false);
    setEditCategory(null);
    setCatName("");
    setCatType("Main");
    setCatStatus("Active");
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedIcon("local_drink");
    setDialogOpen(true);
  };

  // Open Edit dialog
  const handleEdit = (cat) => {
    setEditMode(true);
    setEditCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type || "Main");
    setCatStatus(cat.isActive ? "Active" : "Inactive");
    setSelectedImage(null);
    setPreviewUrl(cat.image ? getCategoryImageUrl(cat) : null);
    setSelectedIcon(cat.icon || "local_drink");
    setDialogOpen(true);
  };

  // Save (add or edit) category via backend
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('type', catType);
      formData.append('isActive', catStatus === 'Active');
      formData.append('icon', selectedIcon);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      let url = `${API_BASE}/products/categories`;
      let method = 'POST';
      if (editMode && editCategory) {
        url = `${API_BASE}/products/categories/${editCategory._id || editCategory.id}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        fetchCategories();
        setDialogOpen(false);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (err) {
      setError('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Delete category via backend
  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/products/categories/${cat._id || cat.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Close dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd} color="primary">Add Category</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField fullWidth label="Search Categories" variant="outlined" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 220 }} />
      </Paper>
      <Grid container spacing={3}>
        {filteredCategories.map(cat => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id || cat.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative' }}>
              <Box sx={{ 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: theme.palette.grey[50],
                borderRadius: '12px 12px 0 0',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ fontSize: 48, color: theme.palette.primary.main }}>
                  {getCategoryIcon(cat.icon)}
                </Box>
              </Box>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                <Typography variant="body2" color="text.secondary">{cat.type || 'Main'}</Typography>
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  <Chip label={cat.isActive ? 'Active' : 'Inactive'} color={cat.isActive ? 'success' : 'default'} size="small" />
                </Box>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(cat)}>Edit</Button>
                <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(cat)}>Delete</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            variant="outlined"
            sx={{ mt: 2, mb: 2 }}
            value={catName}
            onChange={e => setCatName(e.target.value)}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select value={catType} label="Type" onChange={e => setCatType(e.target.value)}>
              <MenuItem value="Main">Main</MenuItem>
              <MenuItem value="Sub">Sub</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={catStatus} label="Status" onChange={e => setCatStatus(e.target.value)}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category Icon</InputLabel>
            <Select value={selectedIcon} label="Category Icon" onChange={e => setSelectedIcon(e.target.value)}>
              {iconOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.icon}
                    <span>{option.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 1 }}
          >
            {selectedImage ? selectedImage.name : "Upload Category Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                const file = e.target.files[0];
                setSelectedImage(file);
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </Button>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: 120, marginTop: 8 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{editMode ? "Save Changes" : "Add Category"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Switch
} from '@mui/material';
import { 
  Map, 
  Category, 
  Add, 
  Edit, 
  Delete, 
  History, 
  LocationOn,
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
} from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';
import ZoneMapManager from '../components/ZoneMapManager';

const mockZones = [
  { id: 1, name: 'Downtown', type: 'Delivery', status: true, stores: 5 },
  { id: 2, name: 'Uptown', type: 'Pickup', status: false, stores: 2 },
];
const mockCategories = [
  { id: 1, name: 'Beer', parent: '', status: true, products: 120 },
  { id: 2, name: 'Wine', parent: '', status: true, products: 80 },
  { id: 3, name: 'Craft Beer', parent: 'Beer', status: false, products: 20 },
];

function ZoneCategoryManagement() {
  const [tab, setTab] = useState(0);
  const [zones, setZones] = useState(mockZones);
  const [categories, setCategories] = useState(mockCategories);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openLog, setOpenLog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null);
  const [categoryPreviewUrl, setCategoryPreviewUrl] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState('local_drink');

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

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    setOpenDialog(true);
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedCategoryImage(null);
    setCategoryPreviewUrl(null);
    setSelectedIcon(item?.icon || 'local_drink');
  };
  const handleCloseDialog = () => {
    setEditItem(null);
    setOpenDialog(false);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedCategoryImage(file);
    if (file) {
      setCategoryPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    const name = document.querySelector(`#${tab === 0 ? 'zone-name-input' : 'category-name-input'}`)?.value || '';
    const parent = document.querySelector(`#${tab === 0 ? '' : 'category-parent-input'}`)?.value || '';
    const formData = new FormData();
    formData.append('name', name);
    formData.append('parent', parent);
    if (tab === 1) { // Categories tab
      formData.append('icon', selectedIcon);
    }
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    if (selectedCategoryImage) {
      formData.append('image', selectedCategoryImage);
    }
    // TODO: Replace with actual API call
    // await fetch('/api/categories', { method: editItem ? 'PUT' : 'POST', body: formData });
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    if (tab === 0) setZones(zones.filter((z) => z.id !== id));
    else setCategories(categories.filter((c) => c.id !== id));
  };
  const handleStatusToggle = (id) => {
    if (tab === 0) setZones(zones.map((z) => z.id === id ? { ...z, status: !z.status } : z));
    else setCategories(categories.map((c) => c.id === id ? { ...c, status: !c.status } : c));
  };
  const handleBulkAction = (action) => {
    if (tab === 0) {
      if (action === 'activate') setZones(zones.map((z) => selected.includes(z.id) ? { ...z, status: true } : z));
      else if (action === 'deactivate') setZones(zones.map((z) => selected.includes(z.id) ? { ...z, status: false } : z));
      else if (action === 'delete') setZones(zones.filter((z) => !selected.includes(z.id)));
    } else {
      if (action === 'activate') setCategories(categories.map((c) => selected.includes(c.id) ? { ...c, status: true } : c));
      else if (action === 'deactivate') setCategories(categories.map((c) => selected.includes(c.id) ? { ...c, status: false } : c));
      else if (action === 'delete') setCategories(categories.filter((c) => !selected.includes(c.id)));
    }
    setSelected([]);
  };

  const filteredZones = zones.filter((z) => !search || z.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCategories = categories.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Map sx={{ mr: 1 }} />Zone & Category Management</Typography>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setSelected([]); }} sx={{ mb: 2 }}>
        <Tab label="Zones" icon={<Map />} iconPosition="start" />
        <Tab label="Map Zones" icon={<LocationOn />} iconPosition="start" />
        <Tab label="Categories" icon={<Category />} iconPosition="start" />
      </Tabs>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search name" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add {tab === 0 ? 'Zone' : 'Category'}</Button>
        <Button variant="outlined" color="primary" disabled={selected.length === 0} onClick={() => handleBulkAction('activate')}>Activate</Button>
        <Button variant="outlined" color="warning" disabled={selected.length === 0} onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      {tab === 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Stores</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredZones.map((zone) => (
                <TableRow key={zone.id} selected={selected.includes(zone.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(zone.id)}
                      onChange={e => {
                        setSelected(e.target.checked
                          ? [...selected, zone.id]
                          : selected.filter(id => id !== zone.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>{zone.type}</TableCell>
                  <TableCell>
                    <Switch checked={zone.status} onChange={() => handleStatusToggle(zone.id)} color="success" />
                  </TableCell>
                  <TableCell>{zone.stores}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleOpenDialog(zone)}><Edit fontSize="small" /></Button>
                    <Button size="small" color="error" onClick={() => handleDelete(zone.id)}><Delete fontSize="small" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredZones.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography align="center">No zones found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : tab === 1 ? (
        <ZoneMapManager />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.id} selected={selected.includes(cat.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(cat.id)}
                      onChange={e => {
                        setSelected(e.target.checked
                          ? [...selected, cat.id]
                          : selected.filter(id => id !== cat.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.parent}</TableCell>
                  <TableCell>
                    <Switch checked={cat.status} onChange={() => handleStatusToggle(cat.id)} color="success" />
                  </TableCell>
                  <TableCell>{cat.products}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleOpenDialog(cat)}><Edit fontSize="small" /></Button>
                    <Button size="small" color="error" onClick={() => handleDelete(cat.id)}><Delete fontSize="small" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow><TableCell colSpan={6}><Typography align="center">No categories found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? `Edit ${tab === 0 ? 'Zone' : 'Category'}` : `Add ${tab === 0 ? 'Zone' : 'Category'}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField id={tab === 0 ? 'zone-name-input' : 'category-name-input'} label="Name" defaultValue={editItem?.name || ''} fullWidth size="small" />
            {tab === 0 ? (
              <TextField label="Type" defaultValue={editItem?.type || ''} fullWidth size="small" />
            ) : (
              <>
                <TextField id="category-parent-input" label="Parent" defaultValue={editItem?.parent || ''} fullWidth size="small" />
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Category Icon</InputLabel>
                  <Select 
                    value={selectedIcon} 
                    label="Category Icon" 
                    onChange={(e) => setSelectedIcon(e.target.value)}
                  >
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
                  {selectedCategoryImage ? selectedCategoryImage.name : "Upload Category Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleCategoryImageChange}
                  />
                </Button>
                {categoryPreviewUrl && (
                  <img src={categoryPreviewUrl} alt="Preview" style={{ maxWidth: 100, marginTop: 8 }} />
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module={tab === 0 ? 'Zones' : 'Categories'} />
    </Box>
  );
}

export default ZoneCategoryManagement;

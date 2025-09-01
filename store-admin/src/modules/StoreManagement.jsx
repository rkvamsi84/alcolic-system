import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack, Alert, Snackbar, InputAdornment } from '@mui/material';
import RegulatoryLogModal, { addRegulatoryLog } from '../components/Product/RegulatoryLogModal';

const mockStores = [
  { id: 1, name: 'Liquor Mart', logo: '', licenseStatus: 'Active', licenseExpiry: '2026-01-01', zone: 'North', category: 'Wine', alert: false },
  { id: 2, name: 'Bourbon House', logo: '', licenseStatus: 'Expired', licenseExpiry: '2024-12-31', zone: 'South', category: 'Whiskey', alert: true },
  { id: 3, name: 'Sunset Spirits', logo: '', licenseStatus: 'Expiring Soon', licenseExpiry: '2025-07-01', zone: 'East', category: 'Beer', alert: true },
];
const zones = ['North', 'South', 'East', 'West'];
const categories = ['Wine', 'Whiskey', 'Beer', 'Vodka', 'Rum'];

const StoreManagement = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [logOpen, setLogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [licensePreview, setLicensePreview] = useState('');

  const handleEdit = (store) => {
    setSelectedStore(store);
    setLogoPreview(store.logo);
    setEditOpen(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setSnackbar({ open: true, message: 'Logo uploaded.', severity: 'success' });
    }
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLicensePreview(url);
      setSnackbar({ open: true, message: 'License uploaded.', severity: 'success' });
      addRegulatoryLog({
        time: new Date().toLocaleString(),
        action: 'License Upload',
        details: `Store: ${selectedStore?.name}`
      });
    }
  };

  const handleSave = () => {
    setEditOpen(false);
    setSnackbar({ open: true, message: 'Store updated.', severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Store Edit',
      details: `Store: ${selectedStore?.name}`
    });
  };

  const handleMapPick = () => {
    setMapOpen(false);
    setSnackbar({ open: true, message: 'Zone assigned (mock).', severity: 'info' });
  };

  const filteredStores = mockStores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.zone.toLowerCase().includes(search.toLowerCase()) ||
    s.licenseStatus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Store Management</Typography>
      <Paper sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, zone, or status"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <Button onClick={() => setLogOpen(true)} color="secondary">View Regulatory Logs</Button>
      </Paper>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>License Status</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStores.map(store => (
              <TableRow key={store.id} sx={store.licenseStatus === 'Expiring Soon' ? { bgcolor: 'warning.light' } : {}}>
                <TableCell><Avatar src={store.logo || logoPreview} alt={store.name} /></TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>
                  <Chip label={store.licenseStatus} color={store.licenseStatus === 'Active' ? 'success' : store.licenseStatus === 'Expiring Soon' ? 'warning' : 'error'} />
                  {store.alert && <Button size="small" color="warning" onClick={() => setAlertOpen(true)}>Alert</Button>}
                </TableCell>
                <TableCell>{store.licenseExpiry}</TableCell>
                <TableCell>{store.zone}</TableCell>
                <TableCell>{store.category}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(store)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Store</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Stack spacing={2} mt={2}>
              <TextField label="Name" value={selectedStore.name} fullWidth disabled />
              <TextField select label="Zone" value={selectedStore.zone} fullWidth>
                {zones.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
              </TextField>
              <Button variant="outlined" onClick={() => setMapOpen(true)}>Pick Zone on Map</Button>
              <TextField select label="Category" value={selectedStore.category} fullWidth>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField label="License Expiry" value={selectedStore.licenseExpiry} fullWidth type="date" InputLabelProps={{ shrink: true }} />
              <Button variant="outlined" component="label">Upload License<input type="file" hidden onChange={handleLicenseUpload} /></Button>
              {licensePreview && <img src={licensePreview} alt="license" width={80} style={{ marginTop: 8 }} />}
              <Button variant="outlined" component="label">Upload Logo<input type="file" hidden onChange={handleLogoUpload} /></Button>
              {logoPreview && <Avatar src={logoPreview} alt="logo" sx={{ width: 56, height: 56, mt: 1 }} />}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>License Alert</DialogTitle>
        <DialogContent>
          <Alert severity="warning">This store's liquor license is expired or expiring soon. Please update immediately.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)}>
        <DialogTitle>Pick Zone on Map (Mock)</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 300, height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>Map Picker Placeholder</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMapPick}>Assign Zone</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
      <RegulatoryLogModal open={logOpen} onClose={() => setLogOpen(false)} />
    </Box>
  );
};

export default StoreManagement;

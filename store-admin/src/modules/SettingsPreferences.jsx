import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Stack,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Settings, Person, Build, Edit, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';
import { useAuth } from '../auth/AuthContext';

function SettingsPreferences() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [storeProfile, setStoreProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editTab, setEditTab] = useState(0);
  const [openLog, setOpenLog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchStoreProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/store/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch store profile');
        setStoreProfile(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStoreProfile();
  }, [token]);

  const handleOpenDialog = (item, tabIdx) => {
    setEditItem(item);
    setEditTab(tabIdx);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setEditItem(null);
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/store/${storeProfile._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeProfile)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to update store profile');
      setSnackbar({ open: true, message: 'Store profile updated successfully', severity: 'success' });
      setOpenDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!storeProfile) return <Alert severity="info">No store profile found</Alert>;

  const general = [
    { key: 'Store Name', value: storeProfile.name || 'N/A', status: storeProfile.status === 'active' },
    { key: 'Email', value: storeProfile.contactInfo?.email || 'N/A', status: true },
    { key: 'Phone', value: storeProfile.contactInfo?.phone || 'N/A', status: true },
    { key: 'Address', value: `${storeProfile.address?.street}, ${storeProfile.address?.city}` || 'N/A', status: true },
  ];

  const userPrefs = [
    { key: 'Store Status', value: storeProfile.status || 'N/A', status: storeProfile.status === 'active' },
    { key: 'Verified', value: storeProfile.isVerified ? 'Yes' : 'No', status: storeProfile.isVerified },
  ];

  const advanced = [
    { key: 'Delivery Available', value: storeProfile.deliverySettings?.isDeliveryAvailable ? 'Yes' : 'No', status: storeProfile.deliverySettings?.isDeliveryAvailable },
    { key: 'Max Delivery Radius', value: `${storeProfile.deliverySettings?.maxDeliveryRadius || 0} km`, status: true },
    { key: 'Delivery Fee', value: `$${storeProfile.deliverySettings?.deliveryFee || 0}`, status: true },
  ];

  const tabData = [general, userPrefs, advanced];
  const tabIcons = [<Settings />, <Person />, <Build />];
  const tabLabels = ['General', 'Store Info', 'Delivery Settings'];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Settings</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {tabLabels.map((label, idx) => (
          <Tab key={label} label={label} icon={tabIcons[idx]} iconPosition="start" />
        ))}
      </Tabs>
      <Paper sx={{ p: 2, mb: 2 }}>
        <List>
          {tabData[tab].map((item, idx) => (
            <ListItem key={item.key}>
              <ListItemText primary={item.key} secondary={item.value} />
              <ListItemSecondaryAction>
                <Switch checked={item.status} color="success" />
                <Button size="small" onClick={() => handleOpenDialog(item, tab)}><Edit fontSize="small" /></Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      
      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Store Setting</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Key" defaultValue={editItem?.key || ''} fullWidth size="small" disabled />
            <TextField label="Value" defaultValue={editItem?.value || ''} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module={tabLabels[tab]} />
      
      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsPreferences;

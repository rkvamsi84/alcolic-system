import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Paper, 
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import { 
  Save as SaveIcon, 
  Refresh as RefreshIcon, 
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Restore as RestoreIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1';

// Helper to get admin token
const getAdminToken = () => localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [policyDialog, setPolicyDialog] = useState({ open: false, type: '', content: '' });
  const [importDialog, setImportDialog] = useState({ open: false, data: '' });

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSettings(response.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      await axios.put(`${API_BASE_URL}/settings`, settings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to defaults
  const handleResetSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      await axios.post(`${API_BASE_URL}/settings/reset`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchSettings();
      setSuccess('Settings reset to defaults successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err.response?.data?.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  // Export settings
  const handleExportSettings = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/settings/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'settings.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError(err.response?.data?.message || 'Failed to export settings');
    }
  };

  // Import settings
  const handleImportSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const settingsData = JSON.parse(importDialog.data);
      
      await axios.post(`${API_BASE_URL}/settings/import`, {
        settingsData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchSettings();
      setImportDialog({ open: false, data: '' });
      setSuccess('Settings imported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error importing settings:', err);
      setError(err.response?.data?.message || 'Failed to import settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Open policy dialog
  const handlePolicyEdit = (type) => {
    setPolicyDialog({
      open: true,
      type,
      content: settings[type] || ''
    });
  };

  // Save policy content
  const handlePolicySave = () => {
    handleSettingChange(policyDialog.type, policyDialog.content);
    setPolicyDialog({ open: false, type: '', content: '' });
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box>
        <Alert severity="error">Failed to load settings</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          message={success}
        />
      )}

      <Grid container spacing={3}>
        {/* General App Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">General App Settings</Typography>
              </Box>
              <TextField 
                fullWidth 
                label="App Name" 
                value={settings.appName || ''}
                onChange={(e) => handleSettingChange('appName', e.target.value)}
                sx={{ mb: 2 }} 
              />
              <TextField 
                fullWidth 
                label="Default Currency" 
                value={settings.defaultCurrency || ''}
                onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                sx={{ mb: 2 }} 
              />
              <TextField 
                fullWidth 
                label="Time Zone" 
                value={settings.timeZone || ''}
                onChange={(e) => handleSettingChange('timeZone', e.target.value)}
                sx={{ mb: 2 }} 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableScheduledDelivery || false}
                    onChange={(e) => handleSettingChange('enableScheduledDelivery', e.target.checked)}
                  />
                } 
                label="Enable Scheduled Delivery" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableExpressDelivery || false}
                    onChange={(e) => handleSettingChange('enableExpressDelivery', e.target.checked)}
                  />
                } 
                label="Enable Express Delivery" 
              />
            </CardContent>
          </Card>

          {/* Authentication & Security */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Authentication & Security</Typography>
              </Box>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enable2FA || false}
                    onChange={(e) => handleSettingChange('enable2FA', e.target.checked)}
                  />
                } 
                label="Enable 2FA" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableOTPVerification || false}
                    onChange={(e) => handleSettingChange('enableOTPVerification', e.target.checked)}
                  />
                } 
                label="OTP/ID Verification" 
              />
              <TextField 
                fullWidth 
                label="Min Password Length" 
                type="number"
                value={settings.minPasswordLength || 8}
                onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                sx={{ mb: 2, mt: 2 }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Gateway Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Payment Gateway Settings</Typography>
              </Box>
              <TextField 
                fullWidth 
                label="Stripe API Key" 
                value={settings.stripeApiKey || ''}
                onChange={(e) => handleSettingChange('stripeApiKey', e.target.value)}
                sx={{ mb: 2 }} 
              />
              <TextField 
                fullWidth 
                label="PayPal API Key" 
                value={settings.paypalApiKey || ''}
                onChange={(e) => handleSettingChange('paypalApiKey', e.target.value)}
                sx={{ mb: 2 }} 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableCardPayments || false}
                    onChange={(e) => handleSettingChange('enableCardPayments', e.target.checked)}
                  />
                } 
                label="Enable Card Payments" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enablePayPal || false}
                    onChange={(e) => handleSettingChange('enablePayPal', e.target.checked)}
                  />
                } 
                label="Enable PayPal" 
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enablePushNotifications || false}
                    onChange={(e) => handleSettingChange('enablePushNotifications', e.target.checked)}
                  />
                } 
                label="Enable Push Notifications" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableEmailAlerts || false}
                    onChange={(e) => handleSettingChange('enableEmailAlerts', e.target.checked)}
                  />
                } 
                label="Enable Email Alerts" 
              />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={settings.enableSMSAlerts || false}
                    onChange={(e) => handleSettingChange('enableSMSAlerts', e.target.checked)}
                  />
                } 
                label="Enable SMS Alerts" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      
      {/* Legal & Policy Pages */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Legal & Policy Pages</Typography>
        </Box>
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }} 
          onClick={() => handlePolicyEdit('privacyPolicy')}
        >
          Edit Privacy Policy
        </Button>
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }} 
          onClick={() => handlePolicyEdit('termsOfService')}
        >
          Edit Terms of Service
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => handlePolicyEdit('returnPolicy')}
        >
          Edit Return Policy
        </Button>
      </Paper>

      {/* System Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>System Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Max Order Value" 
              type="number"
              value={settings.maxOrderValue || 1000}
              onChange={(e) => handleSettingChange('maxOrderValue', parseFloat(e.target.value))}
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth 
              label="Min Order Value" 
              type="number"
              value={settings.minOrderValue || 10}
              onChange={(e) => handleSettingChange('minOrderValue', parseFloat(e.target.value))}
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth 
              label="Delivery Radius (km)" 
              type="number"
              value={settings.deliveryRadius || 50}
              onChange={(e) => handleSettingChange('deliveryRadius', parseFloat(e.target.value))}
              sx={{ mb: 2 }} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.maintenanceMode || false}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                />
              } 
              label="Maintenance Mode" 
            />
            <TextField 
              fullWidth 
              label="Maintenance Message" 
              multiline
              rows={3}
              value={settings.maintenanceMessage || ''}
              onChange={(e) => handleSettingChange('maintenanceMessage', e.target.value)}
              sx={{ mb: 2, mt: 2 }} 
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.autoAcceptOrders || false}
                  onChange={(e) => handleSettingChange('autoAcceptOrders', e.target.checked)}
                />
              } 
              label="Auto Accept Orders" 
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.requireCustomerVerification || false}
                  onChange={(e) => handleSettingChange('requireCustomerVerification', e.target.checked)}
                />
              } 
              label="Require Customer Verification" 
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Import/Export Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Backup & Restore</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleExportSettings}
          >
            Export Settings
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            onClick={() => setImportDialog({ open: true, data: '' })}
          >
            Import Settings
          </Button>
          <Button 
            variant="outlined" 
            color="warning"
            startIcon={<RestoreIcon />}
            onClick={handleResetSettings}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Paper>

      {/* Policy Edit Dialog */}
      <Dialog 
        open={policyDialog.open} 
        onClose={() => setPolicyDialog({ open: false, type: '', content: '' })}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Edit {policyDialog.type?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          <IconButton
            aria-label="close"
            onClick={() => setPolicyDialog({ open: false, type: '', content: '' })}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={policyDialog.content}
            onChange={(e) => setPolicyDialog(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialog({ open: false, type: '', content: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handlePolicySave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={importDialog.open} 
        onClose={() => setImportDialog({ open: false, data: '' })}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Import Settings
          <IconButton
            aria-label="close"
            onClick={() => setImportDialog({ open: false, data: '' })}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Paste your settings JSON data below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={importDialog.data}
            onChange={(e) => setImportDialog(prev => ({ ...prev, data: e.target.value }))}
            placeholder="Paste JSON settings data here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog({ open: false, data: '' })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleImportSettings}
            disabled={saving || !importDialog.data}
          >
            {saving ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
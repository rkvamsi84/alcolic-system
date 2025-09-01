import React, { useState } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Card,
  Divider,
  FormControlLabel
} from '@mui/material';
import { VpnKey, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockApiKeys = [
  { id: 1, name: 'Go-UPC', type: 'Product Import', key: '****1234', status: true, lastUsed: '2025-06-17' },
  { id: 2, name: 'Stripe', type: 'Payment', key: '****5678', status: false, lastUsed: '2025-06-10' },
];

const INTEGRATION_TYPES = ['Product Import', 'Payment', 'Shipping', 'Analytics'];

const ApiKeysIntegrationsManagement = () => {
  const [apiKey, setApiKey] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleSave = () => {
    // Save API key and push settings (mock)
    alert('Settings saved!');
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Flutter Mobile App Integration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          API Key for Mobile App
        </Typography>
        <TextField
          fullWidth
          label="API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Switch checked={pushEnabled} onChange={e => setPushEnabled(e.target.checked)} />}
          label="Enable Push Notifications"
        />
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
          Save Settings
        </Button>
      </Card>
    </Box>
  );
};

export default ApiKeysIntegrationsManagement;

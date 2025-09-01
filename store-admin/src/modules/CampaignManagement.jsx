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
  Switch
} from '@mui/material';
import { Campaign, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockCampaigns = [
  {
    id: 1,
    name: 'July 4th Promo',
    type: 'Email',
    status: 'Active',
    audience: 'All Customers',
    startDate: '2025-07-01',
    endDate: '2025-07-05',
    createdBy: 'Admin',
  },
  {
    id: 2,
    name: 'VIP SMS Blast',
    type: 'SMS',
    status: 'Scheduled',
    audience: 'VIP Customers',
    startDate: '2025-07-10',
    endDate: '2025-07-12',
    createdBy: 'Manager',
  },
];

const CAMPAIGN_TYPES = ['Email', 'SMS', 'Push'];
const STATUS_COLORS = { Active: 'success', Inactive: 'default', Scheduled: 'warning' };

function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredCampaigns = campaigns.filter((c) =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || c.type === filterType) &&
    (!filterStatus || c.status === filterStatus)
  );

  const handleOpenDialog = (campaign = null) => {
    setEditCampaign(campaign);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditCampaign(null);
    setOpenDialog(false);
  };
  const handleSaveCampaign = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
  };
  const handleStatusToggle = (id) => {
    setCampaigns(campaigns.map((c) => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setCampaigns(campaigns.map((c) => selected.includes(c.id) ? { ...c, status: 'Active' } : c));
    } else if (action === 'deactivate') {
      setCampaigns(campaigns.map((c) => selected.includes(c.id) ? { ...c, status: 'Inactive' } : c));
    } else if (action === 'delete') {
      setCampaigns(campaigns.filter((c) => !selected.includes(c.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Campaign sx={{ mr: 1 }} />Campaign Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {CAMPAIGN_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Campaign</Button>
        <Button
          variant="outlined"
          color="primary"
          disabled={selected.length === 0}
          onClick={() => handleBulkAction('activate')}
        >Activate</Button>
        <Button
          variant="outlined"
          color="warning"
          disabled={selected.length === 0}
          onClick={() => handleBulkAction('deactivate')}
        >Deactivate</Button>
        <Button
          variant="outlined"
          color="error"
          disabled={selected.length === 0}
          onClick={() => handleBulkAction('delete')}
        >Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id} selected={selected.includes(campaign.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(campaign.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, campaign.id]
                        : selected.filter(id => id !== campaign.id));
                    }}
                  />
                </TableCell>
                <TableCell>{campaign.name}</TableCell>
                <TableCell><Chip label={campaign.type} size="small" /></TableCell>
                <TableCell>
                  <Switch
                    checked={campaign.status === 'Active'}
                    onChange={() => handleStatusToggle(campaign.id)}
                    color="success"
                  />
                  <Chip label={campaign.status} color={STATUS_COLORS[campaign.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell>{campaign.audience}</TableCell>
                <TableCell>{campaign.startDate}</TableCell>
                <TableCell>{campaign.endDate}</TableCell>
                <TableCell>{campaign.createdBy}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(campaign)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(campaign.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCampaigns.length === 0 && (
              <TableRow><TableCell colSpan={9}><Typography align="center">No campaigns found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Campaign Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editCampaign ? 'Edit Campaign' : 'Add Campaign'}</DialogTitle>
        <DialogContent>
          {/* Form fields (mock) */}
          <Stack spacing={2} mt={1}>
            <TextField label="Name" defaultValue={editCampaign?.name || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editCampaign?.type || ''} label="Type">
                {CAMPAIGN_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Audience" defaultValue={editCampaign?.audience || ''} fullWidth size="small" />
            <TextField label="Start Date" type="date" defaultValue={editCampaign?.startDate || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" defaultValue={editCampaign?.endDate || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCampaign} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Campaigns" />
    </Box>
  );
}

export default CampaignManagement;

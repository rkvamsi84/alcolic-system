import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack
} from '@mui/material';
import { Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

// TODO: Replace with API calls to fetch real promotions data
// const fetchPromotions = async () => {
//   const response = await fetch('/api/v1/promotions');
//   return response.json();
// };

const mockPromotions = [];

const PROMO_TYPES = ['Discount Code', 'Automatic', 'BOGO', 'Free Shipping'];

function PromotionsManagement() {
  const [promotions, setPromotions] = useState(mockPromotions);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const handleOpenDialog = (promo = null) => {
    setEditPromo(promo);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditPromo(null);
    setOpenDialog(false);
  };
  const handleSavePromo = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setPromotions(promotions.filter((p) => p.id !== id));
  };
  const handleStatusToggle = (id) => {
    setPromotions(promotions.map((p) => p.id === id ? { ...p, status: !p.status } : p));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setPromotions(promotions.map((p) => selected.includes(p.id) ? { ...p, status: true } : p));
    } else if (action === 'deactivate') {
      setPromotions(promotions.map((p) => selected.includes(p.id) ? { ...p, status: false } : p));
    } else if (action === 'delete') {
      setPromotions(promotions.filter((p) => !selected.includes(p.id)));
    }
    setSelected([]);
  };
  const filteredPromos = promotions.filter((p) =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || p.type === filterType) &&
    (!filterStatus || (filterStatus === 'active' ? p.status : !p.status))
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Promotions Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {PROMO_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Promotion</Button>
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
              <TableCell>Validity</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPromos.map((promo) => (
              <TableRow key={promo.id} selected={selected.includes(promo.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(promo.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, promo.id]
                        : selected.filter(id => id !== promo.id));
                    }}
                  />
                </TableCell>
                <TableCell>{promo.name}</TableCell>
                <TableCell><Chip label={promo.type} size="small" /></TableCell>
                <TableCell>
                  <Switch
                    checked={promo.status}
                    onChange={() => handleStatusToggle(promo.id)}
                    color="success"
                  />
                </TableCell>
                <TableCell>{promo.validFrom} - {promo.validTo}</TableCell>
                <TableCell>{promo.usage}</TableCell>
                <TableCell>{promo.code}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>{promo.createdBy}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton onClick={() => handleOpenDialog(promo)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(promo.id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPromos.length === 0 && (
              <TableRow><TableCell colSpan={10}><Typography align="center">No promotions found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Promotion Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editPromo ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle>
        <DialogContent>
          {/* Form fields (mock) */}
          <Stack spacing={2} mt={1}>
            <TextField label="Name" defaultValue={editPromo?.name || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editPromo?.type || ''} label="Type">
                {PROMO_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Discount" defaultValue={editPromo?.discount || ''} fullWidth size="small" />
            <TextField label="Code" defaultValue={editPromo?.code || ''} fullWidth size="small" />
            <TextField label="Valid From" type="date" defaultValue={editPromo?.validFrom || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Valid To" type="date" defaultValue={editPromo?.validTo || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePromo} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Promotions" />
    </Box>
  );
}

export default PromotionsManagement;

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
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Gavel, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockLegalDocs = [
  { id: 1, title: 'Terms of Service', type: 'Terms', status: 'Active', lastUpdated: '2025-06-01' },
  { id: 2, title: 'Privacy Policy', type: 'Privacy', status: 'Inactive', lastUpdated: '2025-05-15' },
];

const DOC_TYPES = ['Terms', 'Privacy', 'Compliance', 'Other'];
const STATUS_COLORS = { Active: 'success', Inactive: 'default' };

function LegalPolicyManagement() {
  const [docs, setDocs] = useState(mockLegalDocs);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredDocs = docs.filter((d) =>
    (!search || d.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || d.type === filterType) &&
    (!filterStatus || d.status === filterStatus)
  );

  const handleOpenDialog = (doc = null) => {
    setEditDoc(doc);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditDoc(null);
    setOpenDialog(false);
  };
  const handleSaveDoc = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setDocs(docs.filter((d) => d.id !== id));
  };
  const handleStatusToggle = (id) => {
    setDocs(docs.map((d) => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setDocs(docs.map((d) => selected.includes(d.id) ? { ...d, status: 'Active' } : d));
    } else if (action === 'deactivate') {
      setDocs(docs.map((d) => selected.includes(d.id) ? { ...d, status: 'Inactive' } : d));
    } else if (action === 'delete') {
      setDocs(docs.filter((d) => !selected.includes(d.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Gavel sx={{ mr: 1 }} />Legal & Policy Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search title" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {DOC_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Document</Button>
        <Button variant="outlined" color="primary" disabled={selected.length === 0} onClick={() => handleBulkAction('activate')}>Activate</Button>
        <Button variant="outlined" color="warning" disabled={selected.length === 0} onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocs.map((doc) => (
              <TableRow key={doc.id} selected={selected.includes(doc.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(doc.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, doc.id]
                        : selected.filter(id => id !== doc.id));
                    }}
                  />
                </TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>
                  <Switch checked={doc.status === 'Active'} onChange={() => handleStatusToggle(doc.id)} color="success" />
                  <Chip label={doc.status} color={STATUS_COLORS[doc.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell>{doc.lastUpdated}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(doc)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(doc.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredDocs.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography align="center">No legal documents found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Document Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editDoc ? 'Edit Document' : 'Add Document'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" defaultValue={editDoc?.title || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editDoc?.type || ''} label="Type">
                {DOC_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Last Updated" type="date" defaultValue={editDoc?.lastUpdated || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDoc} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Legal & Policy" />
    </Box>
  );
}

export default LegalPolicyManagement;

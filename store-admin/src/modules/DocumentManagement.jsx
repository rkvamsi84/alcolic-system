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
  IconButton
} from '@mui/material';
import { UploadFile, Download, Delete, Visibility } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockDocuments = [
  {
    id: 1,
    name: 'Liquor License.pdf',
    type: 'License',
    related: 'Store #5',
    uploadDate: '2025-06-10',
    status: 'Valid',
    url: '#',
  },
  {
    id: 2,
    name: 'Insurance2025.jpg',
    type: 'Insurance',
    related: 'Store #2',
    uploadDate: '2025-05-20',
    status: 'Expired',
    url: '#',
  },
];

const DOC_TYPES = ['License', 'Insurance', 'Compliance', 'Other'];
const STATUS_COLORS = { Valid: 'success', Expired: 'error', Pending: 'warning' };

function DocumentManagement() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openUpload, setOpenUpload] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredDocs = documents.filter((d) =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || d.type === filterType) &&
    (!filterStatus || d.status === filterStatus)
  );

  const handleOpenPreview = (doc) => {
    setSelectedDoc(doc);
    setOpenPreview(true);
  };
  const handleClosePreview = () => {
    setOpenPreview(false);
    setSelectedDoc(null);
  };
  const handleDelete = (id) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><UploadFile sx={{ mr: 1 }} />Document Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search name" value={search} onChange={e => setSearch(e.target.value)} size="small" />
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
            <MenuItem value="Valid">Valid</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<UploadFile />} onClick={() => setOpenUpload(true)}>Upload Document</Button>
        <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        <Button variant="text" onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Related</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell><Chip label={doc.type} size="small" /></TableCell>
                <TableCell>{doc.related}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
                <TableCell><Chip label={doc.status} color={STATUS_COLORS[doc.status] || 'default'} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenPreview(doc)}><Visibility /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(doc.id)}><Delete /></IconButton>
                  <IconButton><Download /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredDocs.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography align="center">No documents found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Upload Dialog (mock) */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Document Name" fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type">
                {DOC_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Related To (Store, Module, etc.)" fullWidth size="small" />
            <Button variant="outlined" component="label">Select File<input type="file" hidden /></Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenUpload(false)}>Upload</Button>
        </DialogActions>
      </Dialog>
      {/* Preview Dialog (mock) */}
      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>Preview Document</DialogTitle>
        <DialogContent>
          {selectedDoc && (
            <Box>
              <Typography><b>Name:</b> {selectedDoc.name}</Typography>
              <Typography><b>Type:</b> {selectedDoc.type}</Typography>
              <Typography><b>Related:</b> {selectedDoc.related}</Typography>
              <Typography><b>Status:</b> {selectedDoc.status}</Typography>
              <Typography mt={2}>[Document preview here]</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Documents" />
    </Box>
  );
}

export default DocumentManagement;

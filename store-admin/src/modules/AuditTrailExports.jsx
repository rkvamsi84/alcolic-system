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
  InputLabel
} from '@mui/material';
import { Assignment, Download, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockExports = [
  { id: 1, type: 'Order Logs', module: 'Orders', dateRange: '2025-06-01 to 2025-06-15', status: 'Completed', generated: '2025-06-15', format: 'CSV' },
  { id: 2, type: 'Product Changes', module: 'Products', dateRange: '2025-05-01 to 2025-05-31', status: 'Completed', generated: '2025-06-01', format: 'PDF' },
];

const EXPORT_TYPES = ['Order Logs', 'Product Changes', 'Customer Actions', 'Compliance Events'];
const MODULES = ['Orders', 'Products', 'Customers', 'Compliance'];
const FORMATS = ['CSV', 'PDF', 'JSON'];

function AuditTrailExports() {
  const [exports, setExports] = useState(mockExports);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openLog, setOpenLog] = useState(false);

  const filteredExports = exports.filter((e) =>
    (!search || e.type.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || e.type === filterType) &&
    (!filterModule || e.module === filterModule)
  );

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleGenerateExport = () => {
    // Generate logic (mock)
    setOpenDialog(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Assignment sx={{ mr: 1 }} />Audit Trail & Regulatory Exports</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search type" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {EXPORT_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Module</InputLabel>
          <Select value={filterModule} label="Module" onChange={e => setFilterModule(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {MODULES.map(mod => <MenuItem key={mod} value={mod}>{mod}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Download />} onClick={handleOpenDialog}>Generate Export</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Format</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExports.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.type}</TableCell>
                <TableCell>{exp.module}</TableCell>
                <TableCell>{exp.dateRange}</TableCell>
                <TableCell><Chip label={exp.status} color={exp.status === 'Completed' ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>{exp.generated}</TableCell>
                <TableCell>{exp.format}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<Download />}>Download</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredExports.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography align="center">No exports found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Generate Export Dialog (mock) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Audit Trail Export</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type">
                {EXPORT_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Module</InputLabel>
              <Select label="Module">
                {MODULES.map(mod => <MenuItem key={mod} value={mod}>{mod}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date Range" placeholder="YYYY-MM-DD to YYYY-MM-DD" fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Format</InputLabel>
              <Select label="Format">
                {FORMATS.map(fmt => <MenuItem key={fmt} value={fmt}>{fmt}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleGenerateExport} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Audit Trail Exports" />
    </Box>
  );
}

export default AuditTrailExports;

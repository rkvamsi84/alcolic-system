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
import { BugReport, Download, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

// TODO: Replace with API calls to fetch real system logs
// const fetchSystemLogs = async () => {
//   const response = await fetch('/api/v1/system/logs');
//   return response.json();
// };

const mockLogs = [];

const LEVELS = ['Error', 'Warning', 'Info'];
const MODULES = ['Orders', 'Products', 'Customers', 'Compliance'];
const STATUS_COLORS = { Open: 'warning', Resolved: 'success' };

function SystemLogsErrorMonitoring() {
  const [logs] = useState(mockLogs);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredLogs = logs.filter((log) =>
    (!search || log.message.toLowerCase().includes(search.toLowerCase())) &&
    (!filterLevel || log.level === filterLevel) &&
    (!filterModule || log.module === filterModule) &&
    (!filterStatus || log.status === filterStatus)
  );

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setOpenDetail(true);
  };
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedLog(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><BugReport sx={{ mr: 1 }} />System Logs & Error Monitoring</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search message" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select value={filterLevel} label="Level" onChange={e => setFilterLevel(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {LEVELS.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Module</InputLabel>
          <Select value={filterModule} label="Module" onChange={e => setFilterModule(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {MODULES.map(mod => <MenuItem key={mod} value={mod}>{mod}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell><Chip label={log.level} color={log.level === 'Error' ? 'error' : log.level === 'Warning' ? 'warning' : 'default'} size="small" /></TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell><Chip label={log.status} color={STATUS_COLORS[log.status] || 'default'} size="small" /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDetail(log)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography align="center">No logs found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography><b>Timestamp:</b> {selectedLog.timestamp}</Typography>
              <Typography><b>Level:</b> {selectedLog.level}</Typography>
              <Typography><b>Message:</b> {selectedLog.message}</Typography>
              <Typography><b>Module:</b> {selectedLog.module}</Typography>
              <Typography><b>Status:</b> {selectedLog.status}</Typography>
              <Typography mt={2}><b>Details:</b> {selectedLog.details}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="System Logs" />
    </Box>
  );
}

export default SystemLogsErrorMonitoring;

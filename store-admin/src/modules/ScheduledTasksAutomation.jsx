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
import { Schedule, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockTasks = [
  { id: 1, name: 'Daily Compliance Export', type: 'Export', schedule: 'Daily 2:00 AM', status: 'Active', lastRun: '2025-06-18 02:00', },
  { id: 2, name: 'Weekly Sales Report', type: 'Report', schedule: 'Weekly Mon 3:00 AM', status: 'Inactive', lastRun: '2025-06-16 03:00', },
];

const TASK_TYPES = ['Export', 'Report', 'Notification', 'Cleanup'];
const STATUS_COLORS = { Active: 'success', Inactive: 'default' };

function ScheduledTasksAutomation() {
  const [tasks, setTasks] = useState(mockTasks);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredTasks = tasks.filter((t) =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || t.type === filterType) &&
    (!filterStatus || t.status === filterStatus)
  );

  const handleOpenDialog = (task = null) => {
    setEditTask(task);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditTask(null);
    setOpenDialog(false);
  };
  const handleSaveTask = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };
  const handleStatusToggle = (id) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setTasks(tasks.map((t) => selected.includes(t.id) ? { ...t, status: 'Active' } : t));
    } else if (action === 'deactivate') {
      setTasks(tasks.map((t) => selected.includes(t.id) ? { ...t, status: 'Inactive' } : t));
    } else if (action === 'delete') {
      setTasks(tasks.filter((t) => !selected.includes(t.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Schedule sx={{ mr: 1 }} />Scheduled Tasks & Automation</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search name" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {TASK_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
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
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Task</Button>
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
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} selected={selected.includes(task.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(task.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, task.id]
                        : selected.filter(id => id !== task.id));
                    }}
                  />
                </TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>{task.schedule}</TableCell>
                <TableCell>
                  <Switch checked={task.status === 'Active'} onChange={() => handleStatusToggle(task.id)} color="success" />
                  <Chip label={task.status} color={STATUS_COLORS[task.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell>{task.lastRun}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(task)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(task.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography align="center">No scheduled tasks found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" defaultValue={editTask?.name || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editTask?.type || ''} label="Type">
                {TASK_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Schedule" defaultValue={editTask?.schedule || ''} fullWidth size="small" />
            <TextField label="Last Run" defaultValue={editTask?.lastRun || ''} fullWidth size="small" disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Scheduled Tasks" />
    </Box>
  );
}

export default ScheduledTasksAutomation;

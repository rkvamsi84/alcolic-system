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
  Switch
} from '@mui/material';
import { Notes, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockChangelog = [
  { id: 1, version: 'v2.1.0', date: '2025-06-15', summary: 'Added compliance export, improved dashboard.', details: 'Export audit logs, new analytics, bug fixes.', status: 'Published' },
  { id: 2, version: 'v2.0.0', date: '2025-05-20', summary: 'Major UI overhaul.', details: 'Material Kit React theme, new modules, performance improvements.', status: 'Draft' },
];

const STATUS_COLORS = { Published: 'success', Draft: 'default' };

function ChangelogReleaseNotes() {
  const [changelog, setChangelog] = useState(mockChangelog);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredChangelog = changelog.filter((c) =>
    (!search || c.version.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || c.status === filterStatus)
  );

  const handleOpenDialog = (note = null) => {
    setEditNote(note);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditNote(null);
    setOpenDialog(false);
  };
  const handleSaveNote = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setChangelog(changelog.filter((c) => c.id !== id));
  };
  const handleStatusToggle = (id) => {
    setChangelog(changelog.map((c) => c.id === id ? { ...c, status: c.status === 'Published' ? 'Draft' : 'Published' } : c));
  };
  const handleBulkAction = (action) => {
    if (action === 'publish') {
      setChangelog(changelog.map((c) => selected.includes(c.id) ? { ...c, status: 'Published' } : c));
    } else if (action === 'draft') {
      setChangelog(changelog.map((c) => selected.includes(c.id) ? { ...c, status: 'Draft' } : c));
    } else if (action === 'delete') {
      setChangelog(changelog.filter((c) => !selected.includes(c.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Notes sx={{ mr: 1 }} />Changelog & Release Notes</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search version/summary" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Release Note</Button>
        <Button variant="outlined" color="primary" disabled={selected.length === 0} onClick={() => handleBulkAction('publish')}>Publish</Button>
        <Button variant="outlined" color="warning" disabled={selected.length === 0} onClick={() => handleBulkAction('draft')}>Draft</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChangelog.map((note) => (
              <TableRow key={note.id} selected={selected.includes(note.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(note.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, note.id]
                        : selected.filter(id => id !== note.id));
                    }}
                  />
                </TableCell>
                <TableCell>{note.version}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.summary}</TableCell>
                <TableCell>
                  <Switch checked={note.status === 'Published'} onChange={() => handleStatusToggle(note.id)} color="success" />
                  <Chip label={note.status} color={STATUS_COLORS[note.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(note)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(note.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredChangelog.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography align="center">No release notes found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Release Note Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editNote ? 'Edit Release Note' : 'Add Release Note'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Version" defaultValue={editNote?.version || ''} fullWidth size="small" />
            <TextField label="Date" type="date" defaultValue={editNote?.date || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Summary" defaultValue={editNote?.summary || ''} fullWidth size="small" />
            <TextField label="Details" defaultValue={editNote?.details || ''} fullWidth size="small" multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Changelog" />
    </Box>
  );
}

export default ChangelogReleaseNotes;

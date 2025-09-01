import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../components/PageContainer';

const mockRules = [
  {
    id: 1,
    name: 'Low Stock Alert',
    event: 'inventory',
    condition: 'quantity < 10',
    channel: 'email',
    recipients: 'store_managers',
    status: true,
  },
  {
    id: 2,
    name: 'New Order Notification',
    event: 'orders',
    condition: 'status = new',
    channel: 'push',
    recipients: 'store_staff',
    status: true,
  },
  {
    id: 3,
    name: 'Failed Delivery Alert',
    event: 'delivery',
    condition: 'status = failed',
    channel: 'sms',
    recipients: 'delivery_managers',
    status: false,
  },
];

const events = ['inventory', 'orders', 'delivery', 'user', 'system'];
const channels = ['email', 'sms', 'push', 'in_app'];
const recipientGroups = ['store_managers', 'store_staff', 'delivery_managers', 'admins'];

export default function NotificationRules() {
  const [rules, setRules] = useState(mockRules);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    event: '',
    condition: '',
    channel: '',
    recipients: '',
    status: true,
  });

  const handleAddRule = () => {
    if (selectedRule) {
      setRules(rules.map(rule => 
        rule.id === selectedRule.id ? { ...newRule, id: rule.id } : rule
      ));
    } else {
      setRules([...rules, { ...newRule, id: rules.length + 1 }]);
    }
    setOpenDialog(false);
    setNewRule({
      name: '',
      event: '',
      condition: '',
      channel: '',
      recipients: '',
      status: true,
    });
    setSelectedRule(null);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setNewRule(rule);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleToggleStatus = (id) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, status: !rule.status } : rule
    ));
  };

  return (
    <PageContainer title="Notification Rules">
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Rule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rule Name</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.event}</TableCell>
                <TableCell>{rule.condition}</TableCell>
                <TableCell>{rule.channel}</TableCell>
                <TableCell>{rule.recipients}</TableCell>
                <TableCell>
                  <Switch
                    checked={rule.status}
                    onChange={() => handleToggleStatus(rule.id)}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(rule)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setSelectedRule(null);
        setNewRule({
          name: '',
          event: '',
          condition: '',
          channel: '',
          recipients: '',
          status: true,
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRule ? 'Edit Rule' : 'Add New Rule'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Rule Name"
              fullWidth
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Event</InputLabel>
              <Select
                value={newRule.event}
                label="Event"
                onChange={(e) => setNewRule({ ...newRule, event: e.target.value })}
              >
                {events.map((event) => (
                  <MenuItem key={event} value={event}>
                    {event.charAt(0).toUpperCase() + event.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Condition"
              fullWidth
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Channel</InputLabel>
              <Select
                value={newRule.channel}
                label="Channel"
                onChange={(e) => setNewRule({ ...newRule, channel: e.target.value })}
              >
                {channels.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Recipients</InputLabel>
              <Select
                value={newRule.recipients}
                label="Recipients"
                onChange={(e) => setNewRule({ ...newRule, recipients: e.target.value })}
              >
                {recipientGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setSelectedRule(null);
            setNewRule({
              name: '',
              event: '',
              condition: '',
              channel: '',
              recipients: '',
              status: true,
            });
          }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddRule}
            disabled={!newRule.name || !newRule.event || !newRule.condition || !newRule.channel || !newRule.recipients}
          >
            {selectedRule ? 'Save Changes' : 'Add Rule'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const RoleAccessControl = () => {
  const theme = useTheme();
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 1,
      name: 'Super Admin',
      users: 3,
      description: 'Full system access with all permissions',
      permissions: {
        dashboard: ['view', 'edit'],
        orders: ['view', 'edit', 'delete'],
        products: ['view', 'edit', 'delete'],
        customers: ['view', 'edit', 'delete'],
        settings: ['view', 'edit'],
      },
      status: 'active',
    },
    {
      id: 2,
      name: 'Store Manager',
      users: 8,
      description: 'Manage store operations and inventory',
      permissions: {
        dashboard: ['view'],
        orders: ['view', 'edit'],
        products: ['view', 'edit'],
        customers: ['view'],
        settings: ['view'],
      },
      status: 'active',
    },
    {
      id: 3,
      name: 'Customer Service',
      users: 15,
      description: 'Handle customer inquiries and orders',
      permissions: {
        dashboard: ['view'],
        orders: ['view'],
        products: ['view'],
        customers: ['view', 'edit'],
        settings: [],
      },
      status: 'active',
    },
    {
      id: 4,
      name: 'Inventory Manager',
      users: 6,
      description: 'Manage product inventory and categories',
      permissions: {
        dashboard: ['view'],
        orders: ['view'],
        products: ['view', 'edit'],
        customers: ['view'],
        settings: [],
      },
      status: 'inactive',
    },
  ];

  const stats = [
    {
      title: 'Total Roles',
      value: '12',
      change: '+2 new',
      icon: <SecurityIcon />,
    },
    {
      title: 'Active Users',
      value: '45',
      change: '+5 this month',
      icon: <GroupIcon />,
    },
    {
      title: 'Permission Sets',
      value: '8',
      change: 'Updated today',
      icon: <AdminPanelSettingsIcon />,
    },
  ];

  const modules = [
    {
      name: 'Dashboard',
      permissions: ['view', 'edit'],
    },
    {
      name: 'Orders',
      permissions: ['view', 'edit', 'delete'],
    },
    {
      name: 'Products',
      permissions: ['view', 'edit', 'delete'],
    },
    {
      name: 'Customers',
      permissions: ['view', 'edit', 'delete'],
    },
    {
      name: 'Settings',
      permissions: ['view', 'edit'],
    },
  ];

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setOpenRoleDialog(true);
  };

  return (
    <PageContainer title="Role-Based Access Control">
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 1, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedRole(null);
                setOpenRoleDialog(true);
              }}
            >
              Create Role
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {role.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${role.users} users`}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(role.permissions).map(([module, perms]) => (
                          perms.length > 0 && (
                            <Chip
                              key={module}
                              label={`${module} (${perms.length})`}
                              size="small"
                              sx={{ bgcolor: 'primary.lighter' }}
                            />
                          )
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={role.status === 'active'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditRole(role)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Role Name"
              fullWidth
              defaultValue={selectedRole?.name}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              defaultValue={selectedRole?.description}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Module Permissions
            </Typography>
            {modules.map((module) => (
              <Accordion key={module.name} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{module.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {module.permissions.map((permission) => (
                      <FormControlLabel
                        key={permission}
                        control={
                          <Checkbox
                            defaultChecked={
                              selectedRole?.permissions[module.name.toLowerCase()]?.includes(permission)
                            }
                          />
                        }
                        label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setOpenRoleDialog(false)}>
            {selectedRole ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default RoleAccessControl;

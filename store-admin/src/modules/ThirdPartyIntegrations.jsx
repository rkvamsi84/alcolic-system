import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';

function ThirdPartyIntegrations() {
  // Mock state for integrations and dialogs
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><ExtensionIcon sx={{ mr: 1 }} />3rd Party Integrations</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Add Integration</Button>
      </Stack>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Connected Integrations</Typography>
        <List>
          <ListItem><ListItemText primary="Go-UPC" secondary="Product import integration. Status: Connected." /></ListItem>
          <ListItem><ListItemText primary="Stripe" secondary="Payment processing. Status: Not Connected." /></ListItem>
        </List>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Integration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Integration Name" fullWidth size="small" />
            <TextField label="API Key / Credentials" fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ThirdPartyIntegrations;

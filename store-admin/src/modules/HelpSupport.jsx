import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

function HelpSupport() {
  // Mock state for support tickets, FAQ, and dialogs
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><HelpOutline sx={{ mr: 1 }} />Help & Support</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Submit Support Ticket</Button>
      </Stack>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Frequently Asked Questions</Typography>
        <List>
          <ListItem><ListItemText primary="How do I reset my password?" secondary="Go to Settings > Account > Reset Password." /></ListItem>
          <ListItem><ListItemText primary="How do I contact support?" secondary="Use the 'Submit Support Ticket' button above or email support@liquoradmin.com." /></ListItem>
        </List>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Support Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Subject" fullWidth size="small" />
            <TextField label="Description" fullWidth size="small" multiline rows={4} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HelpSupport;

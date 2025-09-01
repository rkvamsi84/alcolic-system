import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Switch, Divider, Stack } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const mockConfigs = [
  { key: 'Enable Email Notifications', value: true },
  { key: 'Enable Regulatory Logging', value: true },
  { key: 'Allow Guest Checkout', value: false },
];

function SystemConfigurations() {
  const [configs, setConfigs] = React.useState(mockConfigs);
  const handleToggle = (idx) => {
    setConfigs(configs.map((c, i) => i === idx ? { ...c, value: !c.value } : c));
  };
  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><SettingsIcon sx={{ mr: 1 }} />System Configurations</Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {configs.map((c, idx) => (
            <ListItem key={c.key} secondaryAction={
              <Switch checked={c.value} onChange={() => handleToggle(idx)} />
            }>
              <ListItemText primary={c.key} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default SystemConfigurations;

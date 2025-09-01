import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Divider, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';

const AIIntegrationSettings = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiApiKey, setAiApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');

  const handleSave = () => {
    // Save AI settings (mock)
    alert('AI settings saved!');
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          AI Integration Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={<Switch checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} />}
          label="Enable AI Features"
        />
        <TextField
          fullWidth
          label="AI API Key"
          value={aiApiKey}
          onChange={e => setAiApiKey(e.target.value)}
          sx={{ my: 2 }}
        />
        <Typography variant="subtitle1" gutterBottom>
          Select AI Model
        </Typography>
        <Select
          fullWidth
          value={model}
          onChange={e => setModel(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="gpt-4">GPT-4</MenuItem>
          <MenuItem value="gpt-3.5">GPT-3.5</MenuItem>
          <MenuItem value="custom">Custom Model</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </Card>
    </Box>
  );
};

export default AIIntegrationSettings; 
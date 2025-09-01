import React from 'react';
import { Box, Typography } from '@mui/material';
import ZoneSelector from '../components/widgets/ZoneSelector';

const ZoneSelectorTest = () => {
  console.log('🧪 ZoneSelectorTest component rendered');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Zone Selector Test Page
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        This is a test page to debug the ZoneSelector component.
      </Typography>
      
      <Box sx={{ border: '2px solid #e0e0e0', p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          ZoneSelector Component:
        </Typography>
        <ZoneSelector />
      </Box>
    </Box>
  );
};

export default ZoneSelectorTest;
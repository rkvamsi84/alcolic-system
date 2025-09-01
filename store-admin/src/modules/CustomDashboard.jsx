import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import MoreVert from '@mui/icons-material/MoreVert';
import Add from '@mui/icons-material/Add';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const Widget = ({ title, children, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); onEdit(); }}>
              Edit Widget
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onDelete(); }} sx={{ color: 'error.main' }}>
              Delete Widget
            </MenuItem>
          </Menu>
        </Box>
        {children}
      </CardContent>
    </MotionCard>
  );
};

const CustomDashboard = () => {
  const theme = useTheme();
  const [widgets, setWidgets] = useState([
    {
      id: 1,
      title: 'Revenue Overview',
      type: 'chart',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        values: [4500, 5200, 4800, 5800, 6000],
      },
    },
    {
      id: 2,
      title: 'Recent Activities',
      type: 'list',
      data: [
        { id: 1, text: 'New order received', time: '2 hours ago' },
        { id: 2, text: 'Product stock updated', time: '4 hours ago' },
        { id: 3, text: 'Customer feedback received', time: '6 hours ago' },
      ],
    },
    {
      id: 3,
      title: 'Top Products',
      type: 'table',
      data: [
        { id: 1, name: 'Product A', sales: 150, revenue: 4500 },
        { id: 2, name: 'Product B', sales: 120, revenue: 3600 },
        { id: 3, name: 'Product C', sales: 90, revenue: 2700 },
      ],
    },
  ]);

  const handleAddWidget = () => {
    // Add widget logic
    console.log('Add widget');
  };

  const handleEditWidget = (widgetId) => {
    // Edit widget logic
    console.log('Edit widget', widgetId);
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">Chart Placeholder</Typography>
          </Box>
        );
      case 'list':
        return (
          <Box>
            {widget.data.map((item) => (
              <Box
                key={item.id}
                sx={{
                  py: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography variant="body2">{item.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.time}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      case 'table':
        return (
          <Box>
            {widget.data.map((item) => (
              <Box
                key={item.id}
                sx={{
                  py: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" color="primary">
                    ${item.revenue}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.sales} sales
                </Typography>
              </Box>
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer title="Custom Dashboard">
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddWidget}
        >
          Add Widget
        </Button>
      </Box>

      <Grid container spacing={2}>
        {widgets.map((widget) => (
          <Grid item xs={12} md={6} lg={4} key={widget.id}>
            <Widget
              title={widget.title}
              onEdit={() => handleEditWidget(widget.id)}
              onDelete={() => handleDeleteWidget(widget.id)}
            >
              {renderWidgetContent(widget)}
            </Widget>
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
};

export default CustomDashboard;

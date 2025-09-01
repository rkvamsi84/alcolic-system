import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Rating,
  Stack,
  Collapse,
  Button,
  useTheme,
  Grid,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArchiveIcon from '@mui/icons-material/Archive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const ProductRow = ({ product, onAction }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    onAction(action, product);
    handleCloseMenu();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'low_stock':
        return theme.palette.warning.main;
      case 'out_of_stock':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              variant="rounded"
              src={product.images && product.images.length > 0 ? product.images[0].url : product.image}
              sx={{ width: 48, height: 48 }}
            >
              {product.name[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {product.name}
                {product.trending && (
                  <TrendingUpIcon
                    color="primary"
                    fontSize="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                SKU: {product.sku}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Stack spacing={1}>
            <Chip
              label={product.category}
              size="small"
              sx={{ bgcolor: 'primary.lighter' }}
            />
            <Typography variant="caption" color="text.secondary">
              {product.subCategory}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2">
            ${product.price}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.stock} in stock
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {product.reviews} reviews • {product.sales} sales
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={product.status}
            size="small"
            sx={{
              color: getStatusColor(product.status),
              bgcolor: `${getStatusColor(product.status)}15`,
            }}
          />
        </TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={handleOpenMenu}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Product Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Description</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Specifications</Typography>
                      {product.specifications?.map((spec, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {spec.label}:
                          </Typography>
                          <Typography variant="caption">
                            {spec.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Variants</Typography>
                      {product.variants?.map((variant, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip
                            label={variant.name}
                            size="small"
                          />
                          <Typography variant="caption">
                            ${variant.price} • {variant.stock} in stock
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Performance</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Last 30 Days:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                          <Chip
                            label={`${product.performance?.views || 0} Views`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${product.performance?.sales || 0} Sales`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                          <Chip
                            label={`${product.performance?.revenue || 0}% Revenue`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleAction('edit')}
                >
                  Edit Product
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleAction('duplicate')}
                >
                  Duplicate
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleAction('delete')}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('duplicate')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => handleAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          Archive
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

// Add analytics data
const getProductAnalytics = (product) => {
  return {
    salesTrend: Math.random() > 0.5 ? 'up' : 'down',
    trendPercentage: Math.floor(Math.random() * 20),
    stockLevel: Math.floor(Math.random() * 100),
    profitMargin: Math.floor(Math.random() * 40) + 10,
    viewCount: Math.floor(Math.random() * 1000),
    conversionRate: Math.floor(Math.random() * 15) + 5,
  };
};

const StockLevelIndicator = ({ level }) => {
  let color = level > 70 ? 'success' : level > 30 ? 'warning' : 'error';
  return (
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress variant="determinate" value={level} color={color} />
      <Typography variant="caption" color="text.secondary">
        {level}% in stock
      </Typography>
    </Box>
  );
};

const ProductAnalytics = ({ product }) => {
  const analytics = getProductAnalytics(product);
  
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={4}>
        <Tooltip title="Sales Trend">
          <Chip
            icon={analytics.salesTrend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${analytics.trendPercentage}% ${analytics.salesTrend}`}
            color={analytics.salesTrend === 'up' ? 'success' : 'error'}
            size="small"
          />
        </Tooltip>
      </Grid>
      <Grid item xs={4}>
        <Tooltip title="Profit Margin">
          <Chip
            icon={<MonetizationOnIcon />}
            label={`${analytics.profitMargin}% margin`}
            color={analytics.profitMargin > 25 ? 'success' : 'warning'}
            size="small"
          />
        </Tooltip>
      </Grid>
      <Grid item xs={4}>
        <Tooltip title="Conversion Rate">
          <Chip
            icon={<AssessmentIcon />}
            label={`${analytics.conversionRate}% conv.`}
            color={analytics.conversionRate > 10 ? 'success' : 'warning'}
            size="small"
          />
        </Tooltip>
      </Grid>
    </Grid>
  );
};

const ProductTable = ({ products, onAction }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={50} />
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price & Stock</TableCell>
            <TableCell>Performance</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Analytics</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onAction={onAction}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;

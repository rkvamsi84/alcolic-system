import { Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Add, Edit, Delete, Search, FilterList, LocalOffer, Event, CheckCircle, Schedule, Block } from "@mui/icons-material";
import { useState, useEffect } from "react";

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "success";
    case "Scheduled": return "info";
    case "Expired": return "default";
    default: return "default";
  }
};

export default function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  
  // Form states
  const [promoTitle, setPromoTitle] = useState("");
  const [promoType, setPromoType] = useState("Discount");
  const [promoStore, setPromoStore] = useState("");
  const [promoStart, setPromoStart] = useState("");
  const [promoEnd, setPromoEnd] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');

  // Fetch promotions from backend
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/promotions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setPromotions(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch promotions');
        setLoading(false);
      });
  }, []);

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.title.toLowerCase().includes(searchTerm.toLowerCase()) || promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || promo.status === statusFilter;
    const matchesType = !typeFilter || promo.type === typeFilter;
    const matchesStore = !storeFilter || promo.store === storeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesStore;
  });

  const stores = [...new Set(promotions.map(p => p.store))];
  const types = [...new Set(promotions.map(p => p.type))];

  // Create Promotion
  const handleCreate = () => {
    setPromoTitle("");
    setPromoType("Discount");
    setPromoStore("");
    setPromoStart("");
    setPromoEnd("");
    setPromoCode("");
    setDiscountType('percentage');
    setDiscountValue('');
    setMinimumOrderAmount('');
    setMaximumDiscount('');
    setUsageLimit('');
    setPerUserLimit('');
    setDescription('');
    setTerms('');
    setCreateDialogOpen(true);
  };

  // Edit Promotion
  const handleEdit = (promo) => {
    setSelectedPromo(promo);
    setPromoTitle(promo.title);
    setPromoType(promo.type.charAt(0).toUpperCase() + promo.type.slice(1));
    setPromoStore(promo.store?.name || "");
    setPromoStart(promo.startDate ? promo.startDate.substring(0, 10) : "");
    setPromoEnd(promo.endDate ? promo.endDate.substring(0, 10) : "");
    setPromoCode(promo.code);
    setDiscountType(promo.discountType || 'percentage');
    setDiscountValue(promo.discountValue || '');
    setMinimumOrderAmount(promo.minimumOrderAmount || '');
    setMaximumDiscount(promo.maximumDiscount || '');
    setUsageLimit(promo.usageLimit || '');
    setPerUserLimit(promo.perUserLimit || '');
    setDescription(promo.description || '');
    setTerms(promo.terms || '');
    setEditDialogOpen(true);
  };

  // Delete Promotion
  const handleDelete = (promo) => {
    setSelectedPromo(promo);
    setDeleteDialogOpen(true);
  };

  // Save Promotion (Create or Edit)
  const handleSave = async () => {
    // Validate required fields
    if (!promoTitle || !promoCode || !promoStart || !promoEnd) {
      setError('Please fill in all required fields (Title, Code, Start Date, End Date)');
      return;
    }

    // Validate discount fields for discount type
    if (promoType === 'Discount' && (!discountValue || !discountType)) {
      setError('Please fill in discount value and type for discount promotions');
      return;
    }

    const newPromotion = {
      title: promoTitle,
      description: description || promoTitle, // Use title as description if not provided
      type: promoType.toLowerCase().replace(/ /g, '_'),
      code: promoCode.toUpperCase(),
      startDate: new Date(promoStart).toISOString(),
      endDate: new Date(promoEnd).toISOString(),
      isActive: true,
      discountType: promoType === 'Discount' ? discountType : undefined,
      discountValue: promoType === 'Discount' ? Number(discountValue) : undefined,
      minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      terms: terms || undefined
    };

    try {
      if (editDialogOpen && selectedPromo) {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/promotions/` + selectedPromo._id, {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPromotion)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update promotion');
        }
        
        const updatedPromo = await response.json();
        setPromotions(promotions.map(p => p._id === selectedPromo._id ? updatedPromo.data : p));
        setEditDialogOpen(false);
        setError('');
      } else {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/promotions`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPromotion)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create promotion');
        }
        
        const createdPromo = await response.json();
        setPromotions([createdPromo.data, ...promotions]);
        setCreateDialogOpen(false);
        setError('');
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError(err.message || 'Failed to save promotion');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/promotions/` + selectedPromo._id, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
        }
      });
      if (response.ok) {
        setPromotions(promotions.filter(p => p._id !== selectedPromo._id));
        setDeleteDialogOpen(false);
      } else {
        setError('Failed to delete promotion');
      }
    } catch (err) {
      setError('Failed to delete promotion');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Promotions & Discounts</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>Create Promotion</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Search Promotions" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="outlined" startIcon={<FilterList />} fullWidth onClick={() => setMoreFiltersOpen(true)}>More Filters</Button>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        {filteredPromotions.map((promo) => (
          <Grid item xs={12} sm={6} md={4} key={promo.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocalOffer sx={{ mr: 2, color: 'primary.main' }} />
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>{promo.title}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label={promo.status} color={getStatusColor(promo.status)} size="small" />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Type:</strong> {promo.type}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Store:</strong> {promo.store}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Code:</strong> {promo.code}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Start:</strong> {promo.start}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>End:</strong> {promo.end}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Discount:</strong> {promo.discountType === 'percentage' ? `${promo.discountValue}%` : promo.discountType === 'fixed_amount' ? `$${promo.discountValue}` : '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Min Order:</strong> {promo.minimumOrderAmount ? `$${promo.minimumOrderAmount}` : '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Max Discount:</strong> {promo.maximumDiscount ? `$${promo.maximumDiscount}` : '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Usage Limit:</strong> {promo.usageLimit || '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Per User Limit:</strong> {promo.perUserLimit || '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Description:</strong> {promo.description || '-'}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom><strong>Terms:</strong> {promo.terms || '-'}</Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Usage: {promo.usage}</Typography>
                    <Typography variant="body2" color="textSecondary">Revenue: ${promo.revenue}</Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(promo)}>Edit</Button>
                <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDelete(promo)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Promotion Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Promotion</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Promotion Title" variant="outlined" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={promoType} label="Type" onChange={e => setPromoType(e.target.value)}>
                  <MenuItem value="Discount">Discount</MenuItem>
                  <MenuItem value="Free Delivery">Free Delivery</MenuItem>
                  <MenuItem value="BOGO">BOGO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={promoStore} label="Store" onChange={e => setPromoStore(e.target.value)}>
                  <MenuItem value="All Stores">All Stores</MenuItem>
                  <MenuItem value="Liquor Store Downtown">Liquor Store Downtown</MenuItem>
                  <MenuItem value="Wine & Spirits">Wine & Spirits</MenuItem>
                  <MenuItem value="Beer Garden">Beer Garden</MenuItem>
                  <MenuItem value="Premium Liquors">Premium Liquors</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Promo Code" variant="outlined" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Date" type="date" variant="outlined" value={promoStart} onChange={e => setPromoStart(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Date" type="date" variant="outlined" value={promoEnd} onChange={e => setPromoEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select value={discountType} label="Discount Type" onChange={e => setDiscountType(e.target.value)} disabled={promoType !== 'Discount'}>
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Discount Value" variant="outlined" value={discountValue} onChange={e => setDiscountValue(e.target.value)} type="number" disabled={promoType !== 'Discount'} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Minimum Order Amount" variant="outlined" value={minimumOrderAmount} onChange={e => setMinimumOrderAmount(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Maximum Discount" variant="outlined" value={maximumDiscount} onChange={e => setMaximumDiscount(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Usage Limit" variant="outlined" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Per User Limit" variant="outlined" value={perUserLimit} onChange={e => setPerUserLimit(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" variant="outlined" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Terms & Conditions" variant="outlined" value={terms} onChange={e => setTerms(e.target.value)} multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Create Promotion</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Promotion</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Promotion Title" variant="outlined" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={promoType} label="Type" onChange={e => setPromoType(e.target.value)}>
                  <MenuItem value="Discount">Discount</MenuItem>
                  <MenuItem value="Free Delivery">Free Delivery</MenuItem>
                  <MenuItem value="BOGO">BOGO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={promoStore} label="Store" onChange={e => setPromoStore(e.target.value)}>
                  <MenuItem value="All Stores">All Stores</MenuItem>
                  <MenuItem value="Liquor Store Downtown">Liquor Store Downtown</MenuItem>
                  <MenuItem value="Wine & Spirits">Wine & Spirits</MenuItem>
                  <MenuItem value="Beer Garden">Beer Garden</MenuItem>
                  <MenuItem value="Premium Liquors">Premium Liquors</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Promo Code" variant="outlined" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Date" type="date" variant="outlined" value={promoStart} onChange={e => setPromoStart(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Date" type="date" variant="outlined" value={promoEnd} onChange={e => setPromoEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select value={discountType} label="Discount Type" onChange={e => setDiscountType(e.target.value)} disabled={promoType !== 'Discount'}>
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Discount Value" variant="outlined" value={discountValue} onChange={e => setDiscountValue(e.target.value)} type="number" disabled={promoType !== 'Discount'} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Minimum Order Amount" variant="outlined" value={minimumOrderAmount} onChange={e => setMinimumOrderAmount(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Maximum Discount" variant="outlined" value={maximumDiscount} onChange={e => setMaximumDiscount(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Usage Limit" variant="outlined" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Per User Limit" variant="outlined" value={perUserLimit} onChange={e => setPerUserLimit(e.target.value)} type="number" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" variant="outlined" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Terms & Conditions" variant="outlined" value={terms} onChange={e => setTerms(e.target.value)} multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>More Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)}>
                  <MenuItem value="">All Types</MenuItem>
                  {types.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={storeFilter} label="Store" onChange={e => setStoreFilter(e.target.value)}>
                  <MenuItem value="">All Stores</MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store} value={store}>{store}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTypeFilter("");
            setStoreFilter("");
          }}>Clear</Button>
          <Button onClick={() => setMoreFiltersOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Promotion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedPromo?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
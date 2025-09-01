import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Skeleton,
  Pagination,
  Rating,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Sort,
  Category,
  Star,
  AttachMoney,
  TrendingUp,
  NewReleases,
  LocalOffer,
  Close,
  Tune,
  ViewList,
  ViewModule,
  Save,
  History,
  AutoAwesome
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { apiService } from '../../config/api';
import { toast } from 'react-hot-toast';
import ProductCard from '../widgets/ProductCard';

const AdvancedFilteringPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterStats, setFilterStats] = useState(null);

  // Advanced filter state
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    priceRange: [0, 1000],
    discountRange: [0, 100],
    rating: 0,
    inStock: false,
    onSale: false,
    newArrivals: false,
    featured: false,
    popular: false,
    trending: false,
    excludeOutOfStock: false,
    availability: '',
    condition: '',
    tags: []
  });

  // Sort and view state
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter presets
  const [activePreset, setActivePreset] = useState('');
  const [savedFilters, setSavedFilters] = useState([]);
  const [showFilterHistory, setShowFilterHistory] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState(0);

  const filterPresets = [
    {
      id: 'best_sellers',
      name: 'Best Sellers',
      icon: <TrendingUp />,
      description: 'High-rated products with many reviews'
    },
    {
      id: 'new_releases',
      name: 'New Releases',
      icon: <NewReleases />,
      description: 'Recently added products'
    },
    {
      id: 'clearance',
      name: 'Clearance',
      icon: <LocalOffer />,
      description: 'Products with 50%+ discount'
    },
    {
      id: 'under_50',
      name: 'Under $50',
      icon: <AttachMoney />,
      description: 'Affordable options under $50'
    }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'sales', label: 'Best Selling' },
    { value: 'discount', label: 'Highest Discount' }
  ];

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    loadSavedFilters();
  }, []);

  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => v && v.length > 0)) {
      performSearch();
    }
  }, [searchQuery, filters, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/products/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const mockBrands = [
        'Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Adidas', 'Puma',
        'Coca-Cola', 'Pepsi', 'Nestle', 'Kraft', 'General Mills'
      ];
      setBrands(mockBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        page: currentPage,
        limit: 20,
        sortBy,
        ...buildFilterParams()
      };

      const response = await apiService.get('/products/search', { params });
      
      if (response.success) {
        setProducts(response.data.products);
        setTotalResults(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
        setFilterStats(response.data.stats);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const buildFilterParams = () => {
    const params = {};
    
    if (filters.category.length > 0) {
      params.categories = filters.category.join(',');
    }
    
    if (filters.brand.length > 0) {
      params.brands = filters.brand.join(',');
    }
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      params.priceMin = filters.priceRange[0];
      params.priceMax = filters.priceRange[1];
    }
    
    if (filters.discountRange[0] > 0 || filters.discountRange[1] < 100) {
      params.discountMin = filters.discountRange[0];
      params.discountMax = filters.discountRange[1];
    }
    
    if (filters.rating > 0) {
      params.rating = filters.rating;
    }
    
    if (filters.inStock) params.inStock = 'true';
    if (filters.onSale) params.onSale = 'true';
    if (filters.newArrivals) params.newArrivals = 'true';
    if (filters.featured) params.featured = 'true';
    if (filters.popular) params.popular = 'true';
    if (filters.trending) params.trending = 'true';
    if (filters.excludeOutOfStock) params.excludeOutOfStock = 'true';
    
    if (filters.availability) {
      params.availability = filters.availability;
    }
    
    if (filters.condition) {
      params.condition = filters.condition;
    }
    
    if (filters.tags.length > 0) {
      params.tags = filters.tags.join(',');
    }
    
    if (activePreset) {
      params.preset = activePreset;
    }
    
    return params;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handlePresetClick = (presetId) => {
    setActivePreset(activePreset === presetId ? '' : presetId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      brand: [],
      priceRange: [0, 1000],
      discountRange: [0, 100],
      rating: 0,
      inStock: false,
      onSale: false,
      newArrivals: false,
      featured: false,
      popular: false,
      trending: false,
      excludeOutOfStock: false,
      availability: '',
      condition: '',
      tags: []
    });
    setActivePreset('');
    setCurrentPage(1);
  };

  const saveCurrentFilters = () => {
    const filterName = prompt('Enter a name for this filter combination:');
    if (filterName) {
      const savedFilter = {
        id: Date.now(),
        name: filterName,
        filters: { ...filters },
        preset: activePreset,
        sortBy,
        createdAt: new Date().toISOString()
      };
      
      const updatedSavedFilters = [...savedFilters, savedFilter];
      setSavedFilters(updatedSavedFilters);
      localStorage.setItem('savedFilters', JSON.stringify(updatedSavedFilters));
      toast.success('Filter combination saved!');
    }
  };

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  };

  const renderFilterPresets = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesome />
          Quick Filters
        </Typography>
        <Grid container spacing={2}>
          {filterPresets.map((preset) => (
            <Grid item xs={12} sm={6} md={3} key={preset.id}>
              <Card
                variant={activePreset === preset.id ? 'elevation' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  },
                  ...(activePreset === preset.id && {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  })
                }}
                onClick={() => handlePresetClick(preset.id)}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    {preset.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {preset.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {preset.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAdvancedFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tune />
            Advanced Filters
          </Typography>
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<Clear />}
          >
            Clear All
          </Button>
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Categories & Brands" />
          <Tab label="Price & Discount" />
          <Tab label="Other Filters" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Categories
              </Typography>
              <FormGroup>
                {categories.map((category) => (
                  <FormControlLabel
                    key={category._id}
                    control={
                      <Checkbox
                        checked={filters.category.includes(category._id)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...filters.category, category._id]
                            : filters.category.filter(id => id !== category._id);
                          handleFilterChange('category', newCategories);
                        }}
                        size="small"
                      />
                    }
                    label={`${category.name} (${category.productCount || 0})`}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Brands
              </Typography>
              <Autocomplete
                multiple
                options={brands}
                value={filters.brand}
                onChange={(event, newValue) => handleFilterChange('brand', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Select brands..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Price Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={(event, newValue) => handleFilterChange('priceRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 250, label: '$250' },
                    { value: 500, label: '$500' },
                    { value: 750, label: '$750' },
                    { value: 1000, label: '$1000' }
                  ]}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">
                    ${filters.priceRange[0]}
                  </Typography>
                  <Typography variant="caption">
                    ${filters.priceRange[1]}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Discount Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.discountRange}
                  onChange={(event, newValue) => handleFilterChange('discountRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' }
                  ]}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">
                    {filters.discountRange[0]}%
                  </Typography>
                  <Typography variant="caption">
                    {filters.discountRange[1]}%
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Minimum Rating
              </Typography>
              <Rating
                value={filters.rating}
                onChange={(event, newValue) => handleFilterChange('rating', newValue)}
                size="large"
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Product Status
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      size="small"
                    />
                  }
                  label="In Stock Only"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.onSale}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                      size="small"
                    />
                  }
                  label="On Sale"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.newArrivals}
                      onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
                      size="small"
                    />
                  }
                  label="New Arrivals"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Featured"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.popular}
                      onChange={(e) => handleFilterChange('popular', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Popular"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.trending}
                      onChange={(e) => handleFilterChange('trending', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Trending"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.excludeOutOfStock}
                      onChange={(e) => handleFilterChange('excludeOutOfStock', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Exclude Out of Stock"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={['Eco-friendly', 'Organic', 'Sustainable', 'Premium', 'Limited Edition']}
                value={filters.tags}
                onChange={(event, newValue) => handleFilterChange('tags', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Add tags..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  const renderFilterStats = () => {
    if (!filterStats) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">
                  {filterStats.totalProducts}
                </Typography>
                <Typography variant="caption">Total Products</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {filterStats.inStockCount}
                </Typography>
                <Typography variant="caption">In Stock</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {filterStats.onSaleCount}
                </Typography>
                <Typography variant="caption">On Sale</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {filterStats.averageRating?.toFixed(1) || '0.0'}
                </Typography>
                <Typography variant="caption">Avg Rating</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSortAndView = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {totalResults} results found
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort by"
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => setViewMode('grid')}
          color={viewMode === 'grid' ? 'primary' : 'default'}
        >
          <ViewModule />
        </IconButton>
        <IconButton
          onClick={() => setViewMode('list')}
          color={viewMode === 'list' ? 'primary' : 'default'}
        >
          <ViewList />
        </IconButton>
      </Box>
    </Box>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (products.length === 0) {
      return (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard
                product={product}
                onAddToCart={addToCart}
                onAddToFavorites={addToFavorites}
                onRemoveFromFavorites={removeFromFavorites}
                isFavorite={favorites.includes(product._id)}
                viewMode={viewMode}
              />
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Advanced Filtering
        </Typography>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={saveCurrentFilters}
                startIcon={<Save />}
              >
                Save Filters
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowFilterHistory(true)}
                startIcon={<History />}
              >
                History
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Filter Presets */}
        {renderFilterPresets()}

        {/* Advanced Filters */}
        {renderAdvancedFilters()}

        {/* Filter Stats */}
        {renderFilterStats()}

        {/* Sort and View Controls */}
        {renderSortAndView()}

        {/* Products */}
        {renderProducts()}
      </motion.div>
    </Container>
  );
};

export default AdvancedFilteringPage; 
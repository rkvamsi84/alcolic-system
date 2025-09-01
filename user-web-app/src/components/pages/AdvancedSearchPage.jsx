import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Close,
  Tune,
  ViewList,
  ViewModule,
  KeyboardArrowLeft
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { apiService } from '../../config/api';
import { toast } from 'react-hot-toast';
import ProductCard from '../widgets/ProductCard';

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    onSale: false,
    newArrivals: false,
    featured: false
  });

  // Sort and view state
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Get initial search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setShowSuggestions(query.length > 0);
    
    if (query.length > 2) {
      fetchSuggestions(query);
      debouncedSearch(query);
    } else {
      setSuggestions([]);
      setProducts([]);
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await apiService.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/products/categories');
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Perform search with filters
  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      
      const searchParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        sortBy,
        ...filters,
        priceMin: filters.priceRange[0].toString(),
        priceMax: filters.priceRange[1].toString(),
        categories: filters.category.join(',')
      });

      const response = await apiService.get(`/products/search?${searchParams.toString()}`);
      
      if (response.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalResults(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(categoryId)
        ? prev.category.filter(id => id !== categoryId)
        : [...prev.category, categoryId]
    }));
    setPage(1);
  };

  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newValue
    }));
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      onSale: false,
      newArrivals: false,
      featured: false
    });
    setSortBy('relevance');
    setPage(1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Apply filters and search
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [filters, sortBy, page]);

  // Update URL with search query
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams(location.search);
      params.set('q', searchQuery);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [searchQuery, navigate, location.pathname, location.search]);

  const renderSearchBar = () => (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        placeholder="Search for products..."
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setProducts([]);
                  setShowSuggestions(false);
                }}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card sx={{ position: 'absolute', zIndex: 1000, width: '100%', maxWidth: '100%' }}>
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <Search />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );

  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tune />
            Filters
          </Typography>
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<Clear />}
          >
            Clear All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Categories */}
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
                      onChange={() => handleCategoryChange(category._id)}
                      size="small"
                    />
                  }
                  label={category.name}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Price Range */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Price Range
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={filters.priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
                marks={[
                  { value: 0, label: '$0' },
                  { value: 500, label: '$500' },
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

          {/* Rating Filter */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Minimum Rating
            </Typography>
            <Rating
              value={filters.rating}
              onChange={(event, newValue) => handleFilterChange('rating', newValue)}
              size="large"
            />
          </Grid>

          {/* Other Filters */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Other Filters
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
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSortAndView = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {totalResults} results found
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Sort by"
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="popular">Most Popular</MenuItem>
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
              <Skeleton variant="rectangular" height={300} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (products.length === 0 && searchQuery) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      );
    }

    // Group products by store (only stores with products)
    const productsByStore = products.reduce((acc, product) => {
      const storeName = product.store?.name || 'Unknown Store';
      const storeId = product.store?._id || 'unknown';
      
      if (!acc[storeId]) {
        acc[storeId] = {
          storeName,
          storeInfo: product.store,
          products: []
        };
      }
      acc[storeId].products.push(product);
      return acc;
    }, {});
    
    // Filter out stores with no products
    const storesWithProducts = {};
    Object.entries(productsByStore).forEach(([storeId, storeData]) => {
      if (storeData.products.length > 0) {
        storesWithProducts[storeId] = storeData;
      }
    });
    
    return storesWithProducts;

    return (
      <>
        <Box>
          {Object.keys(storesWithProducts).map((storeId) => {
            const { storeName, products: storeProducts } = storesWithProducts[storeId];
            return (
              <Box key={storeId} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                    {storeName}
                  </Typography>
                  <Chip 
                    label={`${storeProducts.length} product${storeProducts.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Grid container spacing={3}>
                  {storeProducts.map((product) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={viewMode === 'list' ? 12 : 6} 
                      md={viewMode === 'list' ? 12 : 4} 
                      lg={viewMode === 'list' ? 12 : 3} 
                      key={product._id}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ProductCard
                          product={product}
                          viewMode={viewMode}
                          onAddToCart={addToCart}
                          onToggleFavorite={(productId) => {
                            const isInFavorites = favorites.some(item => item._id === productId);
                            if (isInFavorites) {
                              removeFromFavorites(productId);
                            } else {
                              addToFavorites(product);
                            }
                          }}
                          isInFavorites={favorites.some(item => item._id === product._id)}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </>
    );
  };

  const renderMobileFilters = () => (
    <>
      <Fab
        color="primary"
        size="medium"
        onClick={() => setShowFilters(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        <FilterList />
      </Fab>

      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{
          sx: { width: 320 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setShowFilters(false)}>
              <Close />
            </IconButton>
          </Box>
          {renderFilters()}
        </Box>
      </Drawer>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant="h4" component="h1">
          Advanced Search
        </Typography>
      </Box>

      {/* Search Bar */}
      {renderSearchBar()}

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            {renderFilters()}
          </Grid>
        )}

        {/* Main Content */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {renderSortAndView()}
          {renderProducts()}
        </Grid>
      </Grid>

      {/* Mobile Filters */}
      {isMobile && renderMobileFilters()}
    </Container>
  );
};

export default AdvancedSearchPage;
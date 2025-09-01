import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Chip,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  LocalOffer as OfferIcon,
  WineBar as WineIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService } from '../../config/api';
import ProductCard from '../widgets/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useStore } from '../../contexts/StoreContext';
import { toast } from 'react-hot-toast';

const SearchPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { selectedStore } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches] = useState([
    'Red Wine', 'White Wine', 'Champagne', 'Beer', 'Spirits'
  ]);

  // AbortController refs for race condition prevention
  const searchAbortControllerRef = useRef(null);
  const productsAbortControllerRef = useRef(null);

  // Fetch search results with AbortController
  const {
    data: searchResults,
    isLoading: searchLoading,
    refetch: refetchSearch,
  } = useQuery(
    ['search', searchQuery],
    async () => {
      if (!searchQuery.trim()) return { success: true, data: [] };
      
      // Abort previous search request if it exists
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      searchAbortControllerRef.current = new AbortController();
      
      try {
        const response = await apiService.get(`/products/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: searchAbortControllerRef.current.signal
        });
        return response;
      } catch (error) {
        // Handle abort errors gracefully
        if (error.name === 'AbortError') {
          console.log('🔍 Search request was aborted');
          return { success: true, data: [] };
        }
        throw error;
      }
    },
    {
      enabled: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch all products for suggestions with AbortController
  const {
    data: allProducts,
    isLoading: productsLoading,
  } = useQuery(
    ['products', selectedStore],
    async () => {
      // Abort previous products request if it exists
      if (productsAbortControllerRef.current) {
        productsAbortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      productsAbortControllerRef.current = new AbortController();
      
      try {
        const params = {};
        // CRITICAL: Filter products by selected store
        if (selectedStore && selectedStore._id) {
          params.store = selectedStore._id;
        }
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        const response = await apiService.get(endpoint, {
          signal: productsAbortControllerRef.current.signal
        });
        return response;
      } catch (error) {
        // Handle abort errors gracefully
        if (error.name === 'AbortError') {
          console.log('🔍 Products request was aborted');
          return { success: true, data: [] };
        }
        throw error;
      }
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Cleanup function to abort pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      if (productsAbortControllerRef.current) {
        productsAbortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      setSearchQuery(query);
      addToRecentSearches(query);
      refetchSearch();
    }
  };

  const addToRecentSearches = (query) => {
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleToggleFavorite = (product) => {
    const isFavorite = favorites.some(item => item._id === product._id);
    if (isFavorite) {
      removeFromFavorites(product._id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(product);
      toast.success('Added to favorites');
    }
  };

  const isFavorite = (product) => {
    return favorites.some(item => item._id === product._id);
  };

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!searchResults?.data || searchResults.data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or browse our categories
          </Typography>
        </Box>
      );
    }

    // Group products by store (only stores with products)
    const productsByStore = searchResults.data.reduce((acc, product) => {
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
      <Box>
        {Object.keys(productsByStore).map((storeId) => {
          const { storeName, products } = productsByStore[storeId];
          return (
            <Box key={storeId} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                  {storeName}
                </Typography>
                <Chip 
                  label={`${products.length} product${products.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onToggleFavorite={() => handleToggleFavorite(product)}
                      isFavorite={isFavorite(product)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderSuggestions = () => {
    if (!allProducts?.data) return null;

    const suggestions = allProducts.data.slice(0, 6);
    
    return (
      <Grid container spacing={3}>
        {suggestions.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <ProductCard
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onToggleFavorite={() => handleToggleFavorite(product)}
              isFavorite={isFavorite(product)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Search Products
          </Typography>
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => navigate('/advanced-search')}
            sx={{ borderRadius: 2 }}
          >
            Advanced Search
          </Button>
        </Box>
        
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search for wines, beers, spirits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchQuery('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* Search Results or Suggestions */}
      {searchQuery ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Search Results for "{searchQuery}"
          </Typography>
          {renderSearchResults()}
        </Box>
      ) : (
        <Box>
          {/* Tabs for different sections */}
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Recent Searches" />
            <Tab label="Trending" />
            <Tab label="Suggestions" />
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Recent Searches
                    </Typography>
                    {recentSearches.length > 0 && (
                      <Button
                        size="small"
                        onClick={clearRecentSearches}
                        color="error"
                      >
                        Clear All
                      </Button>
                    )}
                  </Box>
                  
                  {recentSearches.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No recent searches
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recentSearches.map((search, index) => (
                        <Chip
                          key={index}
                          label={search}
                          onClick={() => handleSearch(search)}
                          icon={<HistoryIcon />}
                          variant="outlined"
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {selectedTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Trending Searches
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {trendingSearches.map((search, index) => (
                      <Chip
                        key={index}
                        label={search}
                        onClick={() => handleSearch(search)}
                        icon={<TrendingIcon />}
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                  
                  {renderSuggestions()}
                </Box>
              )}

              {selectedTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Popular Products
                  </Typography>
                  {renderSuggestions()}
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage;
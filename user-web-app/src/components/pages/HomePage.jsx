import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  useTheme,
  Skeleton,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  // Button, // Unused
  // IconButton, // Unused
  // Avatar, // Unused
  // Badge, // Unused
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn,
  Store,
  ShoppingCart,
  Favorite,
  // Star, // Unused
  // LocalShipping, // Unused
  // AccessTime, // Unused
  // Phone, // Unused
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService, ENDPOINTS } from '../../config/api';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLocation } from '../../contexts/LocationContext';
import { useStore } from '../../contexts/StoreContext';
import toast from 'react-hot-toast';

// Components
import BannerSlider from '../widgets/BannerSlider';
import CategoryGrid from '../widgets/CategoryGrid';
import ProductCard from '../widgets/ProductCard';
import PromotionCard from '../widgets/PromotionCard';
import LocationSelector from '../widgets/LocationSelector';

const HomePage = () => {
  const theme = useTheme();
  const { addToCart, cartItems } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { getAllZones } = useLocation();
  // currentLocation, currentZone, nearbyStores, initializeLocationServices unused
  const { selectedStore } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch products
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery(['products', selectedCategory, selectedStore], async () => {
    const params = {};
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    // CRITICAL: Filter products by selected store
    if (selectedStore && selectedStore._id) {
      params.store = selectedStore._id;
    }
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${ENDPOINTS.products.getAll}?${queryString}` : ENDPOINTS.products.getAll;
    const response = await apiService.get(endpoint);
    return response.data || [];
  });

  // Fetch all stores from all zones
  const {
    data: allStores,
    isLoading: storesLoading,
    error: storesError,
  } = useQuery('allStores', async () => {
    try {
      // Get all zones first
      const zones = await getAllZones();
      console.log('HomePage: Available zones:', zones);
      const allStoresData = [];
      
      // Fetch stores for each zone
      for (const zone of zones) {
        try {
          console.log(`HomePage: Fetching stores for zone ${zone.name} (ID: ${zone.id})`);
          const response = await apiService.get(`/stores/zone/${parseInt(zone.id)}`);
          if (response && response.success && response.data.stores) {
            console.log(`HomePage: Found ${response.data.stores.length} stores in zone ${zone.name}`);
            // Add zone information to each store
            const storesWithZone = response.data.stores.map(store => ({
              ...store,
              zone: {
                id: zone.id,
                name: zone.name,
                distance: zone.maximum_distance
              }
            }));
            allStoresData.push(...storesWithZone);
          } else {
            console.log(`HomePage: No stores found in zone ${zone.name}`);
          }
        } catch (error) {
          console.warn(`Failed to fetch stores for zone ${zone.name}:`, error);
        }
      }
      
      console.log('HomePage: Fetched stores with zones:', allStoresData);
      return allStoresData;
    } catch (error) {
      console.error('Error fetching all stores:', error);
      return [];
    }
  });

  // Use all stores instead of just nearby stores
  const stores = allStores || [];

  // Group stores by zones for better organization
  const storesByZone = React.useMemo(() => {
    const zoneMap = {};
    
    stores.forEach(store => {
      const zoneName = store.zone?.name || 'Unknown Zone';
      if (!zoneMap[zoneName]) {
        zoneMap[zoneName] = [];
      }
      zoneMap[zoneName].push(store);
    });
    
    return zoneMap;
  }, [stores]);

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery('categories', async () => {
    const response = await apiService.get(ENDPOINTS.products.categories);
    return response.data || [];
  });

  // Fetch banners
  const {
    data: banners,
    isLoading: bannersLoading,
  } = useQuery('banners', async () => {
    const response = await apiService.get(ENDPOINTS.banners.active);
    return response.data || [];
  });

  // Fetch promotions
  const {
    data: promotions,
    isLoading: promotionsLoading,
  } = useQuery('promotions', async () => {
    const response = await apiService.get(ENDPOINTS.promotions.getAll);
    return response.data || [];
  });

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleFavorite = (product) => {
    toggleFavorite(product);
    const isFavorite = favorites.some(fav => fav._id === product._id);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Since we're now filtering products by selected store, we can display them directly
  const displayProducts = filteredProducts || [];

  if (productsError || storesError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Failed to load {productsError ? 'products' : 'stores'}. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Location Selector */}
          <Box sx={{ mb: 2 }}>
            <LocationSelector showAsCard={false} compact={true} />
          </Box>

          {/* Search Bar */}
          <Paper elevation={0} sx={{ 
            borderRadius: 3, 
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            <TextField
              fullWidth
              placeholder="Search for products, stores, or categories..."
              value={searchQuery}
              onChange={handleSearch}
              variant="standard"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 2 }}>
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { py: 1.5, px: 1 }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1rem',
                }
              }}
            />
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Banner Slider */}
        <Box sx={{ mb: 4 }}>
          {bannersLoading ? (
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
          ) : (
            <BannerSlider banners={banners || []} />
          )}
        </Box>

                 {/* Quick Stats */}
         <Box sx={{ mb: 4 }}>
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
             <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
               Quick Overview
             </Typography>
             <Divider sx={{ flex: 1, ml: 2 }} />
           </Box>
           <Grid container spacing={3}>
             <Grid item xs={6} sm={3}>
               <motion.div
                 whileHover={{ y: -4, scale: 1.02 }}
                 transition={{ duration: 0.2 }}
               >
                 <Paper elevation={0} sx={{ 
                   p: 3, 
                   textAlign: 'center', 
                   backgroundColor: 'white',
                   borderRadius: 3,
                   border: '1px solid #e0e0e0',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                   }
                 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     width: 56,
                     height: 56,
                     borderRadius: '50%',
                     background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                     mx: 'auto',
                     mb: 2
                   }}>
                     <Store sx={{ fontSize: 28, color: 'white' }} />
                   </Box>
                   <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                     {displayProducts.length}
                   </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                     Available Products
                   </Typography>
                 </Paper>
               </motion.div>
             </Grid>
             <Grid item xs={6} sm={3}>
               <motion.div
                 whileHover={{ y: -4, scale: 1.02 }}
                 transition={{ duration: 0.2 }}
               >
                 <Paper elevation={0} sx={{ 
                   p: 3, 
                   textAlign: 'center', 
                   backgroundColor: 'white',
                   borderRadius: 3,
                   border: '1px solid #e0e0e0',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                   }
                 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     width: 56,
                     height: 56,
                     borderRadius: '50%',
                     background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                     mx: 'auto',
                     mb: 2
                   }}>
                     <ShoppingCart sx={{ fontSize: 28, color: 'white' }} />
                   </Box>
                   <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                     {cartItems.length}
                   </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                     Cart Items
                   </Typography>
                 </Paper>
               </motion.div>
             </Grid>
             <Grid item xs={6} sm={3}>
               <motion.div
                 whileHover={{ y: -4, scale: 1.02 }}
                 transition={{ duration: 0.2 }}
               >
                 <Paper elevation={0} sx={{ 
                   p: 3, 
                   textAlign: 'center', 
                   backgroundColor: 'white',
                   borderRadius: 3,
                   border: '1px solid #e0e0e0',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                   }
                 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     width: 56,
                     height: 56,
                     borderRadius: '50%',
                     background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                     mx: 'auto',
                     mb: 2
                   }}>
                     <Favorite sx={{ fontSize: 28, color: 'white' }} />
                   </Box>
                   <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                     {favorites.length}
                   </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                     Favorites
                   </Typography>
                 </Paper>
               </motion.div>
             </Grid>
             <Grid item xs={6} sm={3}>
               <motion.div
                 whileHover={{ y: -4, scale: 1.02 }}
                 transition={{ duration: 0.2 }}
               >
                 <Paper elevation={0} sx={{ 
                   p: 3, 
                   textAlign: 'center', 
                   backgroundColor: 'white',
                   borderRadius: 3,
                   border: '1px solid #e0e0e0',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                   }
                 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     width: 56,
                     height: 56,
                     borderRadius: '50%',
                     background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                     mx: 'auto',
                     mb: 2
                   }}>
                     <LocationOn sx={{ fontSize: 28, color: 'white' }} />
                   </Box>
                   <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                     {Object.keys(storesByZone).length}
                   </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                     Delivery Zones
                   </Typography>
                 </Paper>
               </motion.div>
             </Grid>
           </Grid>
         </Box>

        {/* Categories */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Browse Categories
            </Typography>
            <Divider sx={{ flex: 1, ml: 2 }} />
          </Box>
          {categoriesLoading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={6} sm={3} key={item}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <CategoryGrid
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          )}
        </Box>

        {/* Promotions */}
        {promotions && promotions.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Special Offers
              </Typography>
              <Divider sx={{ flex: 1, ml: 2 }} />
            </Box>
            <Grid container spacing={3}>
              {promotions.map((promotion) => (
                <Grid item xs={12} sm={6} md={4} key={promotion._id}>
                  <PromotionCard promotion={promotion} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Stores and Products Section */}
        <Box>
          {/* Section Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                {selectedCategory ? 'Filtered Products' : 'All Stores & Products'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCategory ? 'Products in selected category' : selectedStore ? `${selectedStore.name} products` : 'Select a store to view products'}
              </Typography>
            </Box>
            {(productsLoading || storesLoading) && <CircularProgress size={24} />}
          </Box>

                     {/* Zone Summary */}
           {!storesLoading && Object.keys(storesByZone).length > 0 && (
             <Paper elevation={0} sx={{ 
               mb: 4, 
               p: 4, 
               backgroundColor: 'white',
               borderRadius: 4,
               border: '1px solid #e0e0e0',
               boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
             }}>
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                 <Box sx={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   width: 48,
                   height: 48,
                   borderRadius: '50%',
                   backgroundColor: theme.palette.primary.light,
                   mr: 2
                 }}>
                   <LocationOn sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                 </Box>
                 <Box>
                   <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                     Store Distribution by Zones
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     Discover stores across different delivery zones
                   </Typography>
                 </Box>
               </Box>
               
               <Grid container spacing={2}>
                 {Object.entries(storesByZone).map(([zoneName, zoneStores]) => (
                   <Grid item xs={12} sm={6} md={4} lg={3} key={zoneName}>
                     <motion.div
                       whileHover={{ y: -4, scale: 1.02 }}
                       transition={{ duration: 0.2 }}
                     >
                       <Paper
                         elevation={0}
                         sx={{
                           p: 3,
                           borderRadius: 3,
                           border: '2px solid',
                           borderColor: theme.palette.primary.light,
                           backgroundColor: theme.palette.primary.light + '08',
                           cursor: 'pointer',
                           transition: 'all 0.3s ease',
                           '&:hover': {
                             borderColor: theme.palette.primary.main,
                             backgroundColor: theme.palette.primary.light + '12',
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                           }
                         }}
                       >
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <Box sx={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center',
                             width: 40,
                             height: 40,
                             borderRadius: '50%',
                             backgroundColor: theme.palette.primary.main,
                             mr: 2
                           }}>
                             <Store sx={{ color: 'white', fontSize: 20 }} />
                           </Box>
                           <Box sx={{ flex: 1 }}>
                             <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                               {zoneName}
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {zoneStores.length} store{zoneStores.length !== 1 ? 's' : ''} available
                             </Typography>
                           </Box>
                         </Box>
                         
                         <Box sx={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           mt: 2,
                           pt: 2,
                           borderTop: '1px solid',
                           borderColor: 'divider'
                         }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Box sx={{ 
                               width: 8, 
                               height: 8, 
                               borderRadius: '50%', 
                               backgroundColor: theme.palette.success.main 
                             }} />
                             <Typography variant="caption" color="text.secondary">
                               Active Zone
                             </Typography>
                           </Box>
                           <Chip
                             label={zoneStores.length}
                             size="small"
                             sx={{
                               backgroundColor: theme.palette.primary.main,
                               color: 'white',
                               fontWeight: 600,
                               fontSize: '0.75rem'
                             }}
                           />
                         </Box>
                       </Paper>
                     </motion.div>
                   </Grid>
                 ))}
               </Grid>
               
               <Box sx={{ 
                 mt: 3, 
                 pt: 3, 
                 borderTop: '1px solid', 
                 borderColor: 'divider',
                 textAlign: 'center'
               }}>
                 <Typography variant="body2" color="text.secondary">
                   Click on any zone to view stores and products in that area
                 </Typography>
               </Box>
             </Paper>
           )}

          {/* Loading State */}
          {(productsLoading || storesLoading) ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: 400, borderRadius: 3 }}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px 12px 0 0' }} />
                    <CardContent>
                      <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={16} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={16} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Products Content */
            <Box>
              {displayProducts.length === 0 ? (
                <Paper elevation={0} sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  backgroundColor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
                }}>
                  <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedStore ? `No products available in ${selectedStore.name}` : 'No products available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStore ? 'Please select a different store or check back later' : 'Please select a store to view products'}
                  </Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ 
                  backgroundColor: 'white',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {/* Products Header */}
                  <Box sx={{ 
                    p: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}08 0%, ${theme.palette.primary.light}04 100%)`,
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        mr: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        <ShoppingCart sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                          {selectedStore ? `${selectedStore.name} Products` : 'Available Products'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${displayProducts.length} products`}
                            size="medium"
                            icon={<ShoppingCart />}
                            sx={{ 
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              height: 32
                            }}
                          />
                          {selectedStore && (
                            <Chip
                              label={selectedStore.zone?.name || 'Unknown Zone'}
                              size="medium"
                              icon={<LocationOn />}
                              sx={{ 
                                backgroundColor: theme.palette.success.light,
                                color: theme.palette.success.main,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                height: 32
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Products Grid */}
                  <Box sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                      {displayProducts.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <ProductCard
                              product={product}
                              onAddToCart={() => handleAddToCart(product)}
                              onToggleFavorite={() => handleToggleFavorite(product)}
                              isFavorite={favorites.some(fav => fav._id === product._id)}
                            />
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
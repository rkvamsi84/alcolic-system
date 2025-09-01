import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';
import { useFavorites } from '../../contexts/FavoritesContext';
import ProductCard from '../widgets/ProductCard';

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          My Favorites
        </Typography>

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No favorites yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start adding products to your favorites to see them here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {favorites.map((product) => (
              <Grid item xs={6} sm={4} md={3} key={product._id}>
                <ProductCard
                  product={product}
                  onToggleFavorite={() => toggleFavorite(product)}
                  isFavorite={true}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FavoritesPage;
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
} from '@mui/material';
import {
  LocalDrink,
  WineBar,
  SportsBar,
  Liquor,
  LocalBar,
  Restaurant,
  Celebration,
  LocalCafe,
  LocalPizza,
  LocalDining,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CategoryGrid = ({ categories, selectedCategory, onCategorySelect }) => {
  const theme = useTheme();

  // Icon mapping for different category types
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('wine') || name.includes('red') || name.includes('white') || name.includes('rose')) {
      return <WineBar sx={{ fontSize: 32, color: '#8B0000' }} />;
    }
    if (name.includes('beer') || name.includes('ale') || name.includes('lager') || name.includes('stout')) {
      return <SportsBar sx={{ fontSize: 32, color: '#FFA500' }} />;
    }
    if (name.includes('whiskey') || name.includes('whisky') || name.includes('bourbon') || name.includes('scotch')) {
      return <Liquor sx={{ fontSize: 32, color: '#8B4513' }} />;
    }
    if (name.includes('vodka') || name.includes('gin') || name.includes('rum') || name.includes('tequila')) {
      return <LocalBar sx={{ fontSize: 32, color: '#4169E1' }} />;
    }
    if (name.includes('champagne') || name.includes('sparkling') || name.includes('prosecco')) {
      return <Celebration sx={{ fontSize: 32, color: '#FFD700' }} />;
    }
    if (name.includes('cocktail') || name.includes('mixed') || name.includes('drink')) {
      return <LocalCafe sx={{ fontSize: 32, color: '#FF69B4' }} />;
    }
    if (name.includes('food') || name.includes('snack') || name.includes('appetizer')) {
      return <LocalDining sx={{ fontSize: 32, color: '#32CD32' }} />;
    }
    if (name.includes('pizza') || name.includes('fast food')) {
      return <LocalPizza sx={{ fontSize: 32, color: '#FF6347' }} />;
    }
    if (name.includes('restaurant') || name.includes('dining')) {
      return <Restaurant sx={{ fontSize: 32, color: '#FF4500' }} />;
    }
    
    // Default icon for alcoholic beverages
    return <LocalDrink sx={{ fontSize: 32, color: theme.palette.primary.main }} />;
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <Grid container spacing={2}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category._id;

        return (
          <Grid item xs={6} sm={4} md={3} lg={2} key={category._id}>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                onClick={() => handleCategoryClick(category)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: isSelected ? 3 : 1,
                  border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: theme.palette.primary.light,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected 
                      ? theme.palette.primary.light 
                      : theme.palette.grey[50],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isSelected 
                        ? `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.light}10)`
                        : 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01))',
                      pointerEvents: 'none',
                    }
                  }}
                >
                  <Box sx={{ 
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    {getCategoryIcon(category.name)}
                  </Box>
                </Box>
                <CardContent sx={{ 
                  p: 1.5, 
                  textAlign: 'center',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      color: isSelected 
                        ? theme.palette.primary.main 
                        : 'text.primary',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {category.name}
                  </Typography>
                  {category.productCount && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.75rem',
                        opacity: 0.8
                      }}
                    >
                      {category.productCount} products
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CategoryGrid; 
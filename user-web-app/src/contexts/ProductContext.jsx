import React, { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFilters, setProductFilters] = useState({
    category: null,
    priceRange: null,
    rating: null,
    inStock: false,
  });

  const value = {
    selectedProduct,
    setSelectedProduct,
    productFilters,
    setProductFilters,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 
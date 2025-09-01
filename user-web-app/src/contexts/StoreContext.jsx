import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from './LocationContext';
import { toast } from 'react-hot-toast';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [availableStores, setAvailableStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { nearbyStores, currentLocation } = useLocation();

  // Update available stores when nearby stores change
  useEffect(() => {
    console.log('StoreContext: nearbyStores changed:', nearbyStores);
    if (nearbyStores && nearbyStores.length > 0) {
      console.log('StoreContext: Setting available stores:', nearbyStores);
      setAvailableStores(nearbyStores);
      
      // Auto-select the closest store only if:
      // 1. No store is currently selected
      // 2. The selected store is not in the new list of nearby stores (zone changed)
      const shouldAutoSelect = !selectedStore || 
        (selectedStore && !nearbyStores.some(store => store._id === selectedStore._id));
      
      if (shouldAutoSelect && nearbyStores.length > 0) {
        const closestStore = nearbyStores.reduce((closest, store) => {
          return (!closest || store.distance < closest.distance) ? store : closest;
        });
        console.log('StoreContext: Auto-selecting closest store:', closestStore);
        setSelectedStore(closestStore);
        // Only show toast for manual selection, not auto-selection
        // toast.success(`Selected ${closestStore.name} as your store`);
      }
    } else {
      console.log('StoreContext: No nearby stores available');
      // Clear available stores when no nearby stores
      setAvailableStores([]);
    }
  }, [nearbyStores, selectedStore]);

  // Load selected store from localStorage on mount
  useEffect(() => {
    const savedStore = localStorage.getItem('selected_store');
    if (savedStore) {
      try {
        const store = JSON.parse(savedStore);
        setSelectedStore(store);
      } catch (error) {
        console.error('Error loading selected store from localStorage:', error);
        localStorage.removeItem('selected_store');
      }
    }
  }, []);

  // Save selected store to localStorage whenever it changes
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem('selected_store', JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem('selected_store');
    }
  }, [selectedStore]);

  const selectStore = (store) => {
    if (!store) {
      toast.error('Invalid store selection');
      return;
    }
    
    setSelectedStore(store);
    toast.success(`Selected ${store.name} as your store`);
  };

  const clearSelectedStore = () => {
    setSelectedStore(null);
    localStorage.removeItem('selected_store');
    toast('Store selection cleared', { icon: 'ℹ️' });
  };

  // Get the store ID for order placement
  const getSelectedStoreId = () => {
    return selectedStore?._id || null;
  };

  // Check if a store is currently selected
  const hasSelectedStore = () => {
    return selectedStore !== null;
  };

  // Get store by ID from available stores
  const getStoreById = (storeId) => {
    return availableStores.find(store => store._id === storeId) || null;
  };

  // Check if selected store is still available/valid
  const validateSelectedStore = () => {
    if (!selectedStore) return true;
    
    const isStillAvailable = availableStores.some(store => store._id === selectedStore._id);
    if (!isStillAvailable) {
      setSelectedStore(null);
      toast('Your selected store is no longer available. Please select a new store.', { icon: '⚠️' });
      return false;
    }
    return true;
  };

  const value = {
    selectedStore,
    availableStores,
    isLoading,
    selectStore,
    clearSelectedStore,
    getSelectedStoreId,
    hasSelectedStore,
    getStoreById,
    validateSelectedStore,
    setIsLoading
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;
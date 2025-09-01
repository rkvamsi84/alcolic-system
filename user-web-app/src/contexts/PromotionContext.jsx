import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiService } from '../config/api';
import { toast } from 'react-hot-toast';

const PromotionContext = createContext();

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [activePromotion, setActivePromotion] = useState(null);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/promotions/customer');
      if (response.success) {
        setPromotions(response.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate and apply promotion code
  const validatePromotionCode = useCallback(async (code, orderAmount, storeId = null) => {
    try {
      setLoading(true);
      const response = await apiService.post('/promotions/validate', {
        code,
        orderAmount,
        storeId
      });

      if (response.success) {
        const { promotion, discountAmount, finalAmount } = response.data;
        setAppliedPromotion({
          ...promotion,
          discountAmount,
          finalAmount
        });
        toast.success(`Promotion applied! You saved $${discountAmount.toFixed(2)}`);
        return response.data;
      } else {
        toast.error(response.message || 'Invalid promotion code');
        return null;
      }
    } catch (error) {
      console.error('Error validating promotion:', error);
      toast.error('Failed to validate promotion code');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove applied promotion
  const removeAppliedPromotion = useCallback(() => {
    setAppliedPromotion(null);
    toast.success('Promotion removed');
  }, []);

  // Clear all promotion data
  const clearPromotions = useCallback(() => {
    setPromotions([]);
    setActivePromotion(null);
    setAppliedPromotion(null);
  }, []);

  const value = {
    promotions,
    setPromotions,
    activePromotion,
    setActivePromotion,
    appliedPromotion,
    loading,
    fetchPromotions,
    validatePromotionCode,
    removeAppliedPromotion,
    clearPromotions,
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
};
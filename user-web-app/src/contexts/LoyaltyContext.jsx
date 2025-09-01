import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import loyaltyService from '../services/loyaltyService';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load loyalty profile
  const loadLoyaltyProfile = useCallback(async () => {
    // Check authentication before making API call
    if (!user || !token || user.role !== 'customer') {
      console.log('Skipping loyalty profile load - user not authenticated or not customer');
      setLoyaltyData(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await loyaltyService.getProfile();
      setLoyaltyData(response.data);
    } catch (err) {
      console.error('Error loading loyalty profile:', err);
      setError(err.message || 'Failed to load loyalty profile');
      
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setLoyaltyData(loyaltyService.generateMockLoyaltyData());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Load points history
  const loadPointsHistory = async (page = 1, limit = 20, type = null) => {
    try {
      const response = await loyaltyService.getHistory(page, limit, type);
      return response.data;
    } catch (err) {
      console.error('Error loading points history:', err);
      throw err;
    }
  };

  // Load rewards
  const loadRewards = async () => {
    // Check authentication before making API call
    if (!user || !token || user.role !== 'customer') {
      console.log('Skipping rewards load - user not authenticated or not customer');
      return null;
    }

    try {
      const response = await loyaltyService.getRewards();
      return response.data;
    } catch (err) {
      console.error('Error loading rewards:', err);
      throw err;
    }
  };

  // Redeem reward
  const redeemReward = async (rewardId) => {
    try {
      const response = await loyaltyService.redeemReward(rewardId);
      
      // Update local state
      if (loyaltyData) {
        setLoyaltyData(prev => ({
          ...prev,
          points: {
            ...prev.points,
            current: response.data.newBalance
          }
        }));
      }
      
      toast.success('Reward redeemed successfully!');
      return response.data;
    } catch (err) {
      console.error('Error redeeming reward:', err);
      toast.error(err.response?.data?.message || 'Failed to redeem reward');
      throw err;
    }
  };

  // Load tier information
  const loadTierInfo = async () => {
    try {
      const response = await loyaltyService.getTierInfo();
      return response.data;
    } catch (err) {
      console.error('Error loading tier info:', err);
      throw err;
    }
  };

  // Load achievements
  const loadAchievements = async () => {
    // Check authentication before making API call
    if (!user || !token || user.role !== 'customer') {
      console.log('Skipping achievements load - user not authenticated or not customer');
      return null;
    }

    try {
      const response = await loyaltyService.getAchievements();
      return response.data;
    } catch (err) {
      console.error('Error loading achievements:', err);
      throw err;
    }
  };

  // Load referrals
  const loadReferrals = async () => {
    try {
      const response = await loyaltyService.getReferrals();
      return response.data;
    } catch (err) {
      console.error('Error loading referrals:', err);
      throw err;
    }
  };

  // Load referral info (removed unused function to fix ESLint warning)

  // Apply referral code
  const applyReferralCode = async (referralCode) => {
    try {
      const response = await loyaltyService.applyReferralCode(referralCode);
      
      // Update local state
      if (loyaltyData) {
        setLoyaltyData(prev => ({
          ...prev,
          points: {
            ...prev.points,
            current: response.data.newBalance
          }
        }));
      }
      
      toast.success(`Referral code applied! You earned ${response.data.referralBonus} points.`);
      return response.data;
    } catch (err) {
      console.error('Error applying referral code:', err);
      toast.error(err.response?.data?.message || 'Failed to apply referral code');
      throw err;
    }
  };

  // Update loyalty settings
  const updateLoyaltySettings = async (settings) => {
    try {
      const response = await loyaltyService.updateSettings(settings);
      
      // Update local state
      if (loyaltyData) {
        setLoyaltyData(prev => ({
          ...prev,
          settings: response.data.settings
        }));
      }
      
      toast.success('Loyalty settings updated successfully!');
      return response.data;
    } catch (err) {
      console.error('Error updating loyalty settings:', err);
      toast.error(err.response?.data?.message || 'Failed to update loyalty settings');
      throw err;
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await loyaltyService.getStatistics();
      return response.data;
    } catch (err) {
      console.error('Error loading loyalty statistics:', err);
      throw err;
    }
  };

  // Load leaderboard
  const loadLeaderboard = async (type = 'points', limit = 10) => {
    try {
      const response = await loyaltyService.getLeaderboard(type, limit);
      return response.data;
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      throw err;
    }
  };

  // Calculate points from order
  const calculatePointsFromOrder = (orderAmount, tier = null) => {
    const currentTier = tier || (loyaltyData?.tier?.current || 'bronze');
    return loyaltyService.calculatePointsFromOrder(orderAmount, currentTier);
  };

  // Get tier benefits
  const getTierBenefits = (tier = null) => {
    const currentTier = tier || (loyaltyData?.tier?.current || 'bronze');
    return loyaltyService.getTierBenefits(currentTier);
  };

  // Get tier color
  const getTierColor = (tier = null) => {
    const currentTier = tier || (loyaltyData?.tier?.current || 'bronze');
    return loyaltyService.getTierColor(currentTier);
  };

  // Get tier icon
  const getTierIcon = (tier = null) => {
    const currentTier = tier || (loyaltyData?.tier?.current || 'bronze');
    return loyaltyService.getTierIcon(currentTier);
  };

  // Format points
  const formatPoints = (points) => {
    return loyaltyService.formatPoints(points);
  };

  // Format tier name
  const formatTierName = (tier = null) => {
    const currentTier = tier || (loyaltyData?.tier?.current || 'bronze');
    return loyaltyService.formatTierName(currentTier);
  };

  // Check if user can redeem reward
  const canRedeemReward = (rewardCost) => {
    const currentPoints = loyaltyData?.points?.current || 0;
    return loyaltyService.canRedeemReward(currentPoints, rewardCost);
  };

  // Get next tier info
  const getNextTierInfo = () => {
    const currentTier = loyaltyData?.tier?.current || 'bronze';
    const currentPoints = loyaltyData?.points?.lifetime || 0;
    return loyaltyService.getNextTierInfo(currentTier, currentPoints);
  };

  // Calculate progress to next tier
  const calculateTierProgress = () => {
    const currentTier = loyaltyData?.tier?.current || 'bronze';
    const currentPoints = loyaltyData?.points?.lifetime || 0;
    return loyaltyService.calculateTierProgress(currentTier, currentPoints);
  };

  // Get achievement progress
  const getAchievementProgress = (achievement) => {
    if (!loyaltyData) return 0;
    
    const userStats = {
      totalOrders: loyaltyData.statistics?.totalOrders || 0,
      totalSpent: loyaltyData.statistics?.totalSpent || 0,
      lifetimePoints: loyaltyData.points?.lifetime || 0,
      currentTier: loyaltyData.tier?.current || 'bronze'
    };
    
    return loyaltyService.getAchievementProgress(achievement, userStats);
  };

  // Validate referral code
  const validateReferralCode = (code) => {
    return loyaltyService.validateReferralCode(code);
  };

  // Refresh loyalty data
  const refreshLoyaltyData = () => {
    loadLoyaltyProfile();
  };

  // Get available rewards
  const getAvailableRewards = () => {
    if (!loyaltyData) return [];
    
    const currentPoints = loyaltyData.points?.current || 0;
    return loyaltyData.rewards?.filter(reward => 
      reward.isActive && 
      currentPoints >= reward.pointsCost &&
      (!reward.expiresAt || new Date(reward.expiresAt) > new Date())
    ) || [];
  };

  // Get unlocked achievements
  const getUnlockedAchievements = () => {
    if (!loyaltyData) return [];
    return loyaltyData.achievements?.filter(achievement => achievement.unlockedAt) || [];
  };

  // Get locked achievements
  const getLockedAchievements = () => {
    if (!loyaltyData) return [];
    return loyaltyData.achievements?.filter(achievement => !achievement.unlockedAt) || [];
  };

  // Get current tier benefits
  const getCurrentTierBenefits = () => {
    return getTierBenefits();
  };

  // Get points summary
  const getPointsSummary = () => {
    if (!loyaltyData) return null;
    
    return {
      current: loyaltyData.points?.current || 0,
      total: loyaltyData.points?.total || 0,
      lifetime: loyaltyData.points?.lifetime || 0,
      formatted: {
        current: formatPoints(loyaltyData.points?.current || 0),
        total: formatPoints(loyaltyData.points?.total || 0),
        lifetime: formatPoints(loyaltyData.points?.lifetime || 0)
      }
    };
  };

  // Get tier summary
  const getTierSummary = () => {
    if (!loyaltyData) return null;
    
    const currentTier = loyaltyData.tier?.current || 'bronze';
    const benefits = getTierBenefits(currentTier);
    const nextTierInfo = getNextTierInfo();
    const progress = calculateTierProgress();
    
    return {
      current: currentTier,
      name: formatTierName(currentTier),
      icon: getTierIcon(currentTier),
      color: getTierColor(currentTier),
      benefits,
      nextTier: nextTierInfo,
      progress
    };
  };

  // Load initial data
  useEffect(() => {
    // Only load loyalty data if user is authenticated and has customer role
    if (user && token && user.role === 'customer') {
      loadLoyaltyProfile();
      // Don't load other data immediately, let components load them as needed
    } else {
      // Clear loyalty data if user is not authenticated
      setLoyaltyData(null);
      setError(null);
      setLoading(false);
    }
  }, [user, token, loadLoyaltyProfile]);

  const value = {
    // State
    loyaltyData,
    loading,
    error,
    
    // Actions
    loadLoyaltyProfile,
    loadPointsHistory,
    loadRewards,
    redeemReward,
    loadTierInfo,
    loadAchievements,
    loadReferrals,
    applyReferralCode,
    updateLoyaltySettings,
    loadStatistics,
    loadLeaderboard,
    refreshLoyaltyData,
    
    // Utility functions
    calculatePointsFromOrder,
    getTierBenefits,
    getTierColor,
    getTierIcon,
    formatPoints,
    formatTierName,
    canRedeemReward,
    getNextTierInfo,
    calculateTierProgress,
    getAchievementProgress,
    validateReferralCode,
    
    // Computed values
    getAvailableRewards,
    getUnlockedAchievements,
    getLockedAchievements,
    getCurrentTierBenefits,
    getPointsSummary,
    getTierSummary
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};
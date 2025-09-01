import { apiService } from '../config/api';

class LoyaltyService {
  constructor() {
    this.baseURL = '/loyalty';
  }

  // Get user's loyalty profile
  async getProfile() {
    try {
      const response = await apiService.get(`${this.baseURL}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty profile:', error);
      throw error;
    }
  }

  // Get points history
  async getHistory(page = 1, limit = 20, type = null) {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      
      const response = await apiService.get(`${this.baseURL}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty history:', error);
      throw error;
    }
  }

  // Get available rewards
  async getRewards() {
    try {
      const response = await apiService.get(`${this.baseURL}/rewards`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  }

  // Redeem reward
  async redeemReward(rewardId) {
    try {
      const response = await apiService.post(`${this.baseURL}/rewards/redeem`, {
        rewardId
      });
      return response.data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }

  // Get tier information
  async getTierInfo() {
    try {
      const response = await apiService.get(`${this.baseURL}/tier`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tier info:', error);
      throw error;
    }
  }

  // Get achievements
  async getAchievements() {
    try {
      const response = await apiService.get(`${this.baseURL}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  // Get referral information
  async getReferrals() {
    try {
      const response = await apiService.get(`${this.baseURL}/referrals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  }

  // Get referral info
  async getReferralInfo() {
    try {
      const response = await apiService.get(`${this.baseURL}/referral-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referral info:', error);
      throw error;
    }
  }

  // Apply referral code
  async applyReferralCode(referralCode) {
    try {
      const response = await apiService.post(`${this.baseURL}/referrals/apply`, {
        referralCode
      });
      return response.data;
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }

  // Update loyalty settings
  async updateSettings(settings) {
    try {
      const response = await apiService.put(`${this.baseURL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating loyalty settings:', error);
      throw error;
    }
  }

  // Get loyalty statistics
  async getStatistics() {
    try {
      const response = await apiService.get(`${this.baseURL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty statistics:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(type = 'points', limit = 10) {
    try {
      const response = await apiService.get(`${this.baseURL}/leaderboard`, {
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // Calculate points from order amount
  calculatePointsFromOrder(orderAmount, tier = 'bronze') {
    const baseRate = 0.01; // 1 point per $1
    const tierMultipliers = {
      bronze: 1,
      silver: 1.2,
      gold: 1.5,
      platinum: 2,
      diamond: 2.5
    };
    
    const multiplier = tierMultipliers[tier] || 1;
    return Math.floor(orderAmount * baseRate * multiplier);
  }

  // Get tier benefits
  getTierBenefits(tier) {
    const benefits = {
      bronze: {
        discountPercentage: 0,
        freeShipping: false,
        prioritySupport: false,
        exclusiveOffers: false
      },
      silver: {
        discountPercentage: 5,
        freeShipping: true,
        prioritySupport: false,
        exclusiveOffers: true
      },
      gold: {
        discountPercentage: 10,
        freeShipping: true,
        prioritySupport: true,
        exclusiveOffers: true
      },
      platinum: {
        discountPercentage: 15,
        freeShipping: true,
        prioritySupport: true,
        exclusiveOffers: true
      },
      diamond: {
        discountPercentage: 20,
        freeShipping: true,
        prioritySupport: true,
        exclusiveOffers: true
      }
    };

    return benefits[tier] || benefits.bronze;
  }

  // Get tier color
  getTierColor(tier) {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };

    return colors[tier] || colors.bronze;
  }

  // Get tier icon
  getTierIcon(tier) {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💎'
    };

    return icons[tier] || icons.bronze;
  }

  // Format points
  formatPoints(points) {
    return new Intl.NumberFormat().format(points);
  }

  // Format tier name
  formatTierName(tier) {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  // Check if user can redeem reward
  canRedeemReward(userPoints, rewardCost) {
    return userPoints >= rewardCost;
  }

  // Get next tier info
  getNextTierInfo(currentTier, currentPoints) {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const pointsRequired = {
      bronze: 0,
      silver: 100,
      gold: 500,
      platinum: 1000,
      diamond: 2500
    };

    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null;
    }

    const nextTier = tiers[currentIndex + 1];
    const pointsToNextTier = pointsRequired[nextTier] - currentPoints;

    return {
      nextTier,
      pointsToNextTier,
      pointsRequired: pointsRequired[nextTier]
    };
  }

  // Calculate progress to next tier
  calculateTierProgress(currentTier, currentPoints) {
    const nextTierInfo = this.getNextTierInfo(currentTier, currentPoints);
    if (!nextTierInfo) return 100;

    const tierPoints = {
      bronze: 0,
      silver: 100,
      gold: 500,
      platinum: 1000,
      diamond: 2500
    };
    
    const currentTierPoints = tierPoints[currentTier];
    const nextTierPoints = nextTierInfo.pointsRequired;

    const progress = ((currentPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  // Get achievement progress
  getAchievementProgress(achievement, userStats) {
    switch (achievement.type) {
      case 'purchase':
        if (achievement.criteria.totalOrders) {
          return Math.min((userStats.totalOrders / achievement.criteria.totalOrders) * 100, 100);
        }
        if (achievement.criteria.totalSpent) {
          return Math.min((userStats.totalSpent / achievement.criteria.totalSpent) * 100, 100);
        }
        break;
      case 'points':
        if (achievement.criteria.lifetimePoints) {
          return Math.min((userStats.lifetimePoints / achievement.criteria.lifetimePoints) * 100, 100);
        }
        break;
      case 'tier':
        const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const currentIndex = tiers.indexOf(userStats.currentTier);
        const targetIndex = tiers.indexOf(achievement.criteria.tier);
        if (currentIndex >= targetIndex) return 100;
        return (currentIndex / targetIndex) * 100;
      default:
        return 0;
    }
    return 0;
  }

  // Validate referral code format
  validateReferralCode(code) {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  // Generate mock loyalty data for development
  generateMockLoyaltyData() {
    return {
      points: {
        current: 1250,
        total: 1500,
        lifetime: 2000
      },
      tier: {
        current: 'gold',
        pointsRequired: {
          bronze: 0,
          silver: 100,
          gold: 500,
          platinum: 1000,
          diamond: 2500
        }
      },
      rewards: [
        {
          _id: '1',
          type: 'discount',
          name: '$5 Off Next Order',
          description: 'Get $5 off your next order',
          pointsCost: 500,
          value: 5,
          isActive: true
        },
        {
          _id: '2',
          type: 'free_shipping',
          name: 'Free Shipping',
          description: 'Free shipping on your next order',
          pointsCost: 300,
          value: 10,
          isActive: true
        },
        {
          _id: '3',
          type: 'cashback',
          name: '$10 Cashback',
          description: 'Get $10 cashback to your account',
          pointsCost: 1000,
          value: 10,
          isActive: true
        }
      ],
      achievements: [
        {
          name: 'First Purchase',
          type: 'purchase',
          criteria: { totalOrders: 1 },
          pointsReward: 50,
          icon: '🎉',
          unlockedAt: new Date()
        },
        {
          name: 'Silver Member',
          type: 'tier',
          criteria: { tier: 'silver' },
          pointsReward: 150,
          icon: '🥈',
          unlockedAt: new Date()
        },
        {
          name: 'Gold Member',
          type: 'tier',
          criteria: { tier: 'gold' },
          pointsReward: 300,
          icon: '🥇',
          unlockedAt: new Date()
        }
      ],
      referrals: {
        code: 'ABC12345',
        referredUsers: [],
        totalReferrals: 0,
        totalPointsEarned: 0
      },
      statistics: {
        totalOrders: 15,
        totalSpent: 1250,
        averageOrderValue: 83.33,
        lastOrderDate: new Date(),
        memberSince: new Date('2024-01-01'),
        daysActive: 90
      }
    };
  }
}

// Create singleton instance
const loyaltyService = new LoyaltyService();

export default loyaltyService;
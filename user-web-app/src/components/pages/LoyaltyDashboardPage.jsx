import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  EmojiEvents as TrophyIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as DiscountIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  Notifications as NotificationsIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Redeem as RedeemIcon,
  History as HistoryIcon,
  Leaderboard as LeaderboardIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLoyalty } from '../../contexts/LoyaltyContext';
import toast from 'react-hot-toast';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loyalty-tabpanel-${index}`}
      aria-labelledby={`loyalty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Points Card Component
const PointsCard = ({ points, tier }) => {
  const { formatPoints, getTierColor, getTierIcon, formatTierName } = useLoyalty();

  // Add null checks
  if (!points || !tier) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="100px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${getTierColor(tier)}20, ${getTierColor(tier)}10)` }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: getTierColor(tier), mr: 2 }}>
            <Typography variant="h6">{getTierIcon(tier)}</Typography>
          </Avatar>
          <Box>
            <Typography variant="h6" color="primary">
              {formatPoints(points.current || 0)} Points
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTierName(tier)} Member
            </Typography>
          </Box>
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Lifetime Points: {formatPoints(points.lifetime || 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Earned: {formatPoints(points.total || 0)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Tier Progress Component
const TierProgress = ({ tier, progress, nextTier }) => {
  const { getTierColor, getTierIcon, formatTierName } = useLoyalty();

  // Add null checks
  if (!tier || progress === null || progress === undefined) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="100px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: getTierColor(tier), mr: 2 }}>
            <Typography variant="h6">{getTierIcon(tier)}</Typography>
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">{formatTierName(tier)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {Number(progress || 0).toFixed(1)}% to next tier
            </Typography>
          </Box>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={Number(progress || 0)} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getTierColor(tier)
            }
          }} 
        />
        
        {nextTier && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {nextTier.pointsToNextTier} points to {formatTierName(nextTier.nextTier)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Rewards Component
const RewardsSection = () => {
  const { getAvailableRewards, redeemReward, canRedeemReward, formatPoints } = useLoyalty();
  const [redeeming, setRedeeming] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const availableRewards = getAvailableRewards();

  const handleRedeem = async (reward) => {
    setSelectedReward(reward);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;
    
    try {
      setRedeeming(true);
      await redeemReward(selectedReward._id);
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
    } finally {
      setRedeeming(false);
    }
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'discount': return <DiscountIcon />;
      case 'free_shipping': return <ShippingIcon />;
      case 'cashback': return <TrendingUpIcon />;
      case 'product': return <GiftIcon />;
      case 'service': return <SupportIcon />;
      default: return <GiftIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Available Rewards
      </Typography>
      
      {availableRewards.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <GiftIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No rewards available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earn more points to unlock rewards
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {availableRewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward._id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {getRewardIcon(reward.type)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{reward.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reward.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="primary">
                      ${reward.value}
                    </Typography>
                    <Chip 
                      label={`${formatPoints(reward.pointsCost)} pts`}
                      color="secondary"
                      size="small"
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<RedeemIcon />}
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeemReward(reward.pointsCost)}
                  >
                    Redeem
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Redeem Confirmation Dialog */}
      <Dialog open={!!selectedReward} onClose={() => setSelectedReward(null)}>
        <DialogTitle>Confirm Reward Redemption</DialogTitle>
        <DialogContent>
          {selectedReward && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to redeem "{selectedReward.name}" for {formatPoints(selectedReward.pointsCost)} points?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReward(null)}>Cancel</Button>
          <Button 
            onClick={confirmRedeem} 
            variant="contained" 
            disabled={redeeming}
          >
            {redeeming ? 'Redeeming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Achievements Component
const AchievementsSection = () => {
  const { getUnlockedAchievements, getLockedAchievements, getAchievementProgress } = useLoyalty();
  const [activeTab, setActiveTab] = useState(0);

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Achievements
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Unlocked (${unlockedAchievements.length})`} />
          <Tab label={`Locked (${lockedAchievements.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {unlockedAchievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.name}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <Typography variant="h6">{achievement.icon}</Typography>
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{achievement.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        +{achievement.pointsReward} points
                      </Typography>
                    </Box>
                    <CheckCircleIcon color="success" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {lockedAchievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.name}>
              <Card sx={{ height: '100%', opacity: 0.7 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'grey.400', mr: 2 }}>
                      <Typography variant="h6">{achievement.icon}</Typography>
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{achievement.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        +{achievement.pointsReward} points
                      </Typography>
                    </Box>
                    <LockIcon color="disabled" />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progress: {getAchievementProgress(achievement).toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getAchievementProgress(achievement)} 
                      sx={{ height: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};

// Referrals Component
const ReferralsSection = () => {
  const { loyaltyData, applyReferralCode, validateReferralCode } = useLoyalty();
  const [referralCode, setReferralCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const handleApplyReferral = async () => {
    if (!validateReferralCode(referralCode)) {
      toast.error('Invalid referral code format');
      return;
    }

    try {
      setApplying(true);
      await applyReferralCode(referralCode);
      setReferralCode('');
      setShowApplyDialog(false);
    } catch (error) {
      console.error('Error applying referral code:', error);
    } finally {
      setApplying(false);
    }
  };

  const copyReferralCode = () => {
    if (loyaltyData?.referrals?.code) {
      navigator.clipboard.writeText(loyaltyData.referrals.code);
      toast.success('Referral code copied to clipboard!');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Referrals
      </Typography>
      
      <Grid container spacing={3}>
        {/* My Referral Code */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Referral Code
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  value={loyaltyData?.referrals?.code || 'Loading...'}
                  InputProps={{ readOnly: true }}
                  sx={{ mr: 2 }}
                />
                <IconButton onClick={copyReferralCode} color="primary">
                  <CopyIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Share this code with friends to earn bonus points!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Apply Referral Code */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Apply Referral Code
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setShowApplyDialog(true)}
                disabled={loyaltyData?.referrals?.referredBy}
              >
                {loyaltyData?.referrals?.referredBy ? 'Already Applied' : 'Apply Code'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" mt={1}>
                Enter a friend's referral code to earn bonus points
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Referral Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Referral Statistics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {loyaltyData?.referrals?.totalReferrals || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Referrals
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {loyaltyData?.referrals?.totalPointsEarned || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points Earned
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Referral Dialog */}
      <Dialog open={showApplyDialog} onClose={() => setShowApplyDialog(false)}>
        <DialogTitle>Apply Referral Code</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Referral Code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character code"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApplyDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleApplyReferral} 
            variant="contained" 
            disabled={applying || !referralCode}
          >
            {applying ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Settings Component
const SettingsSection = () => {
  const { loyaltyData, updateLoyaltySettings } = useLoyalty();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoRedeem: false,
    privacyLevel: 'public'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loyaltyData?.settings) {
      setSettings(loyaltyData.settings);
    }
  }, [loyaltyData]);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateLoyaltySettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Loyalty Settings
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
            }
            label="Email Notifications"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
            }
            label="Push Notifications"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoRedeem}
                onChange={(e) => handleSettingChange('autoRedeem', e.target.checked)}
              />
            }
            label="Auto-redeem rewards when available"
          />
          
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Main Loyalty Dashboard Component
const LoyaltyDashboardPage = () => {
  const { loyaltyData, loading, error, getPointsSummary, getTierSummary } = useLoyalty();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const pointsSummary = getPointsSummary();
  const tierSummary = getTierSummary();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom>
          Loyalty Program
        </Typography>
        
        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <PointsCard points={pointsSummary || { current: 0, total: 0, lifetime: 0 }} tier={tierSummary?.current || 'bronze'} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TierProgress 
              tier={tierSummary?.current || 'bronze'}
              progress={tierSummary?.progress || 0}
              nextTier={tierSummary?.nextTier}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Rewards" />
            <Tab label="Achievements" />
            <Tab label="Referrals" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Tier Benefits */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tierSummary?.name} Benefits
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DiscountIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${tierSummary?.benefits?.discountPercentage || 0}% Discount`}
                        secondary="On eligible purchases"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ShippingIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Free Shipping"
                        secondary={tierSummary?.benefits?.freeShipping ? "Available" : "Not available"}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <SupportIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Priority Support"
                        secondary={tierSummary?.benefits?.prioritySupport ? "Available" : "Standard support"}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Exclusive Offers"
                        secondary={tierSummary?.benefits?.exclusiveOffers ? "Available" : "Not available"}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <HistoryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${loyaltyData?.statistics?.totalOrders || 0} Orders`}
                        secondary="Total orders placed"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <AnalyticsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`$${loyaltyData?.statistics?.totalSpent?.toFixed(2) || 0}`}
                        secondary="Total amount spent"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TrophyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${loyaltyData?.achievements?.length || 0} Achievements`}
                        secondary="Unlocked achievements"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ShareIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${loyaltyData?.referrals?.totalReferrals || 0} Referrals`}
                        secondary="Successful referrals"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <RewardsSection />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <AchievementsSection />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <ReferralsSection />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <SettingsSection />
        </TabPanel>
      </motion.div>
    </Container>
  );
};

export default LoyaltyDashboardPage;
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Security as SecurityIcon,
  TwoWheeler as TwoFAIcon,
  Computer as SessionIcon,
  History as HistoryIcon,
  Lock as PasswordIcon,
  LocationOn as IPIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  QrCode as QRCodeIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSecurity } from '../../contexts/SecurityContext';
import { useLanguage } from '../../contexts/LanguageContext';

const SecuritySettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const {
    securitySettings,
    activeSessions,
    loginHistory,
    loading,
    setup2FA,
    verify2FA,
    disable2FA,
    updateSecurityPreferences,
    revokeSession,
    revokeAllOtherSessions,
    changePassword,
    updateIPRestrictions,
    generateBackupCodes,
    validatePasswordStrength
  } = useSecurity();

  // State for dialogs
  const [twoFADialog, setTwoFADialog] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFASetup, setTwoFASetup] = useState(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [ipDialog, setIPDialog] = useState(false);
  const [allowedIPs, setAllowedIPs] = useState('');
  const [blockedIPs, setBlockedIPs] = useState('');
  const [backupCodesDialog, setBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  // Password validation
  const passwordValidation = newPassword ? validatePasswordStrength(newPassword) : { isValid: true, errors: [], score: 0 };
  const passwordsMatch = newPassword === confirmPassword;
  
  // Ensure boolean values for error props
  const newPasswordError = Boolean(newPassword && !passwordValidation.isValid);
  const confirmPasswordError = Boolean(confirmPassword && !passwordsMatch);

  // Handle 2FA setup
  const handle2FASetup = async () => {
    try {
      const setupData = await setup2FA();
      setTwoFASetup(setupData);
      setTwoFADialog(true);
    } catch (error) {
      console.error('2FA setup error:', error);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async () => {
    try {
      await verify2FA(twoFAToken);
      setTwoFADialog(false);
      setTwoFAToken('');
      setTwoFASetup(null);
    } catch (error) {
      console.error('2FA verification error:', error);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    try {
      await disable2FA(twoFAToken);
      setTwoFADialog(false);
      setTwoFAToken('');
    } catch (error) {
      console.error('2FA disable error:', error);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwordsMatch) {
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  // Handle IP restrictions update
  const handleIPRestrictionsUpdate = async () => {
    try {
      const allowedIPsArray = allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip);
      const blockedIPsArray = blockedIPs.split(',').map(ip => ip.trim()).filter(ip => ip);
      
      await updateIPRestrictions(allowedIPsArray, blockedIPsArray);
      setIPDialog(false);
      setAllowedIPs('');
      setBlockedIPs('');
    } catch (error) {
      console.error('IP restrictions update error:', error);
    }
  };

  // Handle backup codes generation
  const handleGenerateBackupCodes = async () => {
    try {
      const codes = await generateBackupCodes();
      setBackupCodes(codes);
      setBackupCodesDialog(true);
    } catch (error) {
      console.error('Backup codes generation error:', error);
    }
  };

  // Handle security preferences update
  const handleSecurityPreferencesUpdate = async (key, value) => {
    try {
      const updatedPreferences = {
        ...securitySettings?.securityPreferences,
        [key]: value
      };
      await updateSecurityPreferences(updatedPreferences);
    } catch (error) {
      console.error('Security preferences update error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (session) => {
    const deviceInfo = session.deviceInfo;
    return `${deviceInfo.userAgent?.split(' ')[0] || 'Unknown'} - ${deviceInfo.ip || 'Unknown IP'}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h6">Loading security settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon />
          Security Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Two-Factor Authentication */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TwoFAIcon />
                  Two-Factor Authentication
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add an extra layer of security to your account with two-factor authentication.
                  </Typography>
                  
                  <Chip
                    label={securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    color={securitySettings?.twoFactorEnabled ? 'success' : 'default'}
                    sx={{ mb: 2 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {!securitySettings?.twoFactorEnabled ? (
                    <Button
                      variant="contained"
                      onClick={handle2FASetup}
                      startIcon={<TwoFAIcon />}
                    >
                      Setup 2FA
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => setTwoFADialog(true)}
                        startIcon={<TwoFAIcon />}
                      >
                        Disable 2FA
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleGenerateBackupCodes}
                        startIcon={<KeyIcon />}
                      >
                        Generate Backup Codes
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Security */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PasswordIcon />
                  Password Security
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Change your password and ensure it meets security requirements.
                  </Typography>
                  
                  {securitySettings?.passwordExpiresAt && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Password expires: {formatDate(securitySettings.passwordExpiresAt)}
                    </Alert>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={() => setPasswordDialog(true)}
                  startIcon={<PasswordIcon />}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Preferences */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon />
                  Security Preferences
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure your security preferences and notifications.
                  </Typography>
                </Box>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Require 2FA"
                      secondary="Force two-factor authentication for all logins"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={securitySettings?.securityPreferences?.require2FA || false}
                        onChange={(e) => handleSecurityPreferencesUpdate('require2FA', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Notify on new login"
                      secondary="Receive notifications when logging in from new devices"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={securitySettings?.securityPreferences?.notifyOnNewLogin || false}
                        onChange={(e) => handleSecurityPreferencesUpdate('notifyOnNewLogin', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Notify on password change"
                      secondary="Receive notifications when password is changed"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={securitySettings?.securityPreferences?.notifyOnPasswordChange || false}
                        onChange={(e) => handleSecurityPreferencesUpdate('notifyOnPasswordChange', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* IP Restrictions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IPIcon />
                  IP Restrictions
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Control access to your account by IP address restrictions.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setIPDialog(true)}
                  startIcon={<IPIcon />}
                >
                  Manage IP Restrictions
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Sessions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SessionIcon />
                  Active Sessions ({activeSessions.length})
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage your active sessions across different devices.
                  </Typography>
                </Box>

                <List>
                  {activeSessions.map((session) => (
                    <ListItem key={session.id}>
                      <ListItemText
                        primary={getDeviceInfo(session)}
                        secondary={`Last activity: ${formatDate(session.lastActivity)}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {session.isCurrent && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                          {!session.isCurrent && (
                            <IconButton
                              onClick={() => revokeSession(session.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {activeSessions.length > 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={revokeAllOtherSessions}
                      startIcon={<DeleteIcon />}
                    >
                      Revoke All Other Sessions
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Login History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon />
                  Login History
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Recent login attempts and their status.
                  </Typography>
                </Box>

                <List>
                  {loginHistory.slice(0, 10).map((login, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${login.ip} - ${login.userAgent?.split(' ')[0] || 'Unknown'}`}
                        secondary={formatDate(login.timestamp)}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={login.success ? 'Success' : 'Failed'}
                          color={login.success ? 'success' : 'error'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 2FA Setup Dialog */}
        <Dialog open={twoFADialog} onClose={() => setTwoFADialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {securitySettings?.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
          </DialogTitle>
          <DialogContent>
            {!securitySettings?.twoFactorEnabled && twoFASetup && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" paragraph>
                  Scan this QR code with your authenticator app:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img src={twoFASetup.qrCode} alt="QR Code" style={{ maxWidth: 200 }} />
                </Box>
                <Typography variant="body2" paragraph>
                  Or enter this secret manually: <code>{twoFASetup.secret}</code>
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Save these backup codes in a secure location:
                  <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {twoFASetup.backupCodes.join(' ')}
                  </Box>
                </Alert>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Verification Code"
              value={twoFAToken}
              onChange={(e) => setTwoFAToken(e.target.value)}
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTwoFADialog(false)}>Cancel</Button>
            <Button
              onClick={securitySettings?.twoFactorEnabled ? handle2FADisable : handle2FAVerification}
              variant="contained"
            >
              {securitySettings?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(!showPasswords)}
                    edge="end"
                  >
                    {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              error={newPasswordError}
              helperText={newPassword && passwordValidation.errors.join(', ')}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              error={confirmPasswordError}
              helperText={confirmPassword && !passwordsMatch ? 'Passwords do not match' : ''}
            />

            {newPassword && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Password Strength: {passwordValidation.score}/5
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Box
                      key={level}
                      sx={{
                        width: 20,
                        height: 4,
                        backgroundColor: level <= passwordValidation.score ? 'success.main' : 'grey.300',
                        borderRadius: 1
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={!passwordValidation.isValid || !passwordsMatch || !currentPassword}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* IP Restrictions Dialog */}
        <Dialog open={ipDialog} onClose={() => setIPDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manage IP Restrictions</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Allowed IPs (comma-separated)"
              value={allowedIPs}
              onChange={(e) => setAllowedIPs(e.target.value)}
              margin="normal"
              helperText="Leave empty to allow all IPs"
            />
            
            <TextField
              fullWidth
              label="Blocked IPs (comma-separated)"
              value={blockedIPs}
              onChange={(e) => setBlockedIPs(e.target.value)}
              margin="normal"
              helperText="IPs that are not allowed to access your account"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIPDialog(false)}>Cancel</Button>
            <Button onClick={handleIPRestrictionsUpdate} variant="contained">
              Update Restrictions
            </Button>
          </DialogActions>
        </Dialog>

        {/* Backup Codes Dialog */}
        <Dialog open={backupCodesDialog} onClose={() => setBackupCodesDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Backup Codes</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Save these backup codes in a secure location. Each code can only be used once.
            </Alert>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
              gap: 1,
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              {backupCodes.map((code, index) => (
                <Box key={index} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {code}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBackupCodesDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default SecuritySettingsPage;
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Translate as TranslateIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../contexts/LanguageContext';
import LanguageSelector from '../widgets/LanguageSelector';

const LanguageSettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentLanguage, changeLanguage, t, getCurrentLanguageConfig, getSupportedLanguages } = useLanguage();

  const currentLanguageConfig = getCurrentLanguageConfig();
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  const getLanguageFeatures = (language) => {
    const features = [];
    
    if (language.rtl) {
      features.push('RTL Support');
    }
    
    features.push('Full Translation');
    features.push('Native Interface');
    
    return features;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <LanguageIcon />
          {t('language')} {t('settings')}
        </Typography>

        {/* Current Language Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="primary" />
              {t('currentLanguage')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4">
                {currentLanguageConfig.flag}
              </Typography>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {currentLanguageConfig.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentLanguageConfig.nativeName}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getLanguageFeatures(currentLanguageConfig).map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Language Selector */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TranslateIcon />
              {t('selectLanguage')}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <LanguageSelector variant="button" size="large" />
            </Box>
          </CardContent>
        </Card>

        {/* Available Languages */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon />
              {t('availableLanguages')}
            </Typography>
            
            <List>
              {supportedLanguages.map((language, index) => (
                <React.Fragment key={language.code}>
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: currentLanguage === language.code ? 'primary.light' : 'transparent',
                      '&:hover': {
                        backgroundColor: currentLanguage === language.code ? 'primary.main' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleLanguageChange(language.code)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon>
                        <Typography variant="h5">
                          {language.flag}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={currentLanguage === language.code ? 600 : 500} component="span">
                              {language.name}
                            </Typography>
                            {currentLanguage === language.code && (
                              <CheckCircleIcon color="primary" fontSize="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="text.secondary" component="span">
                              {language.nativeName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              {getLanguageFeatures(language).map((feature) => (
                                <Chip
                                  key={feature}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem', height: 20 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < supportedLanguages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Language Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  {t('languageFeatures')}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Our multi-language support includes:
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Complete interface translation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="RTL support for Arabic" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Native language names" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Automatic language detection" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Language preference saving" />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  {t('languageTips')}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" component="span">
                      Your language preference is saved locally and will be remembered on your next visit.
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Tips:</strong>
                  </Typography>
                  
                  <Box component="ul" sx={{ margin: 0, paddingLeft: '1.5rem', color: 'text.secondary', fontSize: '0.875rem' }}>
                    <li>Language changes are applied immediately</li>
                    <li>RTL languages automatically adjust the layout</li>
                    <li>Some content may remain in English if not yet translated</li>
                    <li>You can change language at any time</li>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Language Statistics */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Language Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {supportedLanguages.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported Languages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {supportedLanguages.filter(lang => lang.rtl).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    RTL Languages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {supportedLanguages.filter(lang => !lang.rtl).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    LTR Languages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    100%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Translation Coverage
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default LanguageSettingsPage;
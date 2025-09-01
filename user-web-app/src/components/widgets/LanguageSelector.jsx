import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Language as LanguageIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../contexts/LanguageContext';

const LanguageSelector = ({ variant = 'button', size = 'medium' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentLanguage, changeLanguage, getCurrentLanguageConfig, getSupportedLanguages } = useLanguage();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguageConfig = getCurrentLanguageConfig();
  const supportedLanguages = getSupportedLanguages();

  if (variant === 'icon') {
    return (
      <Box>
        <Tooltip title="Select Language">
          <IconButton
            onClick={handleClick}
            sx={{
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1
            }
          }}
        >
          {supportedLanguages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={currentLanguage === language.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                px: 2
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Typography variant="h6">{language.flag}</Typography>
              </ListItemIcon>
              <ListItemText
                primary={language.name}
                secondary={language.nativeName}
                primaryTypographyProps={{
                  fontWeight: currentLanguage === language.code ? 600 : 400
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        variant="outlined"
        size={size}
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          minWidth: isMobile ? 'auto' : 140,
          px: isMobile ? 1 : 2,
          py: isMobile ? 0.5 : 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.light',
            color: 'primary.contrastText'
          }
        }}
      >
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
              {currentLanguageConfig.flag}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {currentLanguageConfig.code.toUpperCase()}
            </Typography>
          </Box>
        )}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 250,
            mt: 1,
            boxShadow: theme.shadows[8],
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
            Select Language
          </Typography>
        </Box>
        
        {supportedLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              px: 2,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main'
                }
              },
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                {language.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={language.name}
              secondary={language.nativeName}
              primaryTypographyProps={{
                fontWeight: currentLanguage === language.code ? 600 : 500,
                fontSize: '0.9rem'
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: currentLanguage === language.code ? 'inherit' : 'text.secondary',
                opacity: 0.8
              }}
            />
            {currentLanguage === language.code && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  ml: 1
                }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector; 
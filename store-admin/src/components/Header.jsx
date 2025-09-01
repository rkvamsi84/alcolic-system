import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LiquorIcon from '@mui/icons-material/Liquor';
import { useAuth } from '../auth/AuthContext';
import ProfileMenu from './ProfileMenu';
import GlobalSearchBar from './GlobalSearchBar';
import ThemeToggleButton from './ThemeToggleButton';

const Header = ({ onSidebarToggle, mode, toggleMode }) => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <LiquorIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Liquor Store Admin
          </Typography>
        </Box>

        <GlobalSearchBar />

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggleButton mode={mode} toggleMode={toggleMode} />
          <ProfileMenu user={user} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

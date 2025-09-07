import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getToken, getUser, logout } from '../utils/auth';

export default function Header() {
  const token = getToken();
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Title (center via flexGrow) */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none' }}
          >
Blog Application          </Typography>
        </Box>

        {/* Right-side buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!token ? (
            <>
              <Button color="inherit" component={RouterLink} to="/signin">
                Sign In
              </Button>
              <Button color="inherit" component={RouterLink} to="/signup">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/write">
                Write
              </Button>
              {user?.roles?.includes('APP_ADMIN') && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Admin
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

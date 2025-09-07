import React, { useState } from 'react';
import api from '../services/api';
import { TextField, Button, Box, Paper, Typography } from '@mui/material';
import { setToken, setUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  async function handleSubmit() {
    try {
      const res = await api.post('/auth/signin', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      nav('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Signin failed');
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h6" gutterBottom align="center">
          Sign In
        </Typography>
        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button fullWidth variant="contained" onClick={handleSubmit}>
          Sign In
        </Button>
      </Paper>
    </Box>
  );
}

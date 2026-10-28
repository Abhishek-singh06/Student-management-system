import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);
    const result = await login(usernameOrEmail.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials. Use admin / password123.');
    }
  };

  const handleDemoFill = () => {
    setUsernameOrEmail('admin');
    setPassword('password123');
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Logo / Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5
              }}
            >
              <SchoolIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Student Management System
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Administrator Sign In • DBMS Project
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '6px', fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username or Email"
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  '& fieldset': { borderColor: '#cbd5e1' }
                }
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  '& fieldset': { borderColor: '#cbd5e1' }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2.5,
                mb: 2,
                py: 1,
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                borderRadius: '6px',
                boxShadow: 'none'
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In as Admin'}
            </Button>
          </form>

          {/* Demo Helper Box for College Review */}
          <Box
            sx={{
              p: 2,
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              textAlign: 'center',
              mt: 1
            }}
          >
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontWeight: 600, mb: 0.5 }}>
              College Review Demo Credentials:
            </Typography>
            <Typography variant="caption" sx={{ color: '#0f172a', fontFamily: 'monospace' }}>
              admin / password123
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                startIcon={<LockOpenIcon sx={{ fontSize: 16 }} />}
                onClick={handleDemoFill}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#2563eb', p: 0 }}
              >
                Auto-fill Credentials
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

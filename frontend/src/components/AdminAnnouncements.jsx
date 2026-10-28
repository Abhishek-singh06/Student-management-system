import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const AdminAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications', { params: { role: 'ADMIN' } });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to load published announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both title and announcement body.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = { title, message, targetRole };
      await api.post('/notifications', payload);
      setSuccess('Announcement broadcasted successfully!');
      setTitle('');
      setMessage('');
      setTargetRole('ALL');
      fetchHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
        Broadcast Announcements
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Form Panel */}
        <Grid item xs={12} md={5}>
          <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>New Broadcast</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Announcement Title"
                variant="outlined"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputLabelProps={{ style: { color: '#9ca3af' } }}
                InputProps={{ style: { color: '#ffffff' } }}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#9ca3af' }}>Target Audience</InputLabel>
                <Select
                  value={targetRole}
                  label="Target Audience"
                  onChange={(e) => setTargetRole(e.target.value)}
                  sx={{ color: '#ffffff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <MenuItem value="ALL">All Portals</MenuItem>
                  <MenuItem value="STUDENT">Students Only</MenuItem>
                  <MenuItem value="FACULTY">Faculty Only</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Announcement Message"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputLabelProps={{ style: { color: '#9ca3af' } }}
                InputProps={{ style: { color: '#ffffff' } }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SendIcon />}
                disabled={submitting}
                fullWidth
                sx={{ textTransform: 'none', borderRadius: '6px' }}
              >
                {submitting ? <CircularProgress size={20} /> : 'Publish Announcement'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* History Panel */}
        <Grid item xs={12} md={7}>
          <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Published History</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress sx={{ color: '#10b981' }} />
              </Box>
            ) : (
              <List>
                {history.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic', py: 2 }}>
                    No announcements published yet.
                  </Typography>
                ) : (
                  history.map((notif, idx) => (
                    <React.Fragment key={notif.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                {notif.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {notif.date} ({notif.targetRole})
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
                              {notif.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < history.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </React.Fragment>
                  ))
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnnouncements;

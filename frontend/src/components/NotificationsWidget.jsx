import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationsWidget = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (user?.role) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications', {
        params: { role: user.role }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load portal notifications.');
    }
  };

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleOpen} sx={{ color: '#ffffff' }}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            backgroundColor: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Announcements & Notifications
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <MenuItem onClick={handleClose}>
              <Typography variant="body2" color="#9ca3af" sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                No recent notifications.
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((notif) => (
              <ListItem key={notif.id} alignItems="flex-start" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {notif.date}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5, lineHeight: 1.4 }}>
                      {notif.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </Box>
  );
};

export default NotificationsWidget;

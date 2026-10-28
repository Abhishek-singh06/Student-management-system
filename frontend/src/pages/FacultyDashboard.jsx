import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommonSchedule from '../components/CommonSchedule';
import FacultyAttendance from '../components/FacultyAttendance';
import FacultyMarks from '../components/FacultyMarks';
import NotificationsWidget from '../components/NotificationsWidget';
import ThemeToggle from '../components/ThemeToggle';

const FacultyDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'timetable', 'attendance', 'marks'

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'timetable', label: 'Timetable', icon: <CalendarTodayIcon /> },
    { id: 'attendance', label: 'Attendance Logs', icon: <AssignmentTurnedInIcon /> },
    { id: 'marks', label: 'Upload Grades', icon: <AssignmentIcon /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'timetable':
        return <CommonSchedule type="faculty" />;
      case 'attendance':
        return <FacultyAttendance />;
      case 'marks':
        return <FacultyMarks />;
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper className="glass-panel" sx={{ p: 4, backgroundColor: 'rgba(17, 24, 39, 0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Academic Operations
                </Typography>
                <Typography variant="body1" color="#d1d5db" sx={{ mb: 2 }}>
                  Welcome back, Instructor. Access your assigned courses, upload student lecture attendance logs, and record grades for internal assessments and finals.
                </Typography>
                <Typography variant="body2" color="#9ca3af">
                  Use the "Timetable" tab in the sidebar to review your teaching lecture calendar for this academic semester.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper className="glass-panel" sx={{ p: 4, backgroundColor: 'rgba(17, 24, 39, 0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Info
                </Typography>
                <Typography variant="body2" color="#d1d5db" sx={{ mb: 1 }}>
                  • Profile Status: <strong>Active</strong>
                </Typography>
                <Typography variant="body2" color="#d1d5db">
                  • Role Authorization: <strong>Faculty Instructor</strong>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      {/* Sidebar Navigation */}
      <Box 
        sx={{ 
          width: 260, 
          borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          backgroundColor: 'rgba(17, 24, 39, 0.5)'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 4, color: '#3b82f6' }}>
            CMS Faculty
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  color: activeTab === item.id ? '#3b82f6' : '#9ca3af',
                  backgroundColor: activeTab === item.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Button 
          variant="outlined" 
          color="error" 
          fullWidth
          startIcon={<ExitToAppIcon />} 
          onClick={logout}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        {/* Header bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff' }}>
              {menuItems.find(item => item.id === activeTab)?.label} Portal
            </Typography>
            <Typography variant="body2" color="#9ca3af">
              Faculty: {user?.username} (ID: {user?.id})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
            <NotificationsWidget />
          </Box>
        </Box>

        <Container maxWidth="xl" sx={{ p: 0, m: 0 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default FacultyDashboard;

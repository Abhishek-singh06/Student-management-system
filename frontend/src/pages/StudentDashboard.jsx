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
import BookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import StudentCourses from '../components/StudentCourses';
import CommonSchedule from '../components/CommonSchedule';
import StudentAttendance from '../components/StudentAttendance';
import StudentMarks from '../components/StudentMarks';
import StudentHostelLibrary from '../components/StudentHostelLibrary';
import StudentPlacements from '../components/StudentPlacements';
import NotificationsWidget from '../components/NotificationsWidget';
import ThemeToggle from '../components/ThemeToggle';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'courses', 'timetable', 'attendance', 'marks', 'facilities', 'placements'

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'courses', label: 'Courses', icon: <BookIcon /> },
    { id: 'timetable', label: 'Timetable', icon: <CalendarTodayIcon /> },
    { id: 'attendance', label: 'Attendance', icon: <AssignmentTurnedInIcon /> },
    { id: 'marks', label: 'Report Card', icon: <AssignmentIcon /> },
    { id: 'facilities', label: 'Facilities', icon: <HomeIcon /> },
    { id: 'placements', label: 'Placements', icon: <WorkIcon /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <StudentCourses />;
      case 'timetable':
        return <CommonSchedule type="student" />;
      case 'attendance':
        return <StudentAttendance />;
      case 'marks':
        return <StudentMarks />;
      case 'facilities':
        return <StudentHostelLibrary />;
      case 'placements':
        return <StudentPlacements />;
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper className="glass-panel" sx={{ p: 4, backgroundColor: 'rgba(17, 24, 39, 0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Student Hub
                </Typography>
                <Typography variant="body1" color="#d1d5db" sx={{ mb: 2 }}>
                  Welcome back to your academic console. Review your registered classes, attendance records, exam results, hostel status, and checkout library books.
                </Typography>
                <Typography variant="body2" color="#9ca3af">
                  Use the "Courses" tab to register or withdraw from elective courses, and the "Timetable" tab to review your class calendar.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper className="glass-panel" sx={{ p: 4, backgroundColor: 'rgba(17, 24, 39, 0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Info
                </Typography>
                <Typography variant="body2" color="#d1d5db" sx={{ mb: 1 }}>
                  • Student Status: <strong>Active</strong>
                </Typography>
                <Typography variant="body2" color="#d1d5db" sx={{ mb: 1 }}>
                  • Department: <strong>Computer Science & Engineering</strong>
                </Typography>
                <Typography variant="body2" color="#d1d5db">
                  • Current Semester: <strong>5th Semester</strong>
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
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 4, color: '#6366f1' }}>
            CMS Student
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
                  color: activeTab === item.id ? '#6366f1' : '#9ca3af',
                  backgroundColor: activeTab === item.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.2)'
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
              Student: {user?.username} (ID: {user?.id})
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

export default StudentDashboard;

import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import SimpleDashboard from '../components/SimpleDashboard';
import SimpleStudentManagement from '../components/SimpleStudentManagement';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'students'
  const [triggerAddStudent, setTriggerAddStudent] = useState(false);
  const [viewStudentItem, setViewStudentItem] = useState(null);

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get('/reports/students/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students_database_roster.xlsx';
      link.click();
    } catch (err) {
      alert('Could not export Excel roster. Ensure the backend server is running.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'students', label: 'Manage Students', icon: <PeopleIcon /> }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Box
        sx={{
          width: 250,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10
        }}
      >
        <Box>
          {/* Brand Logo / Title */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SchoolIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                Student MS
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                DBMS College Portal
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <List sx={{ px: 2, pt: 2 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: '6px',
                  mb: 1,
                  py: 1.2,
                  px: 2,
                  color: activeTab === item.id ? '#2563eb' : '#475569',
                  backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                  '&:hover': {
                    backgroundColor: activeTab === item.id ? '#eff6ff' : '#f1f5f9'
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: 600,
                    '& .MuiListItemIcon-root': { color: '#2563eb' }
                  }
                }}
              >
                <ListItemIcon sx={{ color: activeTab === item.id ? '#2563eb' : '#64748b', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 500 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Sidebar Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          {/* Quick Excel Export */}
          <Button
            fullWidth
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadExcel}
            sx={{
              mb: 2,
              textTransform: 'none',
              color: '#047857',
              backgroundColor: '#ecfdf5',
              borderColor: '#a7f3d0',
              fontWeight: 600,
              fontSize: '0.8rem',
              py: 0.8,
              borderRadius: '6px',
              '&:hover': { backgroundColor: '#d1fae5' }
            }}
          >
            Export Excel Roster
          </Button>

          {/* User info & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {user?.username || 'admin'}
              </Typography>
              <Chip
                label="ADMINISTRATOR"
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  height: 18,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600
                }}
              />
            </Box>
            <Button
              size="small"
              onClick={logout}
              sx={{ color: '#dc2626', minWidth: 0, p: 0.8 }}
              title="Logout"
            >
              <ExitToAppIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' ? (
          <SimpleDashboard
            onNavigateToStudents={() => setActiveTab('students')}
            onOpenAddStudent={() => {
              setActiveTab('students');
              setTriggerAddStudent(true);
            }}
            onViewStudent={(student) => {
              setActiveTab('students');
              setViewStudentItem(student);
            }}
          />
        ) : (
          <SimpleStudentManagement
            openAddModalFromParent={triggerAddStudent}
            onCloseAddModalFromParent={() => setTriggerAddStudent(false)}
            viewStudentFromParent={viewStudentItem}
            onCloseViewStudentFromParent={() => setViewStudentItem(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;

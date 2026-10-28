import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StorageIcon from '@mui/icons-material/Storage';

const SimpleDashboard = ({ onNavigateToStudents, onOpenAddStudent, onViewStudent }) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Students (sorted desc by id to get recently added)
      const studentsRes = await api.get('/students', {
        params: { pageNo: 0, pageSize: 5, sortBy: 'id', sortDir: 'desc' }
      });
      setTotalStudents(studentsRes.data.totalElements || 0);
      setRecentStudents(studentsRes.data.content || []);

      // 2. Fetch Departments count
      try {
        const deptRes = await api.get('/departments');
        setDepartmentsCount(Array.isArray(deptRes.data) ? deptRes.data.length : 4);
      } catch {
        setDepartmentsCount(4);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Could not connect to backend database. Please ensure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const getYearBadge = (year) => {
    const labels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
    return labels[year] || `${year || 1}st Year`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            System Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Overview of student enrollments and academic departments (DBMS Project)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onOpenAddStudent}
          sx={{
            backgroundColor: '#2563eb',
            '&:hover': { backgroundColor: '#1d4ed8' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '6px',
            boxShadow: 'none'
          }}
        >
          Add Student
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Students Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Total Students
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                {loading ? <CircularProgress size={24} /> : totalStudents}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 500, display: 'block', mt: 0.5 }}>
                Registered in database
              </Typography>
            </Box>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              <PeopleIcon sx={{ fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>

        {/* Number of Departments Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Academic Departments
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                {loading ? <CircularProgress size={24} /> : departmentsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mt: 0.5 }}>
                Active branches (CSE, ECE, ME, IT)
              </Typography>
            </Box>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a'
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>

        {/* Database Status Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Database Storage
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                H2 Relational DB
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 500, display: 'block', mt: 0.5 }}>
                3NF Normalized Tables
              </Typography>
            </Box>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569'
              }}
            >
              <StorageIcon sx={{ fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recently Added Students Section */}
      <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Recently Added Students
          </Typography>
          <Button
            size="small"
            onClick={onNavigateToStudents}
            sx={{ textTransform: 'none', color: '#2563eb', fontWeight: 600 }}
          >
            View All Students &rarr;
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : recentStudents.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              No students recorded yet. Click "Add Student" to create your first record.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 1.5 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Reg Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentStudents.map((student) => (
                  <TableRow key={student.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>#{student.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{student.rollNumber}</TableCell>
                    <TableCell sx={{ color: '#0f172a' }}>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.departmentName || 'General'}
                        size="small"
                        sx={{
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 500,
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#475569' }}>{getYearBadge(student.yearOfStudy)}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{student.email || '—'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => onViewStudent(student)}
                        sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#2563eb' }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SimpleDashboard;

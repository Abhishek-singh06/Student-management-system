import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StudentAttendance = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Drilldown state (course selection for daily details)
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      // Get enrolled courses
      const enrollRes = await api.get(`/enrollments/student/${user.id}`);
      setEnrollments(enrollRes.data);

      // Get all attendance logs
      const logsRes = await api.get(`/attendance/student/${user.id}`);
      setAttendanceLogs(logsRes.data);

      // Default select first course if available
      if (enrollRes.data.length > 0) {
        setSelectedCourseId(enrollRes.data[0].courseId);
        setSelectedCourseName(enrollRes.data[0].courseName);
      }
    } catch (err) {
      setError('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const getStatsForCourse = (courseId) => {
    const logs = attendanceLogs.filter(log => log.courseId === courseId);
    const total = logs.length;
    const present = logs.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
    const absent = logs.filter(log => log.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return { total, present, absent, percentage };
  };

  const getDetailedLogsForCourse = (courseId) => {
    return attendanceLogs
      .filter(log => log.courseId === courseId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Chip icon={<CheckCircleIcon style={{ color: '#10b981' }} />} label="Present" size="small" variant="outlined" sx={{ color: '#10b981', borderColor: '#10b981', fontWeight: 600 }} />;
      case 'ABSENT':
        return <Chip icon={<CancelIcon style={{ color: '#ef4444' }} />} label="Absent" size="small" variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 600 }} />;
      default:
        return <Chip icon={<AccessTimeIcon style={{ color: '#f59e0b' }} />} label="Late" size="small" variant="outlined" sx={{ color: '#f59e0b', borderColor: '#f59e0b', fontWeight: 600 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
        Attendance Record Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {enrollments.length === 0 ? (
        <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
          You are not enrolled in any courses this semester. Please register in the courses tab first.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          {enrollments.map((e) => {
            const stats = getStatsForCourse(e.courseId);
            const isWarning = stats.percentage < 75;
            const isSelected = selectedCourseId === e.courseId;

            return (
              <Grid item xs={12} sm={6} md={4} key={e.courseId}>
                <Card 
                  className="glass-panel" 
                  sx={{ 
                    height: '100%', 
                    backgroundColor: 'rgba(17, 24, 39, 0.4)', 
                    border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#6366f1'
                    }
                  }}
                  onClick={() => {
                    setSelectedCourseId(e.courseId);
                    setSelectedCourseName(e.courseName);
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontWeight: 600, mb: 0.5 }}>
                      {e.courseCode}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, fontSize: '1.1rem', minHeight: '48px', overflow: 'hidden' }}>
                      {e.courseName}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                      <Typography 
                        variant="h3" 
                        component="span"
                        sx={{ 
                          fontWeight: 800, 
                          color: isWarning ? '#ef4444' : '#10b981',
                          fontFamily: 'Outfit'
                        }}
                      >
                        {stats.percentage}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {stats.present} / {stats.total} Classes
                      </Typography>
                    </Box>

                    {isWarning ? (
                      <Alert severity="warning" variant="outlined" sx={{ py: 0, px: 1, color: '#f59e0b', borderColor: '#f59e0b', '& .MuiAlert-icon': { color: '#f59e0b' } }}>
                        Attendance below 75% limit!
                      </Alert>
                    ) : (
                      <Alert severity="success" variant="outlined" sx={{ py: 0, px: 1, color: '#10b981', borderColor: '#10b981', '& .MuiAlert-icon': { color: '#10b981' } }}>
                        Attendance requirements met
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}

          {/* Daily Logs Table (Drilldown) */}
          {selectedCourseId && (
            <Grid item xs={12}>
              <Paper className="glass-panel" sx={{ p: 3, mt: 2, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ffffff' }}>
                  Daily Attendance Log: {selectedCourseName}
                </Typography>
                
                <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', color: '#ffffff' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Lecture Date</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Comment / Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getDetailedLogsForCourse(selectedCourseId).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                            No lecture sessions logged yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getDetailedLogsForCourse(selectedCourseId).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>{log.date}</TableCell>
                            <TableCell>{getStatusChip(log.status)}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{log.remarks || '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default StudentAttendance;

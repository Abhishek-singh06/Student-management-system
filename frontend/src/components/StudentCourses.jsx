import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StudentCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState(null); // Track loader on individual buttons

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, []);

  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all available courses
      const coursesRes = await api.get('/courses', { params: { pageSize: 100 } });
      setCourses(coursesRes.data.content);

      // Get student's current active enrollments
      if (user?.id) {
        const enrollmentsRes = await api.get(`/enrollments/student/${user.id}`);
        setEnrollments(enrollmentsRes.data);
      }
    } catch (err) {
      setError('Failed to load course information.');
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId && e.status === 'ACTIVE');
  };

  const handleEnroll = async (courseId) => {
    setActionId(courseId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/enrollments/student/${user.id}/course/${courseId}`);
      setSuccess('Enrolled in course successfully!');
      // Refresh enrollments
      const enrollmentsRes = await api.get(`/enrollments/student/${user.id}`);
      setEnrollments(enrollmentsRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course.');
    } finally {
      setActionId(null);
    }
  };

  const handleDrop = async (courseId) => {
    if (!window.confirm('Are you sure you want to drop this course? Your marks history for this course will be deleted.')) {
      return;
    }
    setActionId(courseId);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/enrollments/student/${user.id}/course/${courseId}`);
      setSuccess('Dropped course successfully.');
      // Refresh enrollments
      const enrollmentsRes = await api.get(`/enrollments/student/${user.id}`);
      setEnrollments(enrollmentsRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to drop course.');
    } finally {
      setActionId(null);
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
        Electives Course Enrollment
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Grid container spacing={3}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No elective courses are currently offered.
            </Typography>
          </Grid>
        ) : (
          courses.map((course) => {
            const enrolled = isEnrolled(course.id);
            return (
              <Grid item xs={12} md={6} key={course.id}>
                <Card 
                  className="glass-panel" 
                  sx={{ 
                    height: '100%', 
                    backgroundColor: 'rgba(17, 24, 39, 0.4)', 
                    border: enrolled ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BookIcon sx={{ color: enrolled ? '#6366f1' : '#9ca3af', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                          {course.code}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${course.credits} Credits`} 
                        color={enrolled ? "primary" : "default"} 
                        size="small" 
                        sx={{ fontWeight: 600, color: enrolled ? '#ffffff' : '#d1d5db' }} 
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#d1d5db', mb: 1 }}>
                      {course.name}
                    </Typography>
                    <Typography variant="body2" color="#9ca3af" sx={{ minHeight: '40px', mb: 2 }}>
                      {course.description || 'No course description available.'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                      Department: {course.departmentName || 'General Elective'}
                    </Typography>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {enrolled ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                          <CheckCircleIcon size="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Enrolled</Typography>
                        </Box>
                      ) : (
                        <Box />
                      )}

                      {enrolled ? (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          disabled={actionId === course.id}
                          onClick={() => handleDrop(course.id)}
                          sx={{ textTransform: 'none', borderRadius: '6px' }}
                        >
                          {actionId === course.id ? <CircularProgress size={16} /> : 'Withdraw'}
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          disabled={actionId === course.id}
                          onClick={() => handleEnroll(course.id)}
                          sx={{ textTransform: 'none', borderRadius: '6px', backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
                        >
                          {actionId === course.id ? <CircularProgress size={16} /> : 'Register Course'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};

export default StudentCourses;

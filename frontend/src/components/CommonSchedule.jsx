import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';

const CommonSchedule = ({ type }) => {
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'faculty' 
        ? `/timetable/faculty/${user.id}` 
        : `/timetable/student/${user.id}`;
      
      const response = await api.get(endpoint);
      setSchedule(response.data);
    } catch (err) {
      setError('Failed to load class schedules.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress sx={{ color: type === 'faculty' ? '#3b82f6' : '#6366f1' }} />
      </Box>
    );
  }

  // Group schedules by day
  const getSlotsForDay = (day) => {
    return schedule.filter(slot => slot.dayOfWeek === day);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
        Weekly Lecture Schedule
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {schedule.length === 0 ? (
        <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
          No lectures are scheduled in your calendar. {type === 'student' ? 'Please register for elective courses first.' : 'Ask the administrator to assign subjects.'}
        </Typography>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600, width: '150px' }}>Day</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Class Lectures & Timings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map((day) => {
                const slots = getSlotsForDay(day);
                if (slots.length === 0) return null; // hide empty days for cleaner look
                return (
                  <TableRow key={day} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.01)' } }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, verticalAlign: 'top', pt: 2.5 }}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={2}>
                        {slots.map((slot) => (
                          <Grid item xs={12} sm={6} md={4} key={slot.id}>
                            <Box 
                              sx={{ 
                                p: 2, 
                                borderRadius: '8px', 
                                border: '1px solid rgba(255,255,255,0.06)',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                {slot.courseName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 1 }}>
                                {slot.courseCode} • Room: {slot.roomNumber}
                              </Typography>
                              <Typography variant="caption" sx={{ color: type === 'faculty' ? '#3b82f6' : '#6366f1', fontWeight: 600 }}>
                                {slot.startTime} - {slot.endTime}
                              </Typography>
                              {type === 'student' && (
                                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
                                  Instructor: {slot.facultyName}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CommonSchedule;

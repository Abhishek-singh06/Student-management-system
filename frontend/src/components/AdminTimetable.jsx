import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AdminTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('09:50 AM');
  const [roomNumber, setRoomNumber] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTimetable();
    fetchCoursesList();
  }, []);

  const fetchCoursesList = async () => {
    try {
      const response = await api.get('/courses', { params: { pageSize: 100 } });
      setCourses(response.data.content);
    } catch (err) {
      console.error('Failed to load courses');
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/timetable');
      setTimetable(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCourseId('');
    setDayOfWeek('MONDAY');
    setStartTime('09:00 AM');
    setEndTime('09:50 AM');
    setRoomNumber('');
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!courseId || !roomNumber.trim() || !startTime.trim() || !endTime.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseId: parseInt(courseId),
        dayOfWeek,
        startTime,
        endTime,
        roomNumber
      };

      await api.post('/timetable', payload);
      setSuccess('Timetable slot added successfully!');
      fetchTimetable();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) {
      return;
    }

    try {
      await api.delete(`/timetable/${id}`);
      setSuccess('Timetable slot deleted successfully!');
      fetchTimetable();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete slot.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Academic Schedule (Timetable)
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Class Slot
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Day</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Time Slot</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Course</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Instructor</TableCell>
                <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timetable.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                    No class slots scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                timetable.map((slot) => (
                  <TableRow key={slot.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{slot.dayOfWeek}</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{slot.startTime} - {slot.endTime}</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{slot.courseName} ({slot.courseCode})</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{slot.roomNumber}</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>{slot.facultyName}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(slot.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Schedule Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            minWidth: '450px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          Add Class Schedule Slot
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Select Course</InputLabel>
              <Select
                value={courseId}
                label="Select Course"
                onChange={(e) => setCourseId(e.target.value)}
                disabled={submitting}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Day of Week</InputLabel>
              <Select
                value={dayOfWeek}
                label="Day of Week"
                onChange={(e) => setDayOfWeek(e.target.value)}
                disabled={submitting}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <MenuItem value="MONDAY">Monday</MenuItem>
                <MenuItem value="TUESDAY">Tuesday</MenuItem>
                <MenuItem value="WEDNESDAY">Wednesday</MenuItem>
                <MenuItem value="THURSDAY">Thursday</MenuItem>
                <MenuItem value="FRIDAY">Friday</MenuItem>
                <MenuItem value="SATURDAY">Saturday</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Time (e.g. 09:00 AM)"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Time (e.g. 09:50 AM)"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Room Number (e.g. LH-202)"
              variant="outlined"
              fullWidth
              margin="dense"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#9ca3af', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={submitting}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              {submitting ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminTimetable;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const FacultyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // studentId -> { status, remarks }
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFacultyCourses();
  }, [user]);

  // Load students when selected course or date changes
  useEffect(() => {
    if (selectedCourse) {
      loadAttendanceSheet();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, date]);

  const fetchFacultyCourses = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/faculty/${user.id}/courses`);
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to load instructor courses.');
    }
  };

  const loadAttendanceSheet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Fetch all students registered in the course
      const enrollmentsRes = await api.get(`/enrollments/course/${selectedCourse}`);
      const enrolledStudents = enrollmentsRes.data.map(e => ({
        id: e.studentId,
        rollNumber: e.studentRollNumber,
        name: e.studentName
      }));
      setStudents(enrolledStudents);

      // 2. Fetch already recorded attendance sheet for this date if it exists
      const sheetRes = await api.get(`/attendance/course/${selectedCourse}/date/${date}`);
      
      const sheetData = {};
      // Initialize all to PRESENT by default
      enrolledStudents.forEach(s => {
        sheetData[s.id] = { status: 'PRESENT', remarks: '' };
      });
      
      // Overwrite with existing records
      sheetRes.data.forEach(record => {
        sheetData[record.studentId] = { 
          status: record.status, 
          remarks: record.remarks || '' 
        };
      });

      setAttendanceSheet(sheetData);
    } catch (err) {
      setError('Failed to fetch attendance sheet details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const studentsList = Object.keys(attendanceSheet).map(studentId => ({
        studentId: parseInt(studentId),
        status: attendanceSheet[studentId].status,
        remarks: attendanceSheet[studentId].remarks
      }));

      const payload = {
        courseId: parseInt(selectedCourse),
        date,
        studentsAttendance: studentsList
      };

      await api.post('/attendance/upload', payload);
      setSuccess('Attendance sheet submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
        Record Lecture Attendance
      </Typography>

      {/* Select Course & Date */}
      <Paper className="glass-panel" sx={{ p: 3, mb: 4, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#9ca3af' }}>Select Assigned Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Select Assigned Course"
                onChange={(e) => setSelectedCourse(e.target.value)}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {courses.map((c, idx) => (
                  <MenuItem key={idx} value={c.courseId}>
                    {c.courseName} ({c.courseCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lecture Date"
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true, style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {selectedCourse && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff', mb: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Roll Number</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Student Name</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                        No students enrolled in this course.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{student.rollNumber}</TableCell>
                        <TableCell sx={{ color: '#d1d5db' }}>{student.name}</TableCell>
                        <TableCell>
                          <RadioGroup
                            row
                            value={attendanceSheet[student.id]?.status || 'PRESENT'}
                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          >
                            <FormControlLabel 
                              value="PRESENT" 
                              control={<Radio size="small" sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }} />} 
                              label={<Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Present</Typography>} 
                            />
                            <FormControlLabel 
                              value="ABSENT" 
                              control={<Radio size="small" sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />} 
                              label={<Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>Absent</Typography>} 
                            />
                            <FormControlLabel 
                              value="LATE" 
                              control={<Radio size="small" sx={{ color: '#f59e0b', '&.Mui-checked': { color: '#f59e0b' } }} />} 
                              label={<Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>Late</Typography>} 
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell>
                          <TextField
                            placeholder="Optional comment..."
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={attendanceSheet[student.id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            InputProps={{
                              style: { color: '#ffffff' },
                              sx: {
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' }
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {students.length > 0 && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting}
                sx={{
                  float: 'right',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Save Attendance Sheet'}
              </Button>
            )}
          </form>
        )
      )}
    </Box>
  );
};

export default FacultyAttendance;

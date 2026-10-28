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
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const FacultyMarks = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examType, setExamType] = useState('INTERNAL_1');
  const [maxMarks, setMaxMarks] = useState(20);
  const [students, setStudents] = useState([]);
  const [marksSheet, setMarksSheet] = useState({}); // studentId -> { marksObtained, remarks }

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFacultyCourses();
  }, [user]);

  // Adjust default max marks based on exam type
  useEffect(() => {
    if (examType === 'SEMESTER') {
      setMaxMarks(100);
    } else {
      setMaxMarks(20);
    }
  }, [examType]);

  // Reload sheet when dependencies change
  useEffect(() => {
    if (selectedCourse && examType) {
      loadMarksSheet();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, examType, maxMarks]);

  const fetchFacultyCourses = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/faculty/${user.id}/courses`);
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to load instructor courses.');
    }
  };

  const loadMarksSheet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Fetch enrolled students
      const enrollRes = await api.get(`/enrollments/course/${selectedCourse}`);
      const enrolledStudents = enrollRes.data.map(e => ({
        id: e.studentId,
        rollNumber: e.studentRollNumber,
        name: e.studentName
      }));
      setStudents(enrolledStudents);

      // 2. Fetch existing marks if already recorded
      const marksRes = await api.get(`/marks/course/${selectedCourse}/exam/${examType}`);
      
      const sheetData = {};
      enrolledStudents.forEach(s => {
        sheetData[s.id] = { marksObtained: '', grade: '' };
      });

      marksRes.data.forEach(m => {
        sheetData[m.studentId] = {
          marksObtained: m.marksObtained,
          grade: m.grade || ''
        };
      });

      setMarksSheet(sheetData);
    } catch (err) {
      setError('Failed to fetch marks sheet details.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarksSheet(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const marksList = [];
      let validationFailed = false;

      for (const studentId of Object.keys(marksSheet)) {
        const val = parseFloat(marksSheet[studentId].marksObtained);
        if (isNaN(val)) {
          alert('All student marks must be numeric and not empty.');
          validationFailed = true;
          break;
        }
        if (val > maxMarks || val < 0) {
          alert(`Marks for student ID ${studentId} must be between 0 and ${maxMarks}.`);
          validationFailed = true;
          break;
        }

        marksList.push({
          studentId: parseInt(studentId),
          marksObtained: val,
          maxMarks: parseFloat(maxMarks)
        });
      }

      if (validationFailed) {
        setSubmitting(false);
        return;
      }

      const payload = {
        courseId: parseInt(selectedCourse),
        examType,
        studentsMarks: marksList
      };

      await api.post('/marks/upload', payload);
      setSuccess('Examination marks recorded successfully!');
      loadMarksSheet(); // refresh
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit marks sheet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#ffffff' }}>
        Record Academic Marks & Grades
      </Typography>

      <Paper className="glass-panel" sx={{ p: 3, mb: 4, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#9ca3af' }}>Select Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Select Course"
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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#9ca3af' }}>Select Examination Type</InputLabel>
              <Select
                value={examType}
                label="Select Examination Type"
                onChange={(e) => setExamType(e.target.value)}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <MenuItem value="INTERNAL_1">Internal Assessment 1</MenuItem>
                <MenuItem value="INTERNAL_2">Internal Assessment 2</MenuItem>
                <MenuItem value="SEMESTER">Semester Exam</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Maximum Marks"
              type="number"
              fullWidth
              size="small"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
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
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Marks Obtained (Max: {maxMarks})</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Calculated Grade</TableCell>
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
                          <TextField
                            placeholder={`Score (0-${maxMarks})`}
                            size="small"
                            type="number"
                            variant="outlined"
                            value={marksSheet[student.id]?.marksObtained ?? ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            InputProps={{
                              inputProps: { min: 0, max: maxMarks, step: 'any' },
                              style: { color: '#ffffff', width: '150px' },
                              sx: {
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#3b82f6', fontWeight: 700 }}>
                          {marksSheet[student.id]?.grade || '—'}
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
                {submitting ? <CircularProgress size={24} /> : 'Save Grades sheet'}
              </Button>
            )}
          </form>
        )
      )}
    </Box>
  );
};

export default FacultyMarks;

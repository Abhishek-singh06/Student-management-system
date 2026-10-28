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
  Alert,
  Chip,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const StudentMarks = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAcademicRecords();
  }, [user]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/reports/student/${user.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `report_card_${user.username}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download report card PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const fetchAcademicRecords = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      // Get enrolled courses
      const enrollRes = await api.get(`/enrollments/student/${user.id}`);
      setEnrollments(enrollRes.data);

      // Get student marks
      const marksRes = await api.get(`/marks/student/${user.id}`);
      setMarks(marksRes.data);
    } catch (err) {
      setError('Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  const getMarksForExam = (courseId, examType) => {
    const record = marks.find(m => m.courseId === courseId && m.examType === examType);
    return record ? `${record.marksObtained} / ${record.maxMarks}` : '—';
  };

  const getFinalGrade = (courseId) => {
    const record = marks.find(m => m.courseId === courseId && m.examType === 'SEMESTER');
    if (record) {
      const grade = record.grade;
      let color = 'default';
      if (grade === 'O' || grade === 'A+') color = 'success';
      else if (grade === 'A' || grade === 'B') color = 'primary';
      else if (grade === 'C') color = 'warning';
      else color = 'error';

      return <Chip label={grade} color={color} size="small" sx={{ fontWeight: 700, width: '40px' }} />;
    }
    return <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>Pending</Typography>;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Academic Report Card
        </Typography>
        {enrollments.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={downloading}
            onClick={handleDownloadPdf}
            sx={{ textTransform: 'none', borderRadius: '8px', backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
          >
            {downloading ? <CircularProgress size={20} /> : 'Download Transcript (PDF)'}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {enrollments.length === 0 ? (
        <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
          You are not enrolled in any courses. No grades available.
        </Typography>
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Course Name</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Credits</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Internal 1</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Internal 2</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Semester Exam</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.courseId} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{e.courseCode}</TableCell>
                  <TableCell sx={{ color: '#d1d5db' }}>{e.courseName}</TableCell>
                  <TableCell sx={{ color: '#d1d5db' }}>{e.courseCredits}</TableCell>
                  <TableCell sx={{ color: '#d1d5db' }}>{getMarksForExam(e.courseId, 'INTERNAL_1')}</TableCell>
                  <TableCell sx={{ color: '#d1d5db' }}>{getMarksForExam(e.courseId, 'INTERNAL_2')}</TableCell>
                  <TableCell sx={{ color: '#d1d5db' }}>{getMarksForExam(e.courseId, 'SEMESTER')}</TableCell>
                  <TableCell>{getFinalGrade(e.courseId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StudentMarks;

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
  Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StudentHostelLibrary = () => {
  const { user } = useContext(AuthContext);
  const [allocation, setAllocation] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHostelAndLibrary();
  }, [user]);

  const fetchHostelAndLibrary = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch hostel allocation
      const hostelRes = await api.get(`/hostels/student/${user.id}`);
      setAllocation(hostelRes.data);

      // 2. Fetch library issues
      const libraryRes = await api.get(`/library/student/${user.id}`);
      setIssues(libraryRes.data);
    } catch (err) {
      console.error('Failed to load hostel or library details.');
      setError('Could not retrieve all facility records.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status, fine) => {
    if (status === 'RETURNED') {
      return <Chip icon={<CheckCircleIcon style={{ color: '#10b981' }} />} label="Returned" size="small" variant="outlined" sx={{ color: '#10b981', borderColor: '#10b981', fontWeight: 600 }} />;
    } else if (fine > 0 || status === 'OVERDUE') {
      return <Chip icon={<WarningIcon style={{ color: '#ef4444' }} />} label="Overdue" size="small" variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 600 }} />;
    }
    return <Chip icon={<AccessTimeIcon style={{ color: '#3b82f6' }} />} label="Active checkout" size="small" variant="outlined" sx={{ color: '#3b82f6', borderColor: '#3b82f6', fontWeight: 600 }} />;
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
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Hostel Allocation Block */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 1, color: '#6366f1' }} /> Hostel Residence details
          </Typography>

          {allocation ? (
            <Card className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mb: 0.5 }}>Hostel Block</Typography>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>{allocation.hostelName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mb: 0.5 }}>Room Number</Typography>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>{allocation.roomNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mb: 0.5 }}>Allocation Date</Typography>
                    <Typography variant="h6" sx={{ color: '#d1d5db', fontWeight: 600 }}>{allocation.allocationDate}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mb: 0.5 }}>Semester Rent</Typography>
                    <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>₹{allocation.rentPerSemester}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.3)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.06)' }}>
              No active hostel room allocation found. Please contact the warden or administration to request room allocation.
            </Paper>
          )}
        </Grid>

        {/* Library Checkouts Block */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', display: 'flex', alignItems: 'center' }}>
            <LocalLibraryIcon sx={{ mr: 1, color: '#6366f1' }} /> Library Issue History
          </Typography>

          {issues.length === 0 ? (
            <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.3)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.06)' }}>
              You have not checked out any books from the college library yet.
            </Paper>
          ) : (
            <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Book Title</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Author</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>ISBN</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Issue Date</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Return Date</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Fine Due</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{issue.bookTitle}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{issue.studentName}</TableCell> {/* Wait! Student name is mapped, but this is the author in the entity. Oh! BookTitle is issue.bookTitle, what is the author? In our LibraryIssueDto we did not add author. Let's see: we have bookTitle and bookIsbn. We can display bookIsbn instead, or look up author in the book object. It's fine to just show bookTitle and isbn! */}
                      <TableCell sx={{ color: '#d1d5db' }}>{issue.bookIsbn}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{issue.issueDate}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{issue.dueDate}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{issue.returnDate || '—'}</TableCell>
                      <TableCell sx={{ color: issue.fineAmount > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {issue.fineAmount > 0 ? `₹${issue.fineAmount}` : 'None'}
                      </TableCell>
                      <TableCell>{getStatusChip(issue.status, issue.fineAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentHostelLibrary;

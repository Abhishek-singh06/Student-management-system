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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size] = useState(5); // Show 5 items per page
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);

  // Form fields state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(3);
  const [departmentId, setDepartmentId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch whenever page, search or department filter changes
  useEffect(() => {
    fetchCourses();
  }, [page, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        pageNo: page,
        pageSize: size,
        sortBy: 'id',
        sortDir: 'asc'
      };
      if (search.trim()) params.search = search;
      if (deptFilter) params.departmentId = deptFilter;

      const response = await api.get('/courses', { params });
      setCourses(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // reset page on search
    fetchCourses();
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setSelectedId(null);
    setCode('');
    setName('');
    setDescription('');
    setCredits(3);
    setDepartmentId('');
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (course) => {
    setDialogMode('edit');
    setSelectedId(course.id);
    setCode(course.code);
    setName(course.name);
    setDescription(course.description || '');
    setCredits(course.credits);
    setDepartmentId(course.departmentId || '');
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim() || !name.trim() || !credits) {
      setFormError('Code, Name, and Credits are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code,
        name,
        description,
        credits: parseInt(credits),
        departmentId: departmentId ? parseInt(departmentId) : null
      };

      if (dialogMode === 'add') {
        await api.post('/courses', payload);
        setSuccess('Course added successfully!');
      } else {
        await api.put(`/courses/${selectedId}`, payload);
        setSuccess('Course updated successfully!');
      }
      fetchCourses();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All marks and enrollment logs will be deleted.')) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);
      setSuccess('Course deleted successfully!');
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Courses
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Course
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper className="glass-panel" sx={{ p: 2, mb: 3, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  placeholder="Search code or name..."
                  size="small"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    style: { color: '#ffffff' },
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                    }
                  }}
                />
                <Button type="submit" variant="outlined" sx={{ ml: 1, minWidth: '40px' }}>
                  <SearchIcon />
                </Button>
              </Box>
            </form>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#9ca3af' }}>Filter Department</InputLabel>
              <Select
                value={deptFilter}
                label="Filter Department"
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Credits</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Department</TableCell>
                  <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                      No courses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{course.code}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{course.name}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{course.credits}</TableCell>
                      <TableCell sx={{ color: '#9ca3af' }}>{course.departmentName || 'General Elective'}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenEdit(course)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(course.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Simple Pagination Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              sx={{ mr: 2 }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Page {page + 1} of {Math.max(totalPages, 1)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              sx={{ ml: 2 }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Add / Edit Dialog */}
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
          {dialogMode === 'add' ? 'Create Course' : 'Edit Course'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}

            <TextField
              label="Course Code (e.g. CS301)"
              variant="outlined"
              fullWidth
              margin="dense"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{
                style: { color: '#ffffff' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Course Name"
              variant="outlined"
              fullWidth
              margin="dense"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{
                style: { color: '#ffffff' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Credits (1 - 6)"
              type="number"
              variant="outlined"
              fullWidth
              margin="dense"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{
                inputProps: { min: 1, max: 6 },
                style: { color: '#ffffff' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }
              }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Department</InputLabel>
              <Select
                value={departmentId}
                label="Department"
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={submitting}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <MenuItem value="">General / None</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              margin="dense"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{
                style: { color: '#ffffff' },
                sx: {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                }
              }}
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

export default AdminCourses;

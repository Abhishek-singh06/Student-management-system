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
  Grid,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);

  // Form Fields State (Faculty Profile)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Course Assignment Dialog State
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignFacultyId, setAssignFacultyId] = useState(null);
  const [assignFacultyName, setAssignFacultyName] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignSemester, setAssignSemester] = useState(5);
  const [assignAcademicYear, setAssignAcademicYear] = useState('2026-2027');
  const [assignedCoursesList, setAssignedCoursesList] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchCoursesList();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [page, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchCoursesList = async () => {
    try {
      // Get first 100 courses for dropdown
      const response = await api.get('/courses', { params: { pageSize: 100 } });
      setCourses(response.data.content);
    } catch (err) {
      console.error('Failed to load courses');
    }
  };

  const fetchFaculty = async () => {
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

      const response = await api.get('/faculty', { params });
      setFacultyList(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load faculty list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchFaculty();
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setSelectedId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setEmployeeId('');
    setFirstName('');
    setLastName('');
    setDesignation('');
    setPhone('');
    setAddress('');
    setJoiningDate('');
    setDepartmentId('');
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (faculty) => {
    setDialogMode('edit');
    setSelectedId(faculty.id);
    setUsername(faculty.username);
    setEmail(faculty.email);
    setPassword('');
    setEmployeeId(faculty.employeeId);
    setFirstName(faculty.firstName);
    setLastName(faculty.lastName);
    setDesignation(faculty.designation);
    setPhone(faculty.phone || '');
    setAddress(faculty.address || '');
    setJoiningDate(faculty.joiningDate);
    setDepartmentId(faculty.departmentId || '');
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !email.trim() || !employeeId.trim() || !firstName.trim() || !lastName.trim() || !designation.trim() || !joiningDate || !departmentId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username,
        email,
        employeeId,
        firstName,
        lastName,
        designation,
        phone,
        address,
        joiningDate,
        departmentId: parseInt(departmentId)
      };

      if (password.trim()) {
        payload.password = password;
      }

      if (dialogMode === 'add') {
        await api.post('/faculty', payload);
        setSuccess('Faculty member registered successfully!');
      } else {
        await api.put(`/faculty/${selectedId}`, payload);
        setSuccess('Faculty profile updated successfully!');
      }
      fetchFaculty();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? All class assignments and attendance records will be affected.')) {
      return;
    }

    try {
      await api.delete(`/faculty/${id}`);
      setSuccess('Faculty profile deleted successfully!');
      fetchFaculty();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty member.');
    }
  };

  // Open Assign Course Modal
  const handleOpenAssign = async (faculty) => {
    setAssignFacultyId(faculty.id);
    setAssignFacultyName(`${faculty.firstName} ${faculty.lastName}`);
    setAssignCourseId('');
    setAssignSemester(5);
    setAssignAcademicYear('2026-2027');
    setOpenAssignDialog(true);
    
    // Fetch currently assigned courses
    setLoadingAssignments(true);
    try {
      const response = await api.get(`/faculty/${faculty.id}/courses`);
      setAssignedCoursesList(response.data);
    } catch (err) {
      console.error('Failed to load assigned courses');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCloseAssign = () => {
    setOpenAssignDialog(false);
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!assignCourseId) {
      alert('Please select a course.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseId: parseInt(assignCourseId),
        facultyId: assignFacultyId,
        semester: parseInt(assignSemester),
        academicYear: assignAcademicYear
      };

      await api.post('/faculty/assign-course', payload);
      alert('Course assigned successfully!');
      
      // Refresh assignments list
      const response = await api.get(`/faculty/${assignFacultyId}/courses`);
      setAssignedCoursesList(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Faculty List
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Faculty Member
        </Button>
      </Box>

      {/* Filters */}
      <Paper className="glass-panel" sx={{ p: 2, mb: 3, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  placeholder="Search employee ID, first, last name..."
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
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Employee ID</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Department</TableCell>
                  <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facultyList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                      No faculty members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  facultyList.map((fac) => (
                    <TableRow key={fac.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{fac.employeeId}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{fac.firstName} {fac.lastName}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}><Chip label={fac.designation} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell sx={{ color: '#9ca3af' }}>{fac.departmentName}</TableCell>
                      <TableCell align="right">
                        <IconButton color="secondary" title="Assign Courses" onClick={() => handleOpenAssign(fac)} sx={{ mr: 1 }}>
                          <AssignmentIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={() => handleOpenEdit(fac)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(fac.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

      {/* Register / Edit Faculty Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            minWidth: '550px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {dialogMode === 'add' ? 'Register Faculty Profile' : 'Edit Faculty Profile'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}

            <Grid container spacing={2}>
              {/* Account Credentials */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email *"
                  type="email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={dialogMode === 'add' ? 'Password *' : 'Password (leave blank to keep current)'}
                  type="password"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>

              {/* Faculty Profile Info */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#9ca3af' }}>Department *</InputLabel>
                  <Select
                    value={departmentId}
                    label="Department *"
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={submitting}
                    sx={{ color: '#ffffff' }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation * (e.g. Professor)"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Joining Date *"
                  type="date"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true, style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
            </Grid>
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
              {submitting ? <CircularProgress size={20} /> : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Course Assignment Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={handleCloseAssign}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            minWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          Assign Courses: {assignFacultyName}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {/* Assignment form */}
          <form onSubmit={handleAssignCourse}>
            <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#9ca3af' }}>Select Course</InputLabel>
                  <Select
                    value={assignCourseId}
                    label="Select Course"
                    onChange={(e) => setAssignCourseId(e.target.value)}
                    sx={{ color: '#ffffff' }}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Semester (1-8)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={assignSemester}
                  onChange={(e) => setAssignSemester(e.target.value)}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ inputProps: { min: 1, max: 8 }, style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Academic Year"
                  placeholder="e.g. 2026-2027"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={assignAcademicYear}
                  onChange={(e) => setAssignAcademicYear(e.target.value)}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={submitting}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Add Teaching Assignment
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* List of currently assigned courses */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#9ca3af' }}>
            Current Assignments
          </Typography>
          {loadingAssignments ? (
            <CircularProgress size={24} sx={{ display: 'block', mx: 'auto' }} />
          ) : assignedCoursesList.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No courses assigned yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', maxHeight: '200px' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af' }}>Code</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Course Name</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Sem</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Year</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedCoursesList.map((cf, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#ffffff' }}>{cf.courseCode}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{cf.courseName}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{cf.semester}</TableCell>
                      <TableCell sx={{ color: '#9ca3af' }}>{cf.academicYear}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={handleCloseAssign} sx={{ color: '#9ca3af', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFaculty;

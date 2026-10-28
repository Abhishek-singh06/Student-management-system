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

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
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

  // Form Fields State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Only during add/optional edit
  const [rollNumber, setRollNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchStudents = async () => {
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

      const response = await api.get('/students', { params });
      setStudents(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setSelectedId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRollNumber('');
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setGender('MALE');
    setPhone('');
    setAddress('');
    setAdmissionDate('');
    setDepartmentId('');
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (student) => {
    setDialogMode('edit');
    setSelectedId(student.id);
    setUsername(student.username);
    setEmail(student.email);
    setPassword(''); // keep blank unless resetting password
    setRollNumber(student.rollNumber);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setDateOfBirth(student.dateOfBirth);
    setGender(student.gender);
    setPhone(student.phone || '');
    setAddress(student.address || '');
    setAdmissionDate(student.admissionDate);
    setDepartmentId(student.departmentId || '');
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !email.trim() || !rollNumber.trim() || !firstName.trim() || !lastName.trim() || !dateOfBirth || !admissionDate || !departmentId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username,
        email,
        rollNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        address,
        admissionDate,
        departmentId: parseInt(departmentId)
      };

      if (password.trim()) {
        payload.password = password;
      }

      if (dialogMode === 'add') {
        await api.post('/students', payload);
        setSuccess('Student registered successfully!');
      } else {
        await api.put(`/students/${selectedId}`, payload);
        setSuccess('Student profile updated successfully!');
      }
      fetchStudents();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This will permanently delete the user login account and all academic data.')) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);
      setSuccess('Student profile deleted successfully!');
      fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Students List
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Student
        </Button>
      </Box>

      {/* Filters */}
      <Paper className="glass-panel" sx={{ p: 2, mb: 3, backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  placeholder="Search roll, first, last name..."
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
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Roll Number</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Department</TableCell>
                  <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{student.rollNumber}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{student.firstName} {student.lastName}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{student.email}</TableCell>
                      <TableCell sx={{ color: '#9ca3af' }}>{student.departmentName}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenEdit(student)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(student.id)}>
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

      {/* Register / Edit Student Dialog */}
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
          {dialogMode === 'add' ? 'Register Student Profile' : 'Edit Student Profile'}
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

              {/* Student Demographics */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Roll Number *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
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
                  label="Date of Birth *"
                  type="date"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true, style: { color: '#9ca3af' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#9ca3af' }}>Gender *</InputLabel>
                  <Select
                    value={gender}
                    label="Gender *"
                    onChange={(e) => setGender(e.target.value)}
                    disabled={submitting}
                    sx={{ color: '#ffffff' }}
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Admission Date *"
                  type="date"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true, style: { color: '#9ca3af' } }}
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
    </Box>
  );
};

export default AdminStudents;

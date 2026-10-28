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
  Chip,
  InputAdornment,
  TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';

const SimpleStudentManagement = ({
  openAddModalFromParent,
  onCloseAddModalFromParent,
  viewStudentFromParent,
  onCloseViewStudentFromParent
}) => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Add / Edit Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedId, setSelectedId] = useState(null);

  // Form Fields
  const [rollNumber, setRollNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal
  const [viewDetailsStudent, setViewDetailsStudent] = useState(null);

  // Delete Confirmation Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, size, deptFilter]);

  // Handle trigger from Dashboard's "Add Student" or "View" button
  useEffect(() => {
    if (openAddModalFromParent) {
      handleOpenAdd();
      if (onCloseAddModalFromParent) onCloseAddModalFromParent();
    }
  }, [openAddModalFromParent]);

  useEffect(() => {
    if (viewStudentFromParent) {
      setViewDetailsStudent(viewStudentFromParent);
      if (onCloseViewStudentFromParent) onCloseViewStudentFromParent();
    }
  }, [viewStudentFromParent]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not load departments list from backend');
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
        sortDir: 'desc'
      };
      if (search.trim()) params.search = search.trim();
      if (deptFilter) params.departmentId = deptFilter;

      const res = await api.get('/students', { params });
      setStudents(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setError('Failed to retrieve student records from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStudents();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
    setTimeout(fetchStudents, 50);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedId(null);
    setRollNumber('');
    setFullName('');
    setEmail('');
    setDepartmentId(departments.length > 0 ? departments[0].id : '');
    setYearOfStudy(1);
    setPhone('');
    setAddress('');
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (student) => {
    setModalMode('edit');
    setSelectedId(student.id);
    setRollNumber(student.rollNumber || '');
    setFullName(`${student.firstName || ''} ${student.lastName || ''}`.trim());
    setEmail(student.email || '');
    setDepartmentId(student.departmentId || (departments.length > 0 ? departments[0].id : ''));
    setYearOfStudy(student.yearOfStudy || 1);
    setPhone(student.phone || '');
    setAddress(student.address || '');
    setFormError('');
    setOpenModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!rollNumber.trim()) {
      setFormError('Registration number is required.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid email address is required.');
      return;
    }
    if (!departmentId) {
      setFormError('Please select a department.');
      return;
    }

    // Split Full Name into First and Last name for relational storage
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const payload = {
      rollNumber: rollNumber.trim().toUpperCase(),
      firstName,
      lastName,
      email: email.trim(),
      departmentId: parseInt(departmentId),
      yearOfStudy: parseInt(yearOfStudy),
      phone: phone.trim() || null,
      address: address.trim() || null
    };

    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post('/students', payload);
        setSuccess('Student record created successfully in database!');
      } else {
        await api.put(`/students/${selectedId}`, payload);
        setSuccess('Student record updated successfully!');
      }
      setOpenModal(false);
      fetchStudents();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      setSuccess(`Student ${deleteTarget.firstName} (${deleteTarget.rollNumber}) deleted successfully.`);
      setDeleteTarget(null);
      fetchStudents();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  const getYearBadge = (year) => {
    const labels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
    return labels[year] || `${year || 1}st Year`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Title & Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Student Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Add, update, search, and manage registered student profiles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: '#2563eb',
            '&:hover': { backgroundColor: '#1d4ed8' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '6px',
            boxShadow: 'none'
          }}
        >
          Add New Student
        </Button>
      </Box>

      {/* Notifications */}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Department Filter Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Box */}
          <Grid item xs={12} sm={6} md={5}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, roll number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' }
                  }
                }}
              />
            </form>
          </Grid>

          {/* Department Filter */}
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="dept-filter-label">Filter Department</InputLabel>
              <Select
                labelId="dept-filter-label"
                value={deptFilter}
                label="Filter Department"
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Quick Search Button */}
          <Grid item xs={12} sm={2} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setPage(0);
                fetchStudents();
              }}
              sx={{
                textTransform: 'none',
                borderColor: '#cbd5e1',
                color: '#475569',
                borderRadius: '6px',
                height: 40
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Student Data Table */}
      <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
              No students found matching your criteria.
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setSearch('');
                setDeptFilter('');
                setPage(0);
              }}
              sx={{ mt: 1, textTransform: 'none', color: '#2563eb' }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 1.5 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Reg Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Phone</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>#{student.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{student.rollNumber}</TableCell>
                      <TableCell sx={{ color: '#0f172a', fontWeight: 500 }}>
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.9rem' }}>{student.email || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.departmentName || 'General'}
                          size="small"
                          sx={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 500,
                            borderRadius: '4px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#475569' }}>{getYearBadge(student.yearOfStudy)}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{student.phone || '—'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          {/* View Full Info */}
                          <IconButton
                            size="small"
                            title="View Student Details"
                            onClick={() => setViewDetailsStudent(student)}
                            sx={{ color: '#0284c7' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>

                          {/* Edit Details */}
                          <IconButton
                            size="small"
                            title="Edit Student"
                            onClick={() => handleOpenEdit(student)}
                            sx={{ color: '#2563eb' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>

                          {/* Delete Student */}
                          <IconButton
                            size="small"
                            title="Delete Student"
                            onClick={() => setDeleteTarget(student)}
                            sx={{ color: '#dc2626' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={totalElements}
              rowsPerPage={size}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: '1px solid #e2e8f0' }}
            />
          </>
        )}
      </Paper>

      {/* ============================================================== */}
      {/* ADD / EDIT STUDENT MODAL DIALOG */}
      {/* ============================================================== */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          {modalMode === 'add' ? 'Register New Student' : 'Edit Student Record'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Registration Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Registration Number *"
                  placeholder="e.g. 2024CSE01"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  disabled={modalMode === 'edit'}
                  helperText={modalMode === 'edit' ? 'Registration number cannot be changed' : ''}
                />
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name *"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Email Address *"
                  placeholder="e.g. ramesh@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="dialog-dept-label">Department *</InputLabel>
                  <Select
                    labelId="dialog-dept-label"
                    value={departmentId}
                    label="Department *"
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Year of Study */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="year-label">Year of Study *</InputLabel>
                  <Select
                    labelId="year-label"
                    value={yearOfStudy}
                    label="Year of Study *"
                    onChange={(e) => setYearOfStudy(e.target.value)}
                  >
                    <MenuItem value={1}>1st Year</MenuItem>
                    <MenuItem value={2}>2nd Year</MenuItem>
                    <MenuItem value={3}>3rd Year</MenuItem>
                    <MenuItem value={4}>4th Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Address (Optional) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Address / City"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : modalMode === 'add' ? 'Add Student' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ============================================================== */}
      {/* VIEW COMPLETE STUDENT RECORD DIALOG */}
      {/* ============================================================== */}
      <Dialog open={Boolean(viewDetailsStudent)} onClose={() => setViewDetailsStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
          Student Record Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewDetailsStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {viewDetailsStudent.firstName} {viewDetailsStudent.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600, mt: 0.5 }}>
                  Registration No: {viewDetailsStudent.rollNumber}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    DATABASE RECORD ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    #{viewDetailsStudent.id}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    YEAR OF STUDY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {getYearBadge(viewDetailsStudent.yearOfStudy)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    DEPARTMENT
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {viewDetailsStudent.departmentName || 'General Academic'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    EMAIL ADDRESS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {viewDetailsStudent.email || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    PHONE NUMBER
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {viewDetailsStudent.phone || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    ADMISSION DATE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {viewDetailsStudent.admissionDate || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    ADDRESS / LOCATION
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', mt: 0.2 }}>
                    {viewDetailsStudent.address || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setViewDetailsStudent(null)} sx={{ textTransform: 'none', color: '#2563eb' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>
          Confirm Delete Student
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Are you sure you want to delete student{' '}
            <strong>
              {deleteTarget?.firstName} {deleteTarget?.lastName} ({deleteTarget?.rollNumber})
            </strong>
            ? This action cannot be undone and will permanently remove this record from the database.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleStudentManagement;

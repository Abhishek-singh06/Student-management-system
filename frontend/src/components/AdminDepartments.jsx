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
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setSelectedId(null);
    setName('');
    setCode('');
    setDescription('');
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (dept) => {
    setDialogMode('edit');
    setSelectedId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!name.trim() || !code.trim()) {
      setFormError('Name and Code are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (dialogMode === 'add') {
        await api.post('/departments', { name, code, description });
        setSuccess('Department added successfully!');
      } else {
        await api.put(`/departments/${selectedId}`, { name, code, description });
        setSuccess('Department updated successfully!');
      }
      fetchDepartments();
      handleCloseDialog();
      // Auto dismiss success alert
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? All associated courses and profiles might be affected.')) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      setSuccess('Department deleted successfully!');
      fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Departments
        </Typography>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Department
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
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Description</TableCell>
                <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{dept.code}</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{dept.name}</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>{dept.description || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(dept)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(dept.id)}>
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
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {dialogMode === 'add' ? 'Create Department' : 'Edit Department'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}
            
            <TextField
              label="Department Code (e.g. CSE)"
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
              label="Department Name"
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

export default AdminDepartments;

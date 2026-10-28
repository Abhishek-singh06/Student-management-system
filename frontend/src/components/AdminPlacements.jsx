import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';

const AdminPlacements = () => {
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [selectedDriveName, setSelectedDriveName] = useState('');
  const [applicants, setApplicants] = useState([]);

  // Drive form dialog state
  const [openDriveDialog, setOpenDriveDialog] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [packageLpa, setPackageLpa] = useState(5.0);
  const [driveDate, setDriveDate] = useState(new Date().toISOString().split('T')[0]);

  // Applicant status edit state
  const [editingAppId, setEditingAppId] = useState(null);
  const [editStatus, setEditStatus] = useState('APPLIED');
  const [editRemarks, setEditRemarks] = useState('');

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      fetchApplicants(selectedDriveId);
    } else {
      setApplicants([]);
    }
  }, [selectedDriveId]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const response = await api.get('/placements/drives');
      setDrives(response.data);
      // Auto-select first drive if available
      if (response.data.length > 0 && !selectedDriveId) {
        setSelectedDriveId(response.data[0].id);
        setSelectedDriveName(response.data[0].companyName);
      }
    } catch (err) {
      console.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (driveId) => {
    setApplicantsLoading(true);
    try {
      const response = await api.get(`/placements/drives/${driveId}/applications`);
      setApplicants(response.data);
    } catch (err) {
      console.error('Failed to load drive applicants.');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!companyName || !role) {
      alert('Company name and role description are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        companyName,
        role,
        description,
        minimumCgpa: parseFloat(minCgpa),
        packageLpa: parseFloat(packageLpa),
        driveDate
      };

      await api.post('/placements/drives', payload);
      setSuccess('Placement drive created successfully!');
      setOpenDriveDialog(false);
      fetchDrives();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create drive.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appId) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/placements/applications/${appId}/status`, null, {
        params: { status: editStatus, remarks: editRemarks }
      });
      setSuccess('Application status updated successfully!');
      setEditingAppId(null);
      fetchApplicants(selectedDriveId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update selection status.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Campus Recruitment Management
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => {
            setCompanyName('');
            setRole('');
            setDescription('');
            setMinCgpa(7.0);
            setPackageLpa(5.0);
            setDriveDate(new Date().toISOString().split('T')[0]);
            setOpenDriveDialog(true);
          }}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Add Recruitment Drive
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Drives List (Left Panel) */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>Placement Drives</Typography>
            {drives.length === 0 ? (
              <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.3)', color: '#9ca3af' }}>
                No recruitment drives created yet.
              </Paper>
            ) : (
              drives.map((drive) => {
                const isSelected = selectedDriveId === drive.id;
                return (
                  <Card 
                    key={drive.id}
                    className="glass-panel"
                    sx={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.3)', 
                      mb: 2, 
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                      '&:hover': { borderColor: '#10b981' }
                    }}
                    onClick={() => {
                      setSelectedDriveId(drive.id);
                      setSelectedDriveName(drive.companyName);
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontWeight: 600 }}>{drive.driveDate}</Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>{drive.companyName}</Typography>
                      <Typography variant="body2" sx={{ color: '#d1d5db' }}>{drive.role} ({drive.packageLpa} LPA)</Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Grid>

          {/* Drive Applicants List (Right Panel) */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              Applicants: {selectedDriveName || 'Select a Drive'}
            </Typography>

            {selectedDriveId ? (
              applicantsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                  <CircularProgress sx={{ color: '#10b981' }} />
                </Box>
              ) : (
                <TableContainer component={Paper} className="glass-panel" sx={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', color: '#ffffff' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Roll Number</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>CGPA</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Selection Status</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 600 }}>Remarks</TableCell>
                        <TableCell align="right" sx={{ color: '#9ca3af', fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applicants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ color: '#9ca3af', py: 4 }}>
                            No applications submitted for this drive.
                          </TableCell>
                        </TableRow>
                      ) : (
                        applicants.map((app) => (
                          <TableRow key={app.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                            <TableCell sx={{ color: '#ffffff', fontWeight: 700 }}>{app.studentRollNumber}</TableCell>
                            <TableCell sx={{ color: '#d1d5db' }}>{app.studentName}</TableCell>
                            <TableCell sx={{ color: '#d1d5db', fontWeight: 700 }}>{app.studentCgpa.toFixed(2)}</TableCell>
                            <TableCell>
                              {editingAppId === app.id ? (
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <Select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    sx={{ color: '#ffffff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                                  >
                                    <MenuItem value="APPLIED">Applied</MenuItem>
                                    <MenuItem value="SHORTLISTED">Shortlisted</MenuItem>
                                    <MenuItem value="PLACED">Placed</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                                <Box sx={{ fontWeight: 600, color: app.status === 'PLACED' ? '#10b981' : (app.status === 'REJECTED' ? '#ef4444' : '#3b82f6') }}>
                                  {app.status}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingAppId === app.id ? (
                                <TextField
                                  size="small"
                                  placeholder="Placement remarks..."
                                  value={editRemarks}
                                  onChange={(e) => setEditRemarks(e.target.value)}
                                  InputProps={{ style: { color: '#ffffff' } }}
                                />
                              ) : (
                                app.remarks || '—'
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {editingAppId === app.id ? (
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(app.id)}>
                                    Save
                                  </Button>
                                  <Button size="small" sx={{ color: '#9ca3af' }} onClick={() => setEditingAppId(null)}>
                                    Cancel
                                  </Button>
                                </Box>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingAppId(app.id);
                                    setEditStatus(app.status);
                                    setEditRemarks(app.remarks || '');
                                  }}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Modify
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              <Paper className="glass-panel" sx={{ p: 3, backgroundColor: 'rgba(17, 24, 39, 0.3)', color: '#9ca3af' }}>
                Select a placement recruitment drive from the left side panel to review student applications.
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* Add Drive Dialog */}
      <Dialog
        open={openDriveDialog}
        onClose={() => setOpenDriveDialog(false)}
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
          Create Campus Recruitment Drive
        </DialogTitle>
        <form onSubmit={handleCreateDrive}>
          <DialogContent sx={{ py: 3 }}>
            <TextField
              label="Company Name *"
              variant="outlined"
              fullWidth
              margin="dense"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Job Role *"
              variant="outlined"
              fullWidth
              margin="dense"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              label="Job Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              margin="dense"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Minimum CGPA *"
                  type="number"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ inputProps: { step: 'any', min: 0, max: 10 }, style: { color: '#ffffff' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Package (LPA) *"
                  type="number"
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  value={packageLpa}
                  onChange={(e) => setPackageLpa(e.target.value)}
                  InputLabelProps={{ style: { color: '#9ca3af' } }}
                  InputProps={{ inputProps: { step: 'any', min: 0 }, style: { color: '#ffffff' } }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Recruitment Date *"
              type="date"
              fullWidth
              margin="dense"
              value={driveDate}
              onChange={(e) => setDriveDate(e.target.value)}
              InputLabelProps={{ shrink: true, style: { color: '#9ca3af' } }}
              InputProps={{ style: { color: '#ffffff' } }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button onClick={() => setOpenDriveDialog(false)} sx={{ color: '#9ca3af', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Add Drive
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminPlacements;

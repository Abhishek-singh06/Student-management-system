import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const StudentPlacements = () => {
  const { user } = useContext(AuthContext);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [cgpa, setCgpa] = useState(8.0);
  
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlacementInfo();
  }, [user]);

  const fetchPlacementInfo = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      // 1. Get CGPA
      const cgpaRes = await api.get(`/placements/student/${user.id}/cgpa`);
      setCgpa(cgpaRes.data);

      // 2. Get all drives
      const drivesRes = await api.get('/placements/drives');
      setDrives(drivesRes.data);

      // 3. Get student applications
      const appsRes = await api.get(`/placements/student/${user.id}`);
      setApplications(appsRes.data);
    } catch (err) {
      setError('Failed to load placement information.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationForDrive = (driveId) => {
    return applications.find(app => app.driveId === driveId);
  };

  const handleApply = async (driveId) => {
    setActionId(driveId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/placements/apply/student/${user.id}/drive/${driveId}`);
      setSuccess('Applied for placement drive successfully!');
      // Refresh applications list
      const appsRes = await api.get(`/placements/student/${user.id}`);
      setApplications(appsRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Application submission failed.');
    } finally {
      setActionId(null);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PLACED':
        return <Chip label="Placed 🎉" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case 'SHORTLISTED':
        return <Chip label="Shortlisted" color="secondary" size="small" sx={{ fontWeight: 700 }} />;
      case 'REJECTED':
        return <Chip label="Not Selected" color="error" size="small" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label="Applied" color="primary" size="small" sx={{ fontWeight: 700 }} />;
    }
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
          Campus Placement Console
        </Typography>
        <Paper className="glass-panel" sx={{ py: 1, px: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
            Calculated Cumulative CGPA: <strong style={{ color: '#6366f1', fontSize: '1.1rem' }}>{cgpa.toFixed(2)}</strong>
          </Typography>
        </Paper>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      <Grid container spacing={3}>
        {drives.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No active placement drives are currently scheduled.
            </Typography>
          </Grid>
        ) : (
          drives.map((drive) => {
            const app = getApplicationForDrive(drive.id);
            const isEligible = cgpa >= drive.minimumCgpa;
            
            return (
              <Grid item xs={12} md={6} key={drive.id}>
                <Card 
                  className="glass-panel" 
                  sx={{ 
                    height: '100%', 
                    backgroundColor: 'rgba(17, 24, 39, 0.4)', 
                    border: app?.status === 'PLACED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ color: app ? '#6366f1' : '#9ca3af', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                          {drive.companyName}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${drive.packageLpa} LPA`} 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 700 }} 
                      />
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#d1d5db', mb: 1 }}>
                      Role: {drive.role}
                    </Typography>
                    
                    <Typography variant="body2" color="#9ca3af" sx={{ minHeight: '40px', mb: 2 }}>
                      {drive.description || 'No job description provided.'}
                    </Typography>

                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#9ca3af" sx={{ display: 'block' }}>Eligibility (Min CGPA)</Typography>
                        <Typography variant="body2" sx={{ color: isEligible ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                          {drive.minimumCgpa.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#9ca3af" sx={{ display: 'block' }}>Drive Date</Typography>
                        <Typography variant="body2" sx={{ color: '#d1d5db', fontWeight: 600 }}>
                          {drive.driveDate}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {app ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusChip(app.status)}
                          {app.remarks && (
                            <Typography variant="caption" sx={{ color: '#9ca3af', ml: 1 }}>
                              ({app.remarks})
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box />
                      )}

                      {!app && (
                        isEligible ? (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            disabled={actionId === drive.id}
                            onClick={() => handleApply(drive.id)}
                            sx={{ textTransform: 'none', borderRadius: '6px', backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
                          >
                            {actionId === drive.id ? <CircularProgress size={16} /> : 'Apply Now'}
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            disabled
                            startIcon={<BlockIcon />}
                            sx={{ textTransform: 'none', borderRadius: '6px' }}
                          >
                            CGPA Ineligible
                          </Button>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};

export default StudentPlacements;

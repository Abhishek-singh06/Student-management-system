import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const LandingPage = () => {
  const navigate = useNavigate();

  const portalRoles = [
    {
      title: 'Student Portal',
      description: 'Access attendance, report cards, class schedules, and library services.',
      icon: <SchoolIcon sx={{ fontSize: 50, color: '#6366f1' }} />,
      route: '/login?role=STUDENT',
      color: '#6366f1'
    },
    {
      title: 'Faculty Portal',
      description: 'Manage class sessions, record student attendance, and submit semester grades.',
      icon: <PersonIcon sx={{ fontSize: 50, color: '#3b82f6' }} />,
      route: '/login?role=FACULTY',
      color: '#3b82f6'
    },
    {
      title: 'Administrative Portal',
      description: 'Configure departments, schedule timetables, assign payrolls, and verify entries.',
      icon: <SupervisorAccountIcon sx={{ fontSize: 50, color: '#10b981' }} />,
      route: '/login?role=ADMIN',
      color: '#10b981'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            mb: 2
          }}
        >
          University Core Portal
        </Typography>
        <Typography 
          variant="h6" 
          color="#9ca3af" 
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto', 
            fontWeight: 400,
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}
        >
          An integrated database management system for student records, academic scheduling, placements, and hostel allocations.
        </Typography>
      </Box>

      {/* Role Selection Cards */}
      <Grid container spacing={4} justifyContent="center">
        {portalRoles.map((role, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card 
              className="glass-panel"
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(role.route)}
            >
              <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3, display: 'inline-block', p: 2, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  {role.icon}
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontFamily: 'Outfit, sans-serif', 
                    fontWeight: 700, 
                    color: '#ffffff',
                    mb: 1.5
                  }}
                >
                  {role.title}
                </Typography>
                <Typography variant="body2" color="#9ca3af" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {role.description}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    borderRadius: '8px', 
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: role.color,
                    '&:hover': {
                      backgroundColor: role.color,
                      opacity: 0.9
                    }
                  }}
                >
                  Enter Portal
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LandingPage;

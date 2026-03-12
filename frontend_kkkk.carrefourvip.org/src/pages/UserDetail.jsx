import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  ArrowBack,
  Edit,
  LocationOn,
  VerifiedUser
} from '@mui/icons-material';
import { getUser } from '../services/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await getUser(id);
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [id]);

  const handleBack = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>User not found</Typography>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: 3 }}>
        {/* Header with breadcrumbs */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                color="inherit" 
                onClick={handleBack}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Person sx={{ mr: 0.5 }} fontSize="small" />
                Users
              </Link>
              <Typography color="text.primary">{user.username}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" component="h1" sx={{ mt: 1, fontWeight: 'bold' }}>
              {user.name || user.username}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
          >
            Back
          </Button>
        </Box>

        {/* User Profile Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            mb: 4
          }}
        >
          {/* Profile Header */}
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              py: 4, 
              px: 3,
              position: 'relative'
            }}
          >
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                border: '4px solid white',
                bgcolor: 'secondary.main',
                fontSize: '2.5rem'
              }}
            >
              {user.name?.charAt(0) || user.username?.charAt(0)}
            </Avatar>
            <Box sx={{ position: 'absolute', right: 20, top: 20 }}>
              <Chip 
                label={user.isActive ? 'Active' : 'Inactive'} 
                color={user.isActive ? 'success' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
              {user.isEmailVerified && (
                <Tooltip title="Email Verified">
                  <Chip 
                    icon={<VerifiedUser />}
                    label="Verified" 
                    color="info"
                    sx={{ ml: 1, fontWeight: 'bold' }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Profile Content */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} /> Basic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                        <Typography variant="body1">{user.username}</Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1">{user.name || 'Not provided'}</Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ mr: 1, fontSize: 16 }} />
                          {user.email}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">
                          <Phone sx={{ mr: 1, fontSize: 16 }} />
                          {user.phone || 'Not provided'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1 }} /> Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Created On</Typography>
                        <Typography variant="body1">
                          {user.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body1">
                          {user.updatedAt ? format(new Date(user.updatedAt), 'MMMM dd, yyyy') : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Account Status</Typography>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">Verification Status</Typography>
                        <Chip 
                          label={user.isEmailVerified ? 'Verified' : 'Not Verified'} 
                          color={user.isEmailVerified ? 'info' : 'warning'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* User Locations (if available) */}
              {user.locations && user.locations.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1 }} /> Saved Locations
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        {user.locations.map((location, index) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={location.id || index}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {location.name || `Location ${index + 1}`}
                              </Typography>
                              <Typography variant="body2">
                                {location.address}
                              </Typography>
                              {location.isDefault && (
                                <Chip 
                                  label="Default" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Recent Orders (placeholder - would need additional API) */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      User activity information not available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default UserDetail;

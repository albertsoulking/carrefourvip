import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Divider,
  CircularProgress,
  Avatar,
  Alert
} from '@mui/material';
import { 
  Delete,
  Search, 
  FilterList, 
  MoreVert, 
  Refresh, 
  Download, 
  Edit,
  Add,
  SupervisorAccount,
  AdminPanelSettings,
  Security,
  ManageAccounts,
  Warning,
  SearchOutlined as SearchIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { API_URL, getAdmins, createAdmin, deleteAdmin } from '../services/api';
import { Navigate } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

const Admins = () => {
  const theme = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [statsData, setStatsData] = useState({
    total: 0,
    superadmins: 0,
    admins: 0,
    agents: 0
  });
  
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  const isSuperAdmin = userInfo?.role.name === 'admin';

  // Redirect if not a superadmin
  if (!isSuperAdmin) {
    return <Navigate to="/" />;
  }

  // Handle admin creation
  const handleCreateAdmin = async () => {
    // Validate form
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const adminData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        password: formData.password
      };
      
      await createAdmin(adminData);
      
      // Refresh the admins list
      await fetchAdmins();
      
      // Reset form and close dialog
      setFormData({
        email: '',
        name: '',
        role: 'admin',
        password: '',
        confirmPassword: ''
      });
      setFormErrors({});
      setCreateDialogOpen(false);
      
    } catch (error) {
      console.error('Error creating admin:', error);
      // Handle specific error cases here if needed
      if (error.response?.data?.message) {
        setFormErrors({ ...formErrors, form: error.response.data.message });
      }
    }
  };
  
  // Handle input change in create form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Fetch admins data
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getAdmins();
      
      // Add unique id for DataGrid if not present
      const adminsWithId = response.data.map(admin => ({
        ...admin,
        id: admin.id
      }));
      
      setAdmins(adminsWithId);
      
      // Calculate stats
      setStatsData({
        total: adminsWithId.length,
        superadmins: adminsWithId.filter(admin => admin.role === 'superadmin').length,
        admins: adminsWithId.filter(admin => admin.role === 'admin').length,
        agents: adminsWithId.filter(admin => admin.role === 'agent').length
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, admin) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdmin(admin);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle admin deletion
  const handleDeleteAdmin = async () => {
    try {
      await deleteAdmin(selectedAdmin.id);
      
      setAdmins(admins.filter(admin => admin.id !== selectedAdmin.id));
      setDeleteDialogOpen(false);
      
      // Update stats
      setStatsData({
        ...statsData,
        total: statsData.total - 1,
        superadmins: selectedAdmin.role === 'superadmin' ? statsData.superadmins - 1 : statsData.superadmins,
        admins: selectedAdmin.role === 'admin' ? statsData.admins - 1 : statsData.admins,
        agents: selectedAdmin.role === 'agent' ? statsData.agents - 1 : statsData.agents
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  // Export admins to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Name', 'Role', 'Created At', 'Last Login'];
    const csvData = admins.map(admin => [
      admin.id,
      admin.email,
      admin.name || 'N/A',
      admin.role,
      format(new Date(admin.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      admin.lastLoginAt ? format(new Date(admin.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : 'Never'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `admins_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter admins by search query
  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchQuery.toLowerCase();
    return (
      admin.email?.toLowerCase().includes(searchLower) ||
      admin.name?.toLowerCase().includes(searchLower) ||
      admin.role?.toLowerCase().includes(searchLower)
    );
  });

  // Role label color mapping
  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'primary';
      case 'agent':
        return 'success';
      default:
        return 'default';
    }
  };

  // Define columns for the data grid
  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar sx={{ width: 35, height: 35, bgcolor: getRoleColor(params.row.role) }}>
          {params.row.name?.charAt(0) || params.row.email?.charAt(0) || 'A'}
        </Avatar>
      )
    },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'name', headerName: 'Name', width: 180 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={getRoleColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created On',
      width: 180,
      valueFormatter: (params) => {
        try {
          return params.value ? format(new Date(params.value), 'MMM dd, yyyy') : 'N/A';
        } catch (error) {
          return 'Invalid date';
        }
      }
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last Login',
      width: 180,
      valueFormatter: (params) => {
        try {
          return params.value ? format(new Date(params.value), 'MMM dd, yyyy HH:mm') : 'Never';
        } catch (error) {
          return 'Invalid date';
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="More options">
            <IconButton
              size="small"
              onClick={(event) => handleMenuOpen(event, params.row)}
              disabled={params.row.id === userInfo.id}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Admins & Agents Management
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Admin
            </Button>
          </motion.div>
        </Box>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            <Box>
              <Card 
                sx={{ 
                  boxShadow: theme.shadows[3],
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                    Total Admin Users
                  </Typography>
                  <Typography variant="h4" component="div" color="primary" fontWeight="bold">
                    {statsData.total}
                  </Typography>
                  <ManageAccounts color="primary" sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card 
                sx={{ 
                  boxShadow: theme.shadows[3],
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                    Super Admins
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main" fontWeight="bold">
                    {statsData.superadmins}
                  </Typography>
                  <Security color="error" sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card 
                sx={{ 
                  boxShadow: theme.shadows[3],
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                    Admins
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main" fontWeight="bold">
                    {statsData.admins}
                  </Typography>
                  <AdminPanelSettings color="info" sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card 
                sx={{ 
                  boxShadow: theme.shadows[3],
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                    Agents
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main" fontWeight="bold">
                    {statsData.agents}
                  </Typography>
                  <SupervisorAccount color="success" sx={{ position: 'absolute', right: 20, top: 20, opacity: 0.3, fontSize: 40 }} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </motion.div>

        {/* Security notice */}
        <motion.div variants={itemVariants}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            icon={<Warning />}
          >
            <Typography variant="body2">
              This page is only accessible to Super Administrators. Changes made here affect system security.
            </Typography>
          </Alert>
        </motion.div>

        {/* Actions Bar */}
        <motion.div variants={itemVariants}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              mb: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: theme.shadows[1],
              borderRadius: 2,
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 500 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mr: 1, flexGrow: 1 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
              <Tooltip title="Filter by role">
                <IconButton size="small" sx={{ mr: 1 }}>
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh data">
                <IconButton size="small" onClick={fetchAdmins}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={exportToCSV}
                size="small"
              >
                Export
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<Add />}
                size="small"
                color="primary"
              >
                Add Admin
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Data Grid */}
        <motion.div variants={itemVariants}>
          <Paper 
            sx={{ 
              height: { xs: 450, md: 550 }, 
              width: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: theme.shadows[3]
            }}
          >
            <DataGrid
              rows={filteredAdmins}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              loading={loading}
              pagination
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                '& .MuiDataGrid-virtualScroller': {
                  minHeight: '200px',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                },
              }}
            />
          </Paper>
        </motion.div>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          handleMenuClose();
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SupervisorAccount fontSize="small" sx={{ mr: 1 }} />
          Login History
        </MenuItem>
      </Menu>

      {/* Create Admin Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          {formErrors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>{formErrors.form}</Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              SelectProps={{ native: true }}
            >
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              {isSuperAdmin && <option value="superadmin">Super Admin</option>}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password || 'At least 6 characters'}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateAdmin}
          >
            Create Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this admin user? This action cannot be undone and may affect system security.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAdmin} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;

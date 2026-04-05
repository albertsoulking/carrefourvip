import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Delete,
  Search,
  FilterList,
  MoreVert,
  Refresh,
  Add,
  Edit,
  Check,
  LocalOffer,
  Event,
  MonetizationOn,
  Numbers,
  Code,
  Close
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/api';

export const Coupons = () => {
  const theme = useTheme();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    usage_limit: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon => 
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle menu actions
  const handleMenuOpen = (event, coupon) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCoupon(null);
  };

  // Handle dialog open/close
  const handleOpenDialog = (type, coupon = null) => {
    setDialogType(type);
    if (type === 'edit' && coupon) {
      setFormData({
        ...coupon,
        valid_from: coupon.valid_from.split('T')[0],
        valid_until: coupon.valid_until.split('T')[0]
      });
    } else if (type === 'add') {
      setFormData({
        name: '',
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        usage_limit: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      usage_limit: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true
    });
    setErrors({});
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (formData.discount_value <= 0) newErrors.discount_value = 'Discount value must be greater than 0';
    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      newErrors.discount_value = 'Percentage discount cannot exceed 100%';
    }
    if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      newErrors.valid_until = 'Expiry date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (dialogType === 'add') {
        await createCoupon(formData);
      } else {
        await updateCoupon(selectedCoupon.id, formData);
      }
      
      await fetchCoupons();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving coupon:', error);
      // Handle error (e.g., show error message)
    }
  };

  // Handle delete coupon
  const handleDelete = async () => {
    if (!selectedCoupon) return;
    
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(selectedCoupon.id);
        await fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
    
    handleMenuClose();
  };

  // Table columns
  const columns = [
    { 
      field: 'code', 
      headerName: 'CODE', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOffer color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight="500">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'name', 
      headerName: 'NAME', 
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'discount', 
      headerName: 'DISCOUNT', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MonetizationOn color="primary" fontSize="small" />
          <Typography variant="body2">
            {params.row.discount_type === 'percentage' 
              ? `${params.row.discount_value}%` 
              : `$${params.row.discount_value.toFixed(2)}`}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'usage', 
      headerName: 'USAGE', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Numbers color="primary" fontSize="small" />
          <Typography variant="body2">
            {params.row.used_count} / {params.row.usage_limit || '∞'}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'valid_until', 
      headerName: 'EXPIRES', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Event color={new Date(params.value) < new Date() ? 'error' : 'primary'} fontSize="small" />
          <Typography variant="body2" color={new Date(params.value) < new Date() ? 'error' : 'text.primary'}>
            {format(parseISO(params.value), 'MMM d, yyyy')}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'is_active', 
      headerName: 'STATUS', 
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, params.row);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Coupons
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('add')}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          New Coupon
        </Button>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, backgroundColor: 'background.paper' }
              }}
              sx={{ width: 300 }}
            />
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchCoupons}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredCoupons}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
                NoRowsOverlay: () => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <LocalOffer color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography color="text.secondary">No coupons found</Typography>
                  </Box>
                ),
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Coupon Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Create New Coupon' : 'Edit Coupon'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Coupon Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  error={!!errors.code}
                  helperText={errors.code}
                  required
                  InputProps={{
                    startAdornment: <Code color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    label="Discount Type"
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Discount Value${formData.discount_type === 'percentage' ? ' (%)' : ' ($)'}`}
                  name="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  error={!!errors.discount_value}
                  helperText={errors.discount_value}
                  required
                  InputProps={{
                    startAdornment: formData.discount_type === 'fixed' ? (
                      <MonetizationOn color="action" sx={{ mr: 1 }} />
                    ) : null,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Usage Limit"
                  name="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  helperText="0 for unlimited"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valid From"
                  name="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valid Until"
                  name="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={handleInputChange}
                  error={!!errors.valid_until}
                  helperText={errors.valid_until}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          is_active: e.target.checked
                        }))
                      }
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={dialogType === 'add' ? <Add /> : <Check />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {dialogType === 'add' ? 'Create Coupon' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleOpenDialog('edit', selectedCoupon);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Coupons;

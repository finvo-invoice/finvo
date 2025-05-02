import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
  Avatar,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// Import icons
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

// Brand colors to match CompanyProfiles.js
const brandColors = {
  primary: '#002619', // Dark green from logo
  secondary: '#0d3629', // Slightly lighter green
  accent: '#BBE900', // Bright green from logo
  light: {
    background: '#F9FAFB',
    border: '#E5E7EB',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
  }
};

// Styling constants for form elements
const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: `${brandColors.primary}50`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: brandColors.primary,
      borderWidth: '1px',
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: brandColors.primary,
  },
  mb: 2
};

export default function EditCompanyForm({ open, onClose, onSubmit, company }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    gst: '',
    pan: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: ''
    }
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        email: company.email || '',
        phone: company.phone || '',
        gst: company.gst || '',
        pan: company.pan || '',
        bankDetails: {
          accountName: company.bankDetails?.accountName || '',
          accountNumber: company.bankDetails?.accountNumber || '',
          bankName: company.bankDetails?.bankName || '',
          ifscCode: company.bankDetails?.ifscCode || '',
          branch: company.bankDetails?.branch || ''
        }
      });
      // Set logo preview if company has a logo
      if (company.logo_url) {
        setLogoPreview(company.logo_url);
      }
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setErrors(prev => ({
          ...prev,
          logo: 'Logo size should be less than 1MB'
        }));
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          logo: 'Only JPG, JPEG, PNG and GIF files are allowed'
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setLogo(file);
      setErrors(prev => ({
        ...prev,
        logo: ''
      }));
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Note: GST is now optional, so no validation needed
    
    // Bank details validation only if any field is filled
    const hasBankDetails = Object.values(formData.bankDetails).some(val => val.trim() !== '');
    
    if (hasBankDetails) {
      if (!formData.bankDetails.accountName.trim()) {
        newErrors['bank.accountName'] = 'Account name is required';
      }
      if (!formData.bankDetails.accountNumber.trim()) {
        newErrors['bank.accountNumber'] = 'Account number is required';
      }
      if (!formData.bankDetails.bankName.trim()) {
        newErrors['bank.bankName'] = 'Bank name is required';
      }
      if (!formData.bankDetails.ifscCode.trim()) {
        newErrors['bank.ifscCode'] = 'IFSC code is required';
      }
      if (!formData.bankDetails.branch.trim()) {
        newErrors['bank.branch'] = 'Branch name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        id: company.id,
        logo: logo // Pass the logo file directly
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '90vh',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: brandColors.primary,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 3,
      }}>
        <Typography variant="h6" fontWeight={600}>Edit Company</Typography>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ 
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, bgcolor: 'var(--neutral-gray-100)' }}>
          {/* Logo Upload Section */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} color={brandColors.primary}>
              Company Logo
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', 
              gap: 3, 
              mt: 2 
            }}>
              {logoPreview ? (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Company logo"
                    sx={{ 
                      height: 100,
                      width: 'auto',
                      maxWidth: 200,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid var(--neutral-gray-200)',
                      bgcolor: 'white',
                      p: 1
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      border: '1px solid var(--neutral-gray-200)',
                      '&:hover': {
                        bgcolor: '#FEE2E2',
                        color: '#EF4444'
                      }
                    }}
                    onClick={handleRemoveLogo}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'var(--neutral-gray-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  color: 'var(--neutral-gray-500)'
                }}>
                  <BusinessRoundedIcon sx={{ fontSize: 40 }} />
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a logo to display on invoices and reports
                </Typography>
                <input
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    size="small"
                    sx={{ 
                      borderColor: 'var(--neutral-gray-300)',
                      color: 'var(--neutral-gray-700)',
                      '&:hover': {
                        borderColor: brandColors.primary,
                        bgcolor: `${brandColors.primary}10`,
                      }
                    }}
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                </label>
                {errors.logo && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {errors.logo}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
          
          {/* Company Details Section */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} color={brandColors.primary}>
              Company Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessRoundedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationOnOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Contact Information */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} color={brandColors.primary}>
              Contact & Tax Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="GST Number (Optional)"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  error={!!errors.gst}
                  helperText={errors.gst}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PAN Number (Optional)"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  error={!!errors.pan}
                  helperText={errors.pan}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Bank Details */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} color={brandColors.primary}>
              Bank Details
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Name"
                  name="bank.accountName"
                  value={formData.bankDetails.accountName}
                  onChange={handleChange}
                  error={!!errors['bank.accountName']}
                  helperText={errors['bank.accountName']}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="bank.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  error={!!errors['bank.accountNumber']}
                  helperText={errors['bank.accountNumber']}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bank.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleChange}
                  error={!!errors['bank.bankName']}
                  helperText={errors['bank.bankName']}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceOutlinedIcon sx={{ color: brandColors.primary }} fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="bank.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  error={!!errors['bank.ifscCode']}
                  helperText={errors['bank.ifscCode']}
                  variant="outlined"
                  size="small"
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Branch"
                  name="bank.branch"
                  value={formData.bankDetails.branch}
                  onChange={handleChange}
                  error={!!errors['bank.branch']}
                  helperText={errors['bank.branch']}
                  variant="outlined"
                  size="small"
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: 'var(--neutral-gray-100)',
          justifyContent: 'space-between' 
        }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: 'var(--neutral-gray-700)',
              borderColor: 'var(--neutral-gray-300)',
              '&:hover': {
                borderColor: 'var(--neutral-gray-400)',
                bgcolor: 'var(--neutral-gray-200)'
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            variant="contained" 
            sx={{ 
              bgcolor: brandColors.primary,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                bgcolor: brandColors.secondary,
              },
              boxShadow: '0 4px 8px rgba(0, 38, 25, 0.15)'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
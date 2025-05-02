import React, { useState } from 'react';
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
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tooltip,
  Zoom,
  StepConnector,
  styled,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// Import premium icons
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

// Brand colors
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

// Custom styled components for the stepper
const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-root': {
    top: 16,
    zIndex: 1
  },
  '&.MuiStepConnector-alternativeLabel': {
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  '.MuiStepConnector-line': {
    borderColor: '#E5E7EB',
    borderTopWidth: 2,
  },
}));

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#F3F4F6',
  zIndex: 1,
  color: '#9CA3AF',
  width: 36,
  height: 36,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  border: '2px solid #F3F4F6',
  transition: 'all 0.2s ease',
  ...(ownerState.active && {
    backgroundColor: 'white',
    color: brandColors.primary,
    borderColor: brandColors.primary,
    boxShadow: `0 4px 10px rgba(0, 38, 25, 0.15)`,
  }),
  ...(ownerState.completed && {
    backgroundColor: 'white',
    color: brandColors.accent,
    borderColor: brandColors.accent,
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <CheckCircleOutlineRoundedIcon fontSize="small" />
      ) : (
        <Typography variant="body2" fontWeight={active ? 600 : 400}>{icon}</Typography>
      )}
    </CustomStepIconRoot>
  );
}

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
  }
};

export default function AddCompanyForm({ open, onClose, onSubmit }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone field, only allow numeric values
    if (name === 'phone' && !/^\d*$/.test(value)) {
      return; // Don't update state if non-numeric characters are entered
    }
    
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Company name is required';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    } else if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number should contain only digits';
      }
      // GST is now optional, so no validation required
    } else if (step === 2) {
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
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number should contain only digits';
    }
    // GST is now optional, so no validation required
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        logo: logo // Pass the logo file directly
      });
      onClose();
    }
  };

  const steps = [
    {
      label: 'Company Information',
      description: 'Enter basic company details',
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              width: '100%',
              maxWidth: 400,
              p: 3,
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid #f0f0f0',
            }}>
              {logoPreview ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Company logo"
                    sx={{ 
                      height: 120,
                      maxWidth: 240,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid #f0f0f0',
                      p: 1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
                  borderRadius: '50%', 
                  bgcolor: `${brandColors.primary}10`, 
                  color: brandColors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 8px rgba(37, 99, 235, 0.1)'
                }}>
                  <BusinessRoundedIcon sx={{ fontSize: 45 }} />
                </Box>
              )}
              
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
                    borderRadius: 8,
                    px: 2.5,
                    py: 1,
                    borderColor: brandColors.primary,
                    color: brandColors.primary,
                    '&:hover': {
                      bgcolor: `${brandColors.primary}10`,
                      borderColor: brandColors.primary,
                    }
                  }}
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </label>
              {errors.logo && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.logo}
                </Typography>
              )}
            </Box>
          </Grid>
          
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
              sx={{ ...textFieldSx, mb: 1.5 }}
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
      )
    },
    {
      label: 'Contact & Tax Information',
      description: 'Enter contact and tax details',
      content: (
        <Grid container spacing={2.5}>
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
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9]*' 
              }}
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
              label="PAN Number (Optional)"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              error={!!errors.pan}
              helperText={errors.pan}
              variant="outlined"
              size="small"
              sx={{
                ...textFieldSx,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  ...textFieldSx['& .MuiOutlinedInput-root'],
                  borderColor: `${brandColors.primary}40`,
                  borderWidth: '1px'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptOutlinedIcon sx={{ color: brandColors.secondary }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
        </Grid>
      )
    },
    {
      label: 'Bank Details',
      description: 'Enter banking information',
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5, 
                mb: 2,
                bgcolor: `${brandColors.primary}08`, 
                color: brandColors.primary,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${brandColors.primary}20`
              }}
            >
              <AccountBalanceOutlinedIcon sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="subtitle2" fontWeight="500">
                Banking Information
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Name"
              name="bank.accountName"
              value={formData.bankDetails.accountName}
              onChange={handleChange}
              error={!!errors['bank.accountName']}
              helperText={errors['bank.accountName']}
              required
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
              required
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
              required
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
              required
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
              required
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
          </Grid>
        </Grid>
      )
    },
  ];

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
        mb: 0
      }}>
        <Typography variant="h6" fontWeight={600}>Add New Company</Typography>
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
      
      <DialogContent sx={{ p: 0, height: 'auto', overflow: 'visible' }}>
        {/* Horizontal Stepper */}
        <Box sx={{ bgcolor: 'var(--neutral-gray-100)', pt: 3, pb: 0, px: 4 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            connector={<CustomStepConnector />}
          >
            {steps.map(step => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Box sx={{ pt: 1, pb: 2 }}>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ fontSize: '0.95rem', mb: 1, fontWeight: 500 }}
            >
              {steps[activeStep].description}
            </Typography>
          </Box>
          
          {/* Step Content Box */}
          <Box sx={{ pb: 2 }}>
            {steps[activeStep].content}
          </Box>
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        bgcolor: 'var(--neutral-gray-100)',
        justifyContent: 'space-between' 
      }}>
        <Button 
          disabled={activeStep === 0} 
          onClick={handleBack}
          sx={{ 
            color: 'var(--neutral-gray-700)',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'var(--neutral-gray-200)'
            }
          }}
        >
          Back
        </Button>
        <Box>
          <Button 
            onClick={onClose} 
            sx={{ 
              mr: 1,
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
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmit}
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
              Save Company
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
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
              Continue
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
} 
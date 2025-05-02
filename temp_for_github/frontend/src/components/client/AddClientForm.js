import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const brandColors = {
  primary: '#002619',   // Darker green for main elements
  secondary: '#4CAF50', // Green accent for highlights
  accent: '#80CBC4',    // Light teal for subtle accents
  light: '#EEF7F6',     // Very light background tint
  text: '#202020',      // Near-black for text
  lightGrey: '#f9fafb', // Light grey for backgrounds
  border: '#e5e7eb',    // Border color
};

export default function AddClientForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    companyDetails: '',
    hasGst: 'no',
    gstNumber: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear GST number if hasGst is set to 'no'
      ...(name === 'hasGst' && value === 'no' && { gstNumber: '' })
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    if (formData.hasGst === 'yes' && !formData.gstNumber.trim()) {
      newErrors.gstNumber = 'GST number is required when GST is applicable';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        companyDetails: '',
        hasGst: 'no',
        gstNumber: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 38, 25, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          m: 2,
          '& .MuiBox-root:first-of-type': {
            bgcolor: `${brandColors.primary} !important`,
            color: '#ffffff !important'
          }
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${brandColors.border}`,
          padding: '16px 20px',
          bgcolor: brandColors.primary,
          color: '#ffffff',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'inherit' }}>
          Add New Client
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ 
            color: 'inherit',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DialogContent 
          sx={{ 
            padding: '16px',
            overflow: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: brandColors.accent,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: brandColors.secondary,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.text,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: brandColors.secondary,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Details"
                name="companyDetails"
                value={formData.companyDetails}
                onChange={handleChange}
                error={!!errors.companyDetails}
                helperText={errors.companyDetails}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: brandColors.accent,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: brandColors.secondary,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.text,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: brandColors.secondary,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel 
                  component="legend" 
                  sx={{ 
                    color: brandColors.text, 
                    fontWeight: 500, 
                    mb: 1,
                    '&.Mui-focused': {
                      color: brandColors.text,
                    }
                  }}
                >
                  Has GST Number?
                </FormLabel>
                <RadioGroup
                  row
                  name="hasGst"
                  value={formData.hasGst}
                  onChange={handleChange}
                >
                  <FormControlLabel 
                    value="yes" 
                    control={
                      <Radio 
                        sx={{ 
                          color: brandColors.primary,
                          '&.Mui-checked': { 
                            color: brandColors.secondary 
                          } 
                        }} 
                      />
                    } 
                    label="Yes" 
                  />
                  <FormControlLabel 
                    value="no" 
                    control={
                      <Radio 
                        sx={{ 
                          color: brandColors.primary,
                          '&.Mui-checked': { 
                            color: brandColors.secondary 
                          } 
                        }} 
                      />
                    } 
                    label="No" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formData.hasGst === 'yes' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="GST Number *"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  error={!!errors.gstNumber}
                  helperText={errors.gstNumber}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover fieldset': {
                        borderColor: brandColors.accent,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: brandColors.secondary,
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: brandColors.text,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: brandColors.secondary,
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions 
          sx={{ 
            padding: '12px 16px', 
            borderTop: `1px solid ${brandColors.border}`,
            backgroundColor: '#fff',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Button onClick={onClose} color="inherit" size="small">
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            size="small"
            sx={{ 
              bgcolor: brandColors.secondary,
              '&:hover': {
                bgcolor: '#3d8b40'
              }
            }}
          >
            Add Client
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
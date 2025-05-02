import React, { useState, useEffect } from 'react';
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

export default function EditClientForm({ open, onClose, onSubmit, client }) {
  const [formData, setFormData] = useState({
    name: '',
    companyDetails: '',
    hasGst: 'no',
    gstNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        companyDetails: client.companyDetails,
        hasGst: client.hasGst,
        gstNumber: client.gstNumber || ''
      });
    }
  }, [client]);

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
    if (!formData.companyDetails.trim()) {
      newErrors.companyDetails = 'Company details are required';
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
      onSubmit({
        ...formData,
        id: client.id
      });
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
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        backgroundColor: '#002619 !important',
        color: 'white !important',
        zIndex: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'white !important' }}>
          Edit Client
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white !important' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3}>
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
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Details *"
                name="companyDetails"
                value={formData.companyDetails}
                onChange={handleChange}
                error={!!errors.companyDetails}
                helperText={errors.companyDetails}
                required
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ color: '#4B5563', fontWeight: 500, mb: 1 }}>
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
                    control={<Radio sx={{ color: '#002619', '&.Mui-checked': { color: '#002619' } }} />} 
                    label="Yes" 
                  />
                  <FormControlLabel 
                    value="no" 
                    control={<Radio sx={{ color: '#002619', '&.Mui-checked': { color: '#002619' } }} />} 
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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: '#4B5563', 
              fontWeight: 500,
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 16px'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              bgcolor: '#002619', 
              '&:hover': { bgcolor: '#0d3629' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              padding: '8px 20px',
              boxShadow: '0 4px 12px rgba(0, 38, 25, 0.25)'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { axiosInstance } from '../../contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const brandColors = {
  primary: '#002619',   // Darker green for main elements
  secondary: '#4CAF50', // Green accent for highlights
  accent: '#80CBC4',    // Light teal for subtle accents
  light: '#EEF7F6',     // Very light background tint
  text: '#202020',      // Near-black for text
  lightGrey: '#f9fafb', // Light grey for backgrounds
  border: '#e5e7eb',    // Border color
};

export default function AddProjectForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    numberOfFiles: '',
    unitPrice: '',
    notes: '',
    links: '',
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState('');
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  // Fetch clients when the form opens
  useEffect(() => {
    if (open) {
      fetchClients();
      // Reset form when opening
      setFormData({
        clientName: '',
        projectName: '',
        numberOfFiles: '',
        unitPrice: '',
        notes: '',
        links: '',
        startDate: null,
        endDate: null,
      });
      setErrors({});
      setNewClientMode(false);
      setNewClientName('');
    }
  }, [open]);

  const fetchClients = async () => {
    setLoading(true);
    setClientError('');
    try {
      const response = await axiosInstance.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClientError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClientChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new_client') {
      setNewClientMode(true);
      setFormData(prev => ({
        ...prev,
        clientName: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientName: value
      }));
    }
    
    // Clear client error
    if (errors.clientName) {
      setErrors(prev => ({
        ...prev,
        clientName: ''
      }));
    }
  };

  const handleNewClientNameChange = (e) => {
    setNewClientName(e.target.value);
    // Clear client error when typing new name
    if (errors.clientName) {
      setErrors(prev => ({
        ...prev,
        clientName: ''
      }));
    }
  };

  const handleCancelNewClient = () => {
    setNewClientMode(false);
    setNewClientName('');
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    // Clear date error if any
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (newClientMode) {
      if (!newClientName.trim()) {
        newErrors.clientName = 'Client name is required';
      }
    } else {
      if (!formData.clientName) {
        newErrors.clientName = 'Client name is required';
      }
    }
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.numberOfFiles || formData.numberOfFiles <= 0) {
      newErrors.numberOfFiles = 'Number of files must be greater than 0';
    }
    if (formData.numberOfFiles > 1000000) {
      newErrors.numberOfFiles = 'Number of files cannot exceed 1,000,000';
    }
    if (!formData.unitPrice || formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    if (formData.unitPrice > 1000000) {
      newErrors.unitPrice = 'Unit price cannot exceed 1,000,000';
    }
    const total = Number(formData.numberOfFiles) * Number(formData.unitPrice);
    if (total > 999999999.99) {
      newErrors.unitPrice = 'Total amount would exceed maximum allowed value';
    }
    
    // Validate links if provided
    if (formData.links && !isValidLinks(formData.links)) {
      newErrors.links = 'Please enter valid URLs separated by commas or new lines';
    }

    // Validate end date is after start date if both provided
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidLinks = (links) => {
    if (!links.trim()) return true;
    
    // Split by commas or new lines
    const linkArray = links.split(/[\n,]+/).map(link => link.trim()).filter(link => link);
    
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return linkArray.every(link => urlPattern.test(link));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let clientNameToUse = formData.clientName;
      
      // If adding a new client, create it first
      if (newClientMode && newClientName.trim()) {
        try {
          setLoading(true);
          const response = await axiosInstance.post('/api/clients', { name: newClientName });
          clientNameToUse = response.data.name;
          // Refresh clients list
          await fetchClients();
        } catch (error) {
          console.error('Error creating new client:', error);
          setClientError('Failed to create new client. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      const total = Number(formData.numberOfFiles) * Number(formData.unitPrice);
      onSubmit({
        ...formData,
        clientName: clientNameToUse,
        numberOfFiles: Number(formData.numberOfFiles),
        unitPrice: Number(formData.unitPrice),
        total,
        // Default status values for new projects
        projectStatus: 'Not Started',
        paymentStatus: 'Pending'
      });
      onClose();
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
          Add New Project
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white !important' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {newClientMode ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="New Client Name *"
                    value={newClientName}
                    onChange={handleNewClientNameChange}
                    error={!!errors.clientName}
                    helperText={errors.clientName}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={handleCancelNewClient}
                    size="small"
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    Back to existing clients
                  </Button>
                </Box>
              ) : (
                <FormControl fullWidth error={!!errors.clientName} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                  <InputLabel id="client-select-label">Client *</InputLabel>
                  <Select
                    labelId="client-select-label"
                    id="client-select"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleClientChange}
                    label="Client *"
                    required
                    disabled={loading}
                  >
                    <MenuItem 
                      value="add_new_client"
                      sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        margin: '0 0 8px 0',
                        color: brandColors.secondary,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      Add New Client
                    </MenuItem>
                    
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        Loading clients...
                      </MenuItem>
                    ) : clients.length > 0 ? (
                      clients.map((client) => (
                        <MenuItem key={client.id} value={client.name}>
                          {client.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No clients available</MenuItem>
                    )}
                  </Select>
                  {errors.clientName && <FormHelperText>{errors.clientName}</FormHelperText>}
                  {clientError && <FormHelperText error>{clientError}</FormHelperText>}
                </FormControl>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name *"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                error={!!errors.projectName}
                helperText={errors.projectName}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Files *"
                name="numberOfFiles"
                type="number"
                value={formData.numberOfFiles}
                onChange={handleChange}
                error={!!errors.numberOfFiles}
                helperText={errors.numberOfFiles}
                required
                inputProps={{ min: 1 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price *"
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                required
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      className="date-picker"
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      className="date-picker"
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Links (separate by commas or new lines)"
                name="links"
                value={formData.links}
                onChange={handleChange}
                error={!!errors.links}
                helperText={errors.links || "Add URLs to related resources, files, or references"}
                multiline
                rows={2}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              backgroundColor: brandColors.secondary,
              '&:hover': {
                backgroundColor: '#3d8b40'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

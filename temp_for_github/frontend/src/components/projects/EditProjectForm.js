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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../config/axiosConfig';

const projectStatuses = ['Not Started', 'In Progress', 'Completed'];
const paymentStatuses = ['Pending', 'Partial', 'Paid'];

export default function EditProjectForm({ open, onClose, onSubmit, project }) {
  const [formData, setFormData] = useState({
    id: '',
    clientName: '',
    projectName: '',
    numberOfFiles: '',
    unitPrice: '',
    projectStatus: 'Not Started',
    paymentStatus: 'Pending',
    notes: '',
    links: '',
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState('');

  // Set form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        id: project.id,
        clientName: project.clientName,
        projectName: project.projectName,
        numberOfFiles: project.numberOfFiles,
        unitPrice: project.unitPrice,
        projectStatus: project.projectStatus,
        paymentStatus: project.paymentStatus,
        notes: project.notes || '',
        links: project.links || '',
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
      });
    }
  }, [project]);

  // Fetch clients when the form opens
  useEffect(() => {
    if (open) {
      fetchClients();
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
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const total = Number(formData.numberOfFiles) * Number(formData.unitPrice);
      onSubmit({
        ...formData,
        numberOfFiles: Number(formData.numberOfFiles),
        unitPrice: Number(formData.unitPrice),
        total
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
          Edit Project
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white !important' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.clientName} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel id="client-select-label">Client *</InputLabel>
                <Select
                  labelId="client-select-label"
                  id="client-select"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  label="Client *"
                  required
                  disabled={loading}
                >
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel id="project-status-label">Project Status</InputLabel>
                <Select
                  labelId="project-status-label"
                  id="project-status"
                  name="projectStatus"
                  value={formData.projectStatus}
                  onChange={handleChange}
                  label="Project Status"
                >
                  {projectStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel id="payment-status-label">Payment Status</InputLabel>
                <Select
                  labelId="payment-status-label"
                  id="payment-status"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  label="Payment Status"
                >
                  {paymentStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            {formData.numberOfFiles && formData.unitPrice && (
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(187, 233, 0, 0.1)',
                  padding: '12px 16px',
                  borderRadius: '8px'
                }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Total Price:
                  </Typography>
                  <Typography variant="h6" className="total-price">
                    ₹{(Number(formData.numberOfFiles) * Number(formData.unitPrice)).toFixed(2)}
                  </Typography>
                </Box>
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
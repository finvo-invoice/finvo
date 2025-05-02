import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Avatar,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import PaymentIcon from '@mui/icons-material/Payment';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CreateInvoice.css';

// Brand colors consistent with other pages
const brandColors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FFC107',
  light: '#f8f9fa',
  text: '#333333'
};

// Add custom styles for consistent font sizes
const consistentStyles = {
  tableCells: {
    fontSize: '0.875rem'
  },
  totalsText: {
    fontSize: '0.875rem'
  },
  inputFields: {
    fontSize: '0.875rem'
  }
};

export default function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to get current date in IST
  const getCurrentDateIST = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const year = istDate.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const [invoiceData, setInvoiceData] = useState({
    company: '',
    client: '',
    invoiceNumber: '1001', // Default invoice number
    date: getCurrentDateIST(),
    items: [
      {
        id: 1,
        description: '',
        quantity: '',
        rate: '',
        amount: 0,
      },
    ],
    subtotal: 0,
    gst: 0,
    gstRate: 18,
    cgst: 0,
    sgst: 0,
    cgstRate: 9,
    sgstRate: 9,
    total: 0,
  });

  // Add states for dialog controls and new client/company data
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    companyDetails: ''
  });
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    address: '',
    gst_number: '',
    pan_number: '',
    email: '',
    phone: '',
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch companies and clients when component mounts
  useEffect(() => {
    fetchCompanies();
    fetchClients();
    fetchNextInvoiceNumber();
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/api/companies');
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies');
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients');
    }
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await axiosInstance.get('/api/invoice-number');
      if (response.data && response.data.nextInvoiceNumber) {
      setInvoiceData(prev => ({
        ...prev,
          invoiceNumber: response.data.nextInvoiceNumber.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching invoice number:', error);
      // Keep using default 1001 if there's an error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for date field to convert between formats
    if (name === 'date') {
      // Convert from YYYY-MM-DD to DD-MM-YYYY when receiving from date picker
      const [year, month, day] = value.split('-');
      const formattedDate = `${day}-${month}-${year}`;
      setInvoiceData((prev) => ({
        ...prev,
        [name]: formattedDate,
      }));
    } else if (name === 'cgstRate' || name === 'sgstRate') {
      // Handle GST rate components change
      const cgstRate = name === 'cgstRate' ? Number(value) || 0 : invoiceData.cgstRate;
      const sgstRate = name === 'sgstRate' ? Number(value) || 0 : invoiceData.sgstRate;
      const gstRate = cgstRate + sgstRate;
      
      const subtotal = invoiceData.subtotal;
      const cgst = subtotal * (cgstRate / 100);
      const sgst = subtotal * (sgstRate / 100);
      const gst = cgst + sgst;
      const total = subtotal + gst;
      
      setInvoiceData((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
        cgstRate,
        sgstRate,
        gstRate,
        cgst,
        sgst,
        gst,
        total,
      }));
    } else {
      setInvoiceData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // If company is selected, find and set the selected company data
    if (name === 'company') {
      const company = companies.find(c => c.id === value);
      setSelectedCompany(company);
    }

    // If client is selected, find and set the selected client data
    if (name === 'client') {
      const client = clients.find(c => c.id === value);
      setSelectedClient(client);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    // Calculate amount only if both quantity and rate are numbers
    if (field === 'quantity' || field === 'rate') {
      const quantity = Number(newItems[index].quantity) || 0;
      const rate = Number(newItems[index].rate) || 0;
      newItems[index].amount = quantity * rate;
    }

    // Calculate totals
    let subtotal = 0;
    newItems.forEach(item => {
      subtotal += item.amount;
    });

    const cgst = subtotal * (invoiceData.cgstRate / 100);
    const sgst = subtotal * (invoiceData.sgstRate / 100);
    const gst = cgst + sgst;
    const total = subtotal + gst;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      cgst,
      sgst,
      gst,
      total
    }));
  };

  const addItem = () => {
    const newItem = {
      id: invoiceData.items.length + 1,
          description: '',
          quantity: '',
          rate: '',
          amount: 0,
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);

    // Recalculate totals
    let subtotal = 0;
    newItems.forEach(item => {
      subtotal += item.amount;
    });

    const cgst = subtotal * (invoiceData.cgstRate / 100);
    const sgst = subtotal * (invoiceData.sgstRate / 100);
    const gst = cgst + sgst;
    const total = subtotal + gst;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      cgst,
      sgst,
      gst,
      total
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceData.company || !invoiceData.client) {
      setNotification({
        open: true,
        message: 'Please select both company and client',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/invoices', {
        ...invoiceData,
        company_id: invoiceData.company,
        client_id: invoiceData.client,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        cgst_rate: invoiceData.cgstRate,
        sgst_rate: invoiceData.sgstRate,
        cgst_amount: invoiceData.cgst,
        sgst_amount: invoiceData.sgst,
        total_amount: invoiceData.total
      });
      
      setCreatedInvoice(response.data);
      setNotification({
        open: true,
        message: 'Invoice created successfully!',
        severity: 'success'
      });
      
      // Only update the invoice number for the next invoice
      if (response.data.next_invoice_number) {
      setInvoiceData(prev => ({
        ...prev,
          invoiceNumber: response.data.next_invoice_number.toString()
        }));
      }

      // Do not reset any other data - keep everything as is

    } catch (error) {
      console.error('Error creating invoice:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Error creating invoice',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Separate handler for reset button
  const handleReset = () => {
    resetForm();
  };

  const resetForm = () => {
    // Reset the form data completely
    setInvoiceData({
      company: '',
      client: '',
      invoiceNumber: '1001',
      date: getCurrentDateIST(),
      items: [
        {
          id: 1,
          description: '',
          quantity: '',
          rate: '',
          amount: 0,
        },
      ],
      subtotal: 0,
      gst: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      cgstRate: 9,
      sgstRate: 9,
      total: 0,
    });
    
    setSelectedCompany(null);
    setSelectedClient(null);
    
    // Fetch the next invoice number
    fetchNextInvoiceNumber();
  };

  const handleDownloadPDF = async () => {
    if (!createdInvoice || !createdInvoice.id) {
      setNotification({
        open: true,
        message: 'Invoice not found for download',
        severity: 'error'
      });
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/api/invoices/${createdInvoice.id}/download`, {
        responseType: 'blob'
      });
        
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceData.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setNotification({
        open: true,
        message: 'Failed to download invoice PDF',
        severity: 'error'
      });
        }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  // Add handlers for new client dialog
  const handleOpenNewClientDialog = () => {
    setIsNewClientDialogOpen(true);
  };

  const handleCloseNewClientDialog = () => {
    setIsNewClientDialogOpen(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gst_number: '',
      companyDetails: ''
    });
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveNewClient = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/clients', newClientData);
      const newClient = response.data;
      
      // Add the new client to the clients list
      setClients(prev => [...prev, newClient]);
      
      // Select the new client in the invoice
      setInvoiceData(prev => ({
        ...prev,
        client: newClient.id
      }));
      
      setNotification({
        open: true,
        message: 'Client added successfully!',
        severity: 'success'
      });
      
      handleCloseNewClientDialog();
    } catch (error) {
      console.error('Error creating client:', error);
      setNotification({
        open: true,
        message: 'Failed to create client. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add handlers for new company dialog
  const handleOpenNewCompanyDialog = () => {
    setIsNewCompanyDialogOpen(true);
  };

  const handleCloseNewCompanyDialog = () => {
    setIsNewCompanyDialogOpen(false);
    setNewCompanyData({
      name: '',
      address: '',
      gst_number: '',
      pan_number: '',
      email: '',
      phone: '',
      bank_name: '',
      account_number: '',
      ifsc_code: ''
    });
  };

  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveNewCompany = async () => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/companies', newCompanyData);
      const newCompany = response.data;
      
      // Add the new company to the companies list
      setCompanies(prev => [...prev, newCompany]);
      
      // Select the new company in the invoice
      setInvoiceData(prev => ({
        ...prev,
        company: newCompany.id
      }));
      
      setNotification({
        open: true,
        message: 'Company added successfully!',
        severity: 'success'
      });
      
      handleCloseNewCompanyDialog();
    } catch (error) {
      console.error('Error creating company:', error);
      setNotification({
        open: true,
        message: 'Failed to create company. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box className="invoice-container loading-container">
        <CircularProgress size={60} thickness={4} sx={{ color: brandColors.primary }} />
        <Typography variant="h6" sx={{ mt: 2, color: brandColors.text }}>
          Loading invoice data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="invoice-container error-container">
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 60, color: 'error.main' }} />
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            fetchCompanies();
            fetchClients();
            fetchNextInvoiceNumber();
          }}
          startIcon={<RefreshOutlinedIcon />}
          sx={{ mt: 2, bgcolor: brandColors.primary, '&:hover': { bgcolor: brandColors.primary + 'dd' } }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <div className="invoice-container">
      <div className="header-section">
        <div className="header-content">
          <Typography variant="h4" className="page-title">
        Create Invoice
      </Typography>
        </div>
      </div>

      <Box component="form" onSubmit={handleSubmit} className="invoice-form">
        {/* Company and Client Section */}
        <div className="invoice-form-section">
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 500, 
            color: '#4CAF50', 
            marginBottom: '24px',
            border: 'none !important',
            borderLeft: 'none !important',
            paddingLeft: '0 !important',
            background: 'transparent',
            boxSizing: 'border-box'
          }}>
            Client & Company Information
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="client-select-label" sx={{ fontSize: '0.875rem' }}>Select Client</InputLabel>
                  <Select
                    labelId="client-select-label"
                    id="client-select"
                    value={invoiceData.client}
                    onChange={(e) => handleChange({ target: { name: 'client', value: e.target.value } })}
                    label="Select Client"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id} sx={{ fontSize: '0.875rem' }}>
                        {client.name}
                  </MenuItem>
                ))}
                  </Select>
                </FormControl>
                <IconButton 
                  onClick={handleOpenNewClientDialog}
                  sx={{ 
                    bgcolor: '#002619', 
                    color: '#ffffff',
                    '&:hover': { bgcolor: '#003a29' },
                    borderRadius: '4px',
                    width: '42px',
                    height: '42px',
                    marginTop: '8px'
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="company-select-label" sx={{ fontSize: '0.875rem' }}>Select Company</InputLabel>
                  <Select
                    labelId="company-select-label"
                    id="company-select"
                    value={invoiceData.company}
                    onChange={(e) => handleChange({ target: { name: 'company', value: e.target.value } })}
                    label="Select Company"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {companies.map(company => (
                      <MenuItem key={company.id} value={company.id} sx={{ fontSize: '0.875rem' }}>
                        {company.name}
                  </MenuItem>
                ))}
                  </Select>
                </FormControl>
                <IconButton 
                  onClick={handleOpenNewCompanyDialog}
                  sx={{ 
                    bgcolor: '#002619', 
                    color: '#ffffff',
                    '&:hover': { bgcolor: '#003a29' },
                    borderRadius: '4px',
                    width: '42px',
                    height: '42px',
                    marginTop: '8px'
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* Display selected client and company details with premium styling */}
          <div className="details-container">
            {selectedClient && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9fa', borderRadius: '8px', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: brandColors.primary, mb: 1, fontSize: '0.875rem' }}>Client Details</Typography>
                <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Name:</strong> {selectedClient.name}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Email:</strong> {selectedClient.email}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Phone:</strong> {selectedClient.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Address:</strong> {selectedClient.address}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>GST:</strong> {selectedClient.gst || 'Not Available'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {selectedCompany && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9fa', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: brandColors.primary, mb: 1, fontSize: '0.875rem' }}>Company Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Name:</strong> {selectedCompany.name}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Email:</strong> {selectedCompany.email}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Phone:</strong> {selectedCompany.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>Address:</strong> {selectedCompany.address}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}><strong>GST:</strong> {selectedCompany.gst || 'Not Available'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="invoice-form-section">
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 500, 
            color: '#4CAF50', 
            marginBottom: '24px',
            border: 'none !important',
            borderLeft: 'none !important',
            paddingLeft: '0 !important',
            background: 'transparent',
            boxSizing: 'border-box'
          }}>
            Invoice Details
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Invoice Number"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  style: { fontSize: '0.875rem' }
                }}
                InputLabelProps={{
                  style: { fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Issue Date"
                name="date"
                type="date"
                value={invoiceData.date.split('-').reverse().join('-')}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  style: { fontSize: '0.875rem' }
                }}
                InputLabelProps={{ 
                  shrink: true,
                  style: { fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Invoice Title"
                name="title"
                value={invoiceData.title || ''}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  style: { fontSize: '0.875rem' }
                }}
                InputLabelProps={{
                  style: { fontSize: '0.875rem' }
                }}
              />
          </Grid>
          </Grid>
        </div>

        {/* Invoice Items Section */}
        <div className="invoice-form-section">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              color: '#4CAF50', 
              border: 'none !important',
              borderLeft: 'none !important',
              paddingLeft: '0 !important',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <ListAltOutlinedIcon style={{ marginRight: '8px', color: '#4CAF50' }} />
              Invoice Items
            </div>
            <IconButton 
                onClick={addItem}
              sx={{ 
                bgcolor: '#002619', 
                color: '#ffffff',
                '&:hover': { bgcolor: '#003a29' },
                borderRadius: '4px',
                width: '42px',
                height: '42px'
              }}
            >
              <AddIcon />
            </IconButton>
            </Box>

          <TableContainer className="invoice-items-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="right" width="120px" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell align="right" width="120px" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Rate</TableCell>
                    <TableCell align="right" width="120px" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell align="right" width="80px" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Item description"
                          variant="standard"
                          InputProps={{
                            style: { fontSize: '0.875rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            handleItemChange(index, 'quantity', value);
                          }}
                          sx={{ width: 100 }}
                          inputProps={{
                            min: 0,
                            step: 1,
                            style: { fontSize: '0.875rem', textAlign: 'right' }
                          }}
                          placeholder="0"
                          InputLabelProps={{ shrink: true }}
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        <TextField
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            handleItemChange(index, 'rate', value);
                          }}
                          sx={{ width: 100 }}
                          inputProps={{
                            min: 0,
                            step: 1,
                            style: { fontSize: '0.875rem', textAlign: 'right' }
                          }}
                          placeholder="0"
                          InputLabelProps={{ shrink: true }}
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        <Typography sx={{ ...consistentStyles.tableCells, textAlign: 'right' }}>
                        ₹{item.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" width="80px">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={invoiceData.items.length === 1}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </div>

        <div className="totals-section">
          <div className="totals-row">
            <Typography variant="body1" sx={consistentStyles.totalsText}>Subtotal:</Typography>
            <Typography variant="body1" sx={consistentStyles.totalsText}>
              ₹{invoiceData.subtotal.toFixed(2)}
              </Typography>
          </div>
          
          {/* CGST Row */}
          <div className="totals-row">
            <div className="tax-input-row">
              <Typography variant="body1" sx={consistentStyles.totalsText}>CGST Rate:</Typography>
                <TextField
                  type="number"
                name="cgstRate"
                value={invoiceData.cgstRate}
                  onChange={handleChange}
                className="tax-input"
                  inputProps={{
                    min: 0,
                  max: 50,
                  step: 0.1,
                  style: { fontSize: '0.875rem' }
                  }}
                  size="small"
                variant="standard"
                sx={consistentStyles.inputFields}
              />
              <Typography variant="body1" sx={consistentStyles.totalsText}>%</Typography>
            </div>
            <Typography variant="body1" sx={consistentStyles.totalsText}>
              ₹{invoiceData.cgst.toFixed(2)}
              </Typography>
          </div>
          
          {/* SGST Row */}
          <div className="totals-row">
            <div className="tax-input-row">
              <Typography variant="body1" sx={consistentStyles.totalsText}>SGST Rate:</Typography>
              <TextField
                type="number"
                name="sgstRate"
                value={invoiceData.sgstRate}
                onChange={handleChange}
                className="tax-input"
                inputProps={{
                  min: 0,
                  max: 50,
                  step: 0.1,
                  style: { fontSize: '0.875rem' }
                }}
                size="small"
                variant="standard"
                sx={consistentStyles.inputFields}
              />
              <Typography variant="body1" sx={consistentStyles.totalsText}>%</Typography>
            </div>
            <Typography variant="body1" sx={consistentStyles.totalsText}>
              ₹{invoiceData.sgst.toFixed(2)}
              </Typography>
          </div>
          
          <Divider sx={{ width: '100%', maxWidth: 400, my: 1 }} />
          
          <div className="totals-row grand-total-row">
            <Typography variant="body1" sx={{ ...consistentStyles.totalsText, fontWeight: 600 }}>Total:</Typography>
            <Typography variant="body1" sx={{ ...consistentStyles.totalsText, fontWeight: 600 }}>
              ₹{invoiceData.total.toFixed(2)}
            </Typography>
          </div>
        </div>

        <div className="form-actions">
            <Button
              variant="outlined"
              color="inherit"
              className="reset-btn"
              onClick={handleReset}
              startIcon={<RestartAltIcon />}
              sx={{ fontSize: '0.875rem' }}
            >
              Reset Form
            </Button>
            
          <Box sx={{ display: 'flex', gap: 2 }}>
            <button
              className="add-button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ 
                cursor: submitting ? 'not-allowed' : 'pointer', 
                opacity: submitting ? 0.7 : 1,
                fontSize: '1.1rem'
              }}
            >
              <ReceiptOutlinedIcon style={{ color: '#4CAF50' }} />
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
              {createdInvoice && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  className="secondary-btn"
                  sx={{ 
                    mr: 2, 
                    color: '#002619', 
                    borderColor: '#002619',
                    fontSize: '1.1rem',
                    '&:hover': { 
                      bgcolor: 'rgba(0, 38, 25, 0.1)', 
                      borderColor: '#002619' 
                    } 
                  }}
                >
                  Download PDF
                </Button>
              )}
          </Box>
        </div>
      </Box>

      {/* New Client Dialog */}
      <Dialog 
        open={isNewClientDialogOpen} 
        onClose={handleCloseNewClientDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonOutlineOutlinedIcon sx={{ mr: 1, color: '#4CAF50' }} />
            Add New Client
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                name="name"
                value={newClientData.name}
                onChange={handleNewClientChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newClientData.email}
                onChange={handleNewClientChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={newClientData.phone}
                onChange={handleNewClientChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={newClientData.address}
                onChange={handleNewClientChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gst_number"
                value={newClientData.gst_number}
                onChange={handleNewClientChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Details"
                name="companyDetails"
                value={newClientData.companyDetails}
                onChange={handleNewClientChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseNewClientDialog} color="inherit">
            Cancel
              </Button>
          <button 
            className="add-button"
            onClick={handleSaveNewClient}
            disabled={!newClientData.name || submitting}
            style={{ cursor: (!newClientData.name || submitting) ? 'not-allowed' : 'pointer', opacity: (!newClientData.name || submitting) ? 0.7 : 1 }}
          >
            <AddIcon style={{ color: '#4CAF50' }} />
            {submitting ? 'Saving...' : 'Save Client'}
          </button>
        </DialogActions>
      </Dialog>

      {/* New Company Dialog */}
      <Dialog 
        open={isNewCompanyDialogOpen} 
        onClose={handleCloseNewCompanyDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessOutlinedIcon sx={{ mr: 1, color: '#4CAF50' }} />
            Add New Company
            </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                name="name"
                value={newCompanyData.name}
                onChange={handleNewCompanyChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={newCompanyData.address}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gst_number"
                value={newCompanyData.gst_number}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN Number"
                name="pan_number"
                value={newCompanyData.pan_number}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newCompanyData.email}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={newCompanyData.phone}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Bank Details (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bank_name"
                value={newCompanyData.bank_name}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="account_number"
                value={newCompanyData.account_number}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifsc_code"
                value={newCompanyData.ifsc_code}
                onChange={handleNewCompanyChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseNewCompanyDialog} color="inherit">
            Cancel
          </Button>
          <button 
            className="add-button"
            onClick={handleSaveNewCompany}
            disabled={!newCompanyData.name || submitting}
            style={{ cursor: (!newCompanyData.name || submitting) ? 'not-allowed' : 'pointer', opacity: (!newCompanyData.name || submitting) ? 0.7 : 1 }}
          >
            <AddIcon style={{ color: '#4CAF50' }} />
            {submitting ? 'Saving...' : 'Save Company'}
          </button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 
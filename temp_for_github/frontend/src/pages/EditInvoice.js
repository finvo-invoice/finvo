import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

export default function EditInvoice() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState({
    company: '',
    client: '',
    invoiceNumber: '',
    date: '',
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

  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Fetch invoice data, companies, and clients when component mounts
  useEffect(() => {
    fetchInvoiceData();
    fetchCompanies();
    fetchClients();
  }, [id, user]);

  const fetchInvoiceData = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      const invoice = response.data;

      // Format the invoice data for the form
      setInvoiceData({
        company: invoice.company_id,
        client: invoice.client_id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        items: Array.isArray(invoice.items) ? invoice.items : invoice.items.items,
        subtotal: invoice.subtotal,
        gst: invoice.gst,
        cgst: invoice.cgst || invoice.gst / 2, // Default to half of GST if not present
        sgst: invoice.sgst || invoice.gst / 2, // Default to half of GST if not present
        gstRate: invoice.items?.metadata?.gstRate || 18,
        cgstRate: invoice.items?.metadata?.cgstRate || 9, // Default to half of GST rate
        sgstRate: invoice.items?.metadata?.sgstRate || 9, // Default to half of GST rate
        total: invoice.total,
      });

      setSelectedCompany(invoice.company_id);
      setSelectedClient(invoice.client_id);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to fetch invoice details');
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/api/clients');
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cgstRate' || name === 'sgstRate') {
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
      setInvoiceData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'company') {
      setSelectedCompany(value);
    } else if (name === 'client') {
      setSelectedClient(value);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const rate = field === 'rate' ? value : updatedItems[index].rate;
      updatedItems[index].amount = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);
    }

    // Update invoice data with new items and calculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const cgst = subtotal * (invoiceData.cgstRate / 100);
    const sgst = subtotal * (invoiceData.sgstRate / 100);
    const gst = cgst + sgst;
    const total = subtotal + gst;

    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      cgst,
      sgst,
      gst,
      total,
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          description: '',
          quantity: '',
          rate: '',
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const cgst = subtotal * (invoiceData.cgstRate / 100);
    const sgst = subtotal * (invoiceData.sgstRate / 100);
    const gst = cgst + sgst;
    const total = subtotal + gst;

    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      cgst,
      sgst,
      gst,
      total,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!invoiceData.company || !invoiceData.client) {
      setNotification({
        open: true,
        message: 'Please select a company and client',
        severity: 'error'
      });
      return;
    }

    if (invoiceData.items.some(item => !item.description || !item.quantity || !item.rate)) {
      setNotification({
        open: true,
        message: 'Please fill in all item details',
        severity: 'error'
      });
      return;
    }

    setConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setSubmitting(true);
      setConfirmDialog(false);
      
      // Prepare invoice data with company and client names
      const companyObj = companies.find(c => c.id === invoiceData.company);
      const clientObj = clients.find(c => c.id === invoiceData.client);
      
      const invoiceToSubmit = {
        ...invoiceData,
        companyName: companyObj?.name || '',
        clientName: clientObj?.name || '',
      };
      
      // Update invoice
      await axiosInstance.put(`/api/invoices/${id}`, invoiceToSubmit);
      
      setNotification({
        open: true,
        message: 'Invoice updated successfully!',
        severity: 'success'
      });
      
      // Navigate back to invoice detail page
      setTimeout(() => {
        navigate(`/invoices/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to update invoice',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Edit Invoice</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/invoices/${id}`)}
        >
          Back to Invoice
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Company"
                name="company"
                value={invoiceData.company}
                onChange={handleChange}
                required
                SelectProps={{
                  renderValue: (selected) => {
                    const selectedCompany = companies.find(c => c.id === selected);
                    if (!selectedCompany) return '';
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedCompany.logo_url ? (
                          <Box
                            component="img"
                            src={selectedCompany.logo_url}
                            alt={selectedCompany.name}
                            sx={{
                              width: 28,
                              height: 28,
                              objectFit: 'contain',
                              borderRadius: 0.5,
                            }}
                          />
                        ) : (
                          <Avatar sx={{ width: 28, height: 28 }} variant="rounded">
                            {selectedCompany.name.charAt(0)}
                          </Avatar>
                        )}
                        <Typography variant="body1" noWrap>
                          {selectedCompany.name}
                        </Typography>
                      </Box>
                    );
                  },
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  },
                }}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id} sx={{ py: 2, minHeight: 60 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {company.logo_url ? (
                        <Box
                          component="img"
                          src={company.logo_url}
                          alt={company.name}
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'contain',
                            borderRadius: 1,
                            backgroundColor: 'background.paper',
                            p: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{ width: 50, height: 50 }}
                          variant="rounded"
                        >
                          {company.name.charAt(0)}
                        </Avatar>
                      )}
                      <Typography>{company.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Client"
                name="client"
                value={invoiceData.client}
                onChange={handleChange}
                required
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name} - {client.companyDetails}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                value={invoiceData.date}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Invoice Items</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
              >
                Add Item
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right" width="120px">Quantity</TableCell>
                    <TableCell align="right" width="120px">Rate</TableCell>
                    <TableCell align="right" width="120px">Amount</TableCell>
                    <TableCell align="right" width="80px">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceData.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          inputProps={{ min: 1 }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        <TextField
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          required
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right" width="120px">
                        ₹{item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" width="80px">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={invoiceData.items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: 400,
                mb: 2 
              }}>
                <Typography variant="subtitle2" color="text.secondary">Subtotal:</Typography>
                <Typography variant="subtitle1" fontWeight={500}>
                  ₹{invoiceData.subtotal.toFixed(2)}
                </Typography>
              </Box>
              
              {/* CGST Row */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%', 
                maxWidth: 400,
                mb: 1.5 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1, width: '40%' }}>CGST Rate:</Typography>
                  <TextField
                    type="number"
                    name="cgstRate"
                    value={invoiceData.cgstRate}
                    onChange={handleChange}
                    sx={{ width: '30%' }}
                    inputProps={{
                      min: 0,
                      max: 50,
                      step: 0.1
                    }}
                    size="small"
                  />
                  <Typography sx={{ ml: 1 }}>%</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  ₹{invoiceData.cgst.toFixed(2)}
                </Typography>
              </Box>
              
              {/* SGST Row */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%', 
                maxWidth: 400,
                mb: 2 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1, width: '40%' }}>SGST Rate:</Typography>
                  <TextField
                    type="number"
                    name="sgstRate"
                    value={invoiceData.sgstRate}
                    onChange={handleChange}
                    sx={{ width: '30%' }}
                    inputProps={{
                      min: 0,
                      max: 50,
                      step: 0.1
                    }}
                    size="small"
                  />
                  <Typography sx={{ ml: 1 }}>%</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  ₹{invoiceData.sgst.toFixed(2)}
                </Typography>
              </Box>
              
              <Divider sx={{ width: '100%', maxWidth: 400, mb: 2 }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: 400
              }}>
                <Typography variant="subtitle1" fontWeight={600}>Total:</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ₹{invoiceData.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Invoice'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          Are you sure you want to update this invoice? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
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
    </Box>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  Grid,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import './AllInvoices.css';

export default function AllInvoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Fetch invoices when component mounts
  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/invoices');
      setInvoices(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId, e) => {
    if (e) e.stopPropagation();
    setInvoiceToDelete(invoiceId);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/invoices/${invoiceToDelete}`);
      
      // Update the invoices list by filtering out the deleted invoice
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== invoiceToDelete));
      
      setNotification({
        open: true,
        message: 'Invoice deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setNotification({
        open: true,
        message: 'Failed to delete invoice',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setInvoiceToDelete(null);
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await axiosInstance.get(`/api/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setNotification({
        open: true,
        message: 'Invoice downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setNotification({
        open: true,
        message: 'Failed to download invoice',
        severity: 'error'
      });
    }
  };

  const handleViewInvoice = (invoiceId, e) => {
    if (e) e.stopPropagation();
    navigate(`/invoices/${invoiceId}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    Object.values(invoice).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Format date from ISO string to local date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle both ISO dates and DD-MM-YYYY format
      let date;
      if (dateString.includes('-') && dateString.includes('T')) {
        // ISO format
        date = new Date(dateString);
      } else if (dateString.includes('-') && dateString.split('-').length === 3) {
        // DD-MM-YYYY format
        const [day, month, year] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else {
        return dateString; // Return as is if format is unknown
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if there's an error
    }
  };

  // Calculate summary statistics for the visible invoices
  const calculateSummary = () => {
    if (!filteredInvoices.length) return { total: 0, count: 0, average: 0 };
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Count displayed invoices since those are being shown
    const count = filteredInvoices.length;
    
    // Sum up the total amount of all visible invoices
    const total = filteredInvoices.reduce((sum, invoice) => {
      // Ensure we're working with a number value
      const invoiceTotal = parseFloat(invoice.total || 0);
      return sum + (isNaN(invoiceTotal) ? 0 : invoiceTotal);
    }, 0);
    
    // Calculate average invoice value
    const average = count > 0 ? total / count : 0;
    
    return {
      total,
      count,
      average
    };
  };

  const summary = calculateSummary();

  // Get current month name
  const getCurrentMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  };

  const currentMonth = getCurrentMonthName();

  if (loading) {
    return (
      <div className="invoices-loading">
        <CircularProgress size={60} thickness={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoices-error">
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={fetchInvoices}
          className="retry-button"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">Manage and track all your invoices in one place</p>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-icon">
            <ReceiptOutlinedIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.count}</div>
            <div className="stat-label">Total Invoices</div>
          </div>
        </div>
        
        <div className="stat-card amount">
          <div className="stat-icon">
            <AttachMoneyOutlinedIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">₹{summary.total.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        
        <div className="stat-card average">
          <div className="stat-icon">
            <DescriptionOutlinedIcon />
          </div>
          <div className="stat-content">
            <div className="stat-value">₹{summary.average.toFixed(2)}</div>
            <div className="stat-label">Average Value</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-input">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search invoices by number, company, client..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        
        <div className="controls-container">
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
            >
              <ViewModuleIcon />
            </button>
            <button 
              className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
            >
              <ViewListIcon />
            </button>
          </div>
          
          <Button
            className="add-button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-invoice')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {filteredInvoices.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="invoices-grid">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-card" onClick={() => handleViewInvoice(invoice.id)}>
                  <div className="invoice-card-header">
                    <div className="invoice-icon">
                      <ReceiptOutlinedIcon />
                    </div>
                    <div>
                      <Typography className="invoice-number">
                        #{invoice.invoice_number || invoice.bill_number || invoice.id.substring(0, 8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.client_name || 'N/A'}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="invoice-card-content">
                    <div className="invoice-detail">
                      <CalendarTodayOutlinedIcon fontSize="small" />
                      <div className="invoice-detail-content">
                        <Typography variant="body2">
                          Date: {formatDate(invoice.date)}
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="invoice-detail">
                      <BusinessOutlinedIcon fontSize="small" />
                      <div className="invoice-detail-content">
                        <Typography variant="body2">
                          {invoice.company_name || 'N/A'}
                        </Typography>
                      </div>
                    </div>
                    
                    <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <span className="total-amount-label">Total Amount:</span>
                      <span className="total-amount-value">₹{parseFloat(invoice.total || 0).toFixed(2)}</span>
                    </Typography>
                  </div>
                  
                  <div className="invoice-card-actions">
                    <Button 
                      size="small" 
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={(e) => handleViewInvoice(invoice.id, e)}
                      className="action-button view"
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<GetAppOutlinedIcon />}
                      onClick={(e) => handleDownloadInvoice(invoice.id, invoice.invoice_number, e)}
                      className="action-button download"
                    >
                      Download
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<DeleteOutlineIcon />}
                      onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                      className="action-button delete"
                      color="error"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Company</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} onClick={() => handleViewInvoice(invoice.id)}>
                      <td>
                        <div className="invoice-cell-with-icon">
                          <div className="invoice-icon-small">
                            <ReceiptOutlinedIcon fontSize="small" />
                          </div>
                          #{invoice.invoice_number || invoice.bill_number || invoice.id.substring(0, 8)}
                        </div>
                      </td>
                      <td>{formatDate(invoice.date)}</td>
                      <td>{invoice.company_name || 'N/A'}</td>
                      <td>{invoice.client_name || 'N/A'}</td>
                      <td className="amount-col">₹{parseFloat(invoice.total || 0).toFixed(2)}</td>
                      <td>
                        <div className="table-actions">
                          <Button 
                            size="small" 
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={(e) => handleViewInvoice(invoice.id, e)}
                            className="action-button view"
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<GetAppOutlinedIcon />}
                            onClick={(e) => handleDownloadInvoice(invoice.id, invoice.invoice_number, e)}
                            className="action-button download"
                          >
                            Download
                          </Button>
                          <Button 
                            size="small" 
                            startIcon={<DeleteOutlineIcon />}
                            onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                            className="action-button delete"
                            color="error"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <DescriptionOutlinedIcon style={{ fontSize: 48 }} />
          </div>
          <h2 className="empty-state-title">No Invoices Found</h2>
          <p className="empty-state-message">
            {searchTerm 
              ? `No invoices match your search criteria "${searchTerm}". Try a different search term.` 
              : "You haven't created any invoices yet. Create your first invoice to get started."}
          </p>
            {searchTerm ? (
              <Button 
                variant="outlined" 
                onClick={() => setSearchTerm('')}
              className="empty-state-button"
              >
                Clear Search
              </Button>
            ) : (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-invoice')}
              className="empty-state-button"
              >
              Create Invoice
              </Button>
            )}
        </div>
        )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: '450px',
            padding: '8px'
          }
        }}
      >
        <DialogTitle 
          id="alert-dialog-title"
          sx={{ 
            fontSize: '1.3rem', 
            fontWeight: 600,
            color: '#1F2937',
            pb: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteOutlineIcon color="error" />
            Confirm Delete Invoice
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{
              color: '#4B5563',
              fontSize: '0.95rem',
              mb: 1
            }}
          >
            Are you sure you want to delete this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1 }}>
          <Button 
            onClick={cancelDelete} 
            color="inherit"
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 4px 10px rgba(211, 47, 47, 0.25)',
              px: 3
            }}
          >
            Delete
          </Button>
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
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 
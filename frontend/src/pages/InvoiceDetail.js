import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Paper,
} from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import './ViewInvoice.css';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInvoice();
  }, [id, user]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/invoices/${id}`);
      setInvoice(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to fetch invoice details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
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

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

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

  // Get items array from invoice data
  const getInvoiceItems = () => {
    if (!invoice || !invoice.items) return [];
    
    if (Array.isArray(invoice.items)) {
      return invoice.items;
    } else if (invoice.items.items && Array.isArray(invoice.items.items)) {
      return invoice.items.items;
    }
    
    return [];
  };

  // Get CGST rate from invoice data
  const getCgstRate = () => {
    if (!invoice) return 9;
    
    if (invoice.cgst_rate) {
      return invoice.cgst_rate;
    }
    
    return 9;
  };

  // Get SGST rate from invoice data
  const getSgstRate = () => {
    if (!invoice) return 9;
    
    if (invoice.sgst_rate) {
      return invoice.sgst_rate;
    }
    
    return 9;
  };

  // Get CGST amount
  const getCgstAmount = () => {
    if (!invoice) return 0;
    
    if (invoice.cgst_amount) {
      return parseFloat(invoice.cgst_amount);
    }
    
    // If cgst is not separately stored, calculate from subtotal
    return (parseFloat(invoice.subtotal || 0) * getCgstRate()) / 100;
  };

  // Get SGST amount
  const getSgstAmount = () => {
    if (!invoice) return 0;
    
    if (invoice.sgst_amount) {
      return parseFloat(invoice.sgst_amount);
    }
    
    // If sgst is not separately stored, calculate from subtotal
    return (parseFloat(invoice.subtotal || 0) * getSgstRate()) / 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#4CAF50' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            maxWidth: 600, 
            mx: 'auto',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          size="large"
          onClick={fetchInvoice}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            maxWidth: 600, 
            mx: 'auto',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
        >
          Invoice not found
        </Alert>
        <Button
          variant="contained" 
          size="large"
          onClick={() => navigate('/all-invoices')}
          startIcon={<ArrowBackIosNewIcon />}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <div className="invoice-view-container">
      <div className="invoice-header">
        <h1 className="page-title">Invoice #{invoice.invoice_number}</h1>
        <div className="header-actions">
        <Button
          variant="outlined"
            startIcon={<ArrowBackIosNewIcon />}
          onClick={() => navigate('/all-invoices')}
            className="secondary-btn"
          >
            Back
        </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => navigate(`/edit-invoice/${id}`)}
            className="secondary-btn"
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => window.print()}
            className="primary-btn"
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<GetAppOutlinedIcon />}
            onClick={handleDownloadInvoice}
            className="primary-btn"
          >
            Download
          </Button>
        </div>
      </div>

      <div className="invoice-card">
        <div className="invoice-info">
          <div className="company-info">
            <h3 className="section-title">From</h3>
            <div className="info-row">
              <span className="info-label">Company:</span>
              <span className="info-value">{invoice.company_name || "Your Company"}</span>
            </div>
            {invoice.company_address && (
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{invoice.company_address}</span>
              </div>
            )}
            {invoice.company_gst && (
              <div className="info-row">
                <span className="info-label">GST:</span>
                <span className="info-value">{invoice.company_gst}</span>
              </div>
            )}
            {invoice.company_pan && (
              <div className="info-row">
                <span className="info-label">PAN:</span>
                <span className="info-value">{invoice.company_pan}</span>
              </div>
            )}
          </div>
          
          <div className="client-info">
            <h3 className="section-title">To</h3>
            <div className="info-row">
              <span className="info-label">Client:</span>
              <span className="info-value">{invoice.client_name || "Client Name"}</span>
            </div>
            {invoice.client_address && (
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{invoice.client_address}</span>
              </div>
            )}
            {invoice.client_gst && (
              <div className="info-row">
                <span className="info-label">GST:</span>
                <span className="info-value">{invoice.client_gst}</span>
              </div>
            )}
          </div>
          
          <div className="invoice-meta">
            <div className="info-row">
              <span className="info-label">Invoice No:</span>
              <span className="info-value">#{invoice.invoice_number || invoice.bill_number || invoice.id.substring(0, 8)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDate(invoice.date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">
                <span className={`status-pill status-${invoice.status || 'pending'}`}>
                  {invoice.status || 'Pending'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="invoice-items">
          <h3 className="section-title">Invoice Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
                {getInvoiceItems().map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="invoice-total">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span className="total-value">₹{parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">CGST ({getCgstRate()}%):</span>
              <span className="total-value">₹{getCgstAmount().toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">SGST ({getSgstRate()}%):</span>
              <span className="total-value">₹{getSgstAmount().toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span className="total-label">Total:</span>
              <span className="total-value">₹{parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="invoice-actions">
          <Button
            variant="outlined"
            startIcon={<ShareOutlinedIcon />}
            className="secondary-btn share-btn"
          >
            Share Invoice
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppOutlinedIcon />}
            onClick={handleDownloadInvoice}
            className="secondary-btn"
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<CreditCardOutlinedIcon />}
            className="primary-btn mark-paid-btn"
          >
            Mark as Paid
          </Button>
        </div>
        
        <div className="invoice-notes">
          <h4 className="notes-title">Note</h4>
          <p className="notes-content">
            Thank you for your business! Payment is due within 30 days. Please make payment to the bank account specified in the invoice.
          </p>
        </div>
      </div>
      
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
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../config/axiosConfig';
import './Invoices.css';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CreateInvoiceButton from '../components/common/CreateInvoiceButton';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/invoices');
        setInvoices(response.data || []);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to fetch invoices. Please check the All Invoices page for complete functionality.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [user]);
  
  // Count invoice statistics for current month only
  const calculateStats = () => {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Filter invoices for current month
    const currentMonthInvoices = invoices.filter(invoice => {
      if (!invoice.issueDate) return false;
      const invoiceDate = new Date(invoice.issueDate);
      return invoiceDate.getMonth() === currentMonth && 
             invoiceDate.getFullYear() === currentYear;
    });
    
    let total = currentMonthInvoices.length;
    let pending = currentMonthInvoices.filter(inv => inv.status === 'pending').length;
    let paid = currentMonthInvoices.filter(inv => inv.status === 'paid').length;
    
    return { total, pending, paid };
  };
  
  // Get current month name
  const getCurrentMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  };
  
  const stats = calculateStats();
  const currentMonth = getCurrentMonthName();
  
  if (loading) {
    return <div className="invoices-loading">Loading invoices...</div>;
  }
  
  if (error) {
    return (
      <div className="invoices-error">
        <p>{error}</p>
        <Link to="/all-invoices" className="invoices-link">
          Go to All Invoices
        </Link>
      </div>
    );
  }
  
  // If no invoices were loaded, show empty state
  if (invoices.length === 0) {
    return (
      <div className="invoices-page">
        <div className="page-header">
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage and track all your invoices</p>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <DescriptionOutlinedIcon style={{ fontSize: 48 }} />
          </div>
          <h2 className="empty-state-title">No Invoices Found</h2>
          <p className="empty-state-message">You haven't created any invoices yet. Create your first invoice to get started.</p>
          <Link to="/create-invoice" className="create-invoice-btn">
            <ReceiptOutlinedIcon style={{ color: '#4CAF50' }} />
            Create Invoice
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">Manage and track all your invoices</p>
      </div>
      
      <div className="invoices-header">
        <div className="header-content">
          <div className="header-left">
            <div className="invoice-stats">
              <div className="stat">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label"><span>{currentMonth}</span> Invoices</span>
              </div>
              <div className="stat pending">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat paid">
                <span className="stat-value">{stats.paid}</span>
                <span className="stat-label">Paid</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <Link to="/all-invoices" className="view-all-btn">View All</Link>
            <CreateInvoiceButton />
          </div>
        </div>
      </div>

      <div className="invoices-grid">
        {invoices.map(invoice => (
          <div key={invoice.id} className="invoice-card">
            <div className="invoice-header">
              <div className="invoice-number">
                #{invoice.invoice_number || invoice.bill_number || invoice.id.substring(0, 8)}
              </div>
              <div className={`invoice-status ${invoice.status?.toLowerCase() || 'pending'}`}>
                {invoice.status || 'Pending'}
              </div>
            </div>
            
            <div className="invoice-details">
              <div className="client-name">
                <span className="label">Client:</span>
                <span>{invoice.clientName || "Client"}</span>
              </div>
              <div className="amount">
                <span className="label">Amount:</span>
                <span className="value">₹{invoice.totalAmount || "0.00"}</span>
              </div>
              <div className="dates">
                <div className="issue-date">
                  <span className="label">Issued:</span>
                  <span>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="due-date">
                  <span className="label">Due:</span>
                  <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="invoice-actions">
              <Link to={`/invoice/${invoice.id}`} className="action-btn view">View</Link>
              <Link to={`/edit-invoice/${invoice.id}`} className="action-btn edit">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoices;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Divider,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SortIcon from '@mui/icons-material/Sort';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AddClientForm from '../components/client/AddClientForm';
import EditClientForm from '../components/client/EditClientForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import './ClientProfiles.css';

// Constants for GST status filtering
const GST_STATUSES = ['All', 'Registered', 'Not Registered'];

// Define brand colors to match CompanyProfiles
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

export default function ClientProfiles() {
  const { session } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for client data and UI
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [gstStatusFilter, setGstStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Add state for delete confirmation dialog
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    clientId: null,
    clientName: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchClients();
    }
  }, [session]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch clients',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      console.log('Adding client with data:', clientData);
      
      // Format the client data
      const formattedData = {
        name: clientData.name,
        companyDetails: clientData.companyDetails,
        hasGst: clientData.hasGst,
        gstNumber: clientData.hasGst === 'yes' ? clientData.gstNumber : null
      };

      const response = await axiosInstance.post('/api/clients', formattedData);
      console.log('Client created successfully:', response.data);

      setClients([...clients, response.data]);
      setIsAddDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Client added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding client:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add client',
        severity: 'error'
      });
    }
  };

  const handleEditClient = async (updatedClient) => {
    try {
      console.log('Updating client with data:', updatedClient);
      
      // Format the client data
      const formattedData = {
        name: updatedClient.name,
        companyDetails: updatedClient.companyDetails,
        hasGst: updatedClient.hasGst,
        gstNumber: updatedClient.hasGst === 'yes' ? updatedClient.gstNumber : null
      };

      const response = await axiosInstance.put(`/api/clients/${updatedClient.id}`, formattedData);
      console.log('Client updated successfully:', response.data);

      setClients(clients.map(client => 
        client.id === updatedClient.id ? response.data : client
      ));
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      setSnackbar({
        open: true,
        message: 'Client updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating client:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update client',
        severity: 'error'
      });
    }
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (client) => {
    setDeleteConfirmation({
      open: true,
      clientId: client.id,
      clientName: client.name
    });
  };

  const handleDeleteConfirmation = async () => {
    try {
      await axiosInstance.delete(`/api/clients/${deleteConfirmation.clientId}`);
      setClients(clients.filter(client => client.id !== deleteConfirmation.clientId));
      setSnackbar({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete client',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmation({
        open: false,
        clientId: null,
        clientName: ''
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      open: false,
      clientId: null,
      clientName: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle table sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle GST status filter change
  const handleGstStatusFilterChange = (event) => {
    setGstStatusFilter(event.target.value);
    setPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setGstStatusFilter('All');
    setPage(1);
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    return clients
      .filter(client => {
        const matchesSearch = 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.companyDetails && client.companyDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.gstNumber && client.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesGstStatus = 
          gstStatusFilter === 'All' || 
          (gstStatusFilter === 'Registered' && client.hasGst === 'yes') ||
          (gstStatusFilter === 'Not Registered' && client.hasGst === 'no');
        
        return matchesSearch && matchesGstStatus;
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        
        if (orderBy === 'name') {
          return isAsc 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        } else if (orderBy === 'gstStatus') {
          return isAsc 
            ? (a.hasGst === 'yes' ? 1 : -1) 
            : (a.hasGst === 'yes' ? -1 : 1);
        }
        
        return 0;
      });
  }, [clients, searchTerm, gstStatusFilter, orderBy, order]);

  // Paginate clients
  const paginatedClients = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredClients.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredClients, page, rowsPerPage]);

  // Calculate stats
  const clientStats = useMemo(() => {
    const total = clients.length;
    const registered = clients.filter(c => c.hasGst === 'yes').length;
    const notRegistered = clients.filter(c => c.hasGst === 'no').length;
    
    return { total, registered, notRegistered };
  }, [clients]);

  // Render grid view
  const renderGridView = () => (
    <div className="client-grid">
      {paginatedClients.map((client) => (
        <div className="client-card" key={client.id}>
          <div className="client-card-header">
            <div className="client-icon">
              <GroupsOutlinedIcon />
            </div>
            <div>
              <Typography variant="h6" className="client-name">
                {client.name}
              </Typography>
              {client.hasGst === 'yes' && (
                <Chip
                  size="small"
                  label={`GST: ${client.gstNumber}`}
                  className="client-status-chip registered"
                  sx={{ mt: 1 }}
                />
              )}
            </div>
          </div>
          
          <div className="client-card-content">
            <div className="client-detail">
              <DescriptionOutlinedIcon fontSize="small" />
              <Typography variant="body2" className="client-detail-content">
                {client.companyDetails || 'No company details provided'}
              </Typography>
            </div>
            
            <div className="client-detail">
              <ReceiptOutlinedIcon fontSize="small" />
              <div className="client-detail-content">
                <Typography variant="body2" fontWeight={500}>
                  GST Status: 
                </Typography>
                <Typography variant="body2">
                  {client.hasGst === 'yes' 
                    ? <span className="status-value">Registered</span> 
                    : 'Not Registered'}
                </Typography>
              </div>
            </div>
          </div>
          
          <div className="client-card-actions">
            <IconButton 
              onClick={() => handleEditClick(client)}
              className="action-button edit"
              size="small"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={() => handleDeleteClick(client)}
              className="action-button delete"
              size="small"
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <div className="dashboard-table">
      <Table aria-label="clients table">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                Client Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Company Details</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'gstStatus'}
                direction={orderBy === 'gstStatus' ? order : 'asc'}
                onClick={() => handleRequestSort('gstStatus')}
              >
                GST Status
              </TableSortLabel>
            </TableCell>
            <TableCell>GST Number</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedClients.map((client) => (
            <TableRow key={client.id} hover>
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    bgcolor: brandColors.primary,
                    color: 'white',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5
                  }}>
                    <GroupsOutlinedIcon fontSize="small" />
                  </Box>
                  <Typography fontWeight="medium">{client.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    maxWidth: 250,
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                  }}
                >
                  {client.companyDetails || 'No details provided'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={client.hasGst === 'yes' ? <CheckCircleIcon /> : <CancelIcon />}
                  label={client.hasGst === 'yes' ? 'Registered' : 'Not Registered'}
                  color={client.hasGst === 'yes' ? 'success' : 'default'}
                  variant={client.hasGst === 'yes' ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ 
                    bgcolor: client.hasGst === 'yes' ? brandColors.accent : 'transparent',
                    color: client.hasGst === 'yes' ? brandColors.primary : undefined,
                  }}
                />
              </TableCell>
              <TableCell>
                {client.hasGst === 'yes' ? (
                  <Typography variant="body2" className="client-gst-number">
                    {client.gstNumber}
                  </Typography>
                ) : '-'}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(client)}
                  sx={{ color: brandColors.primary }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(client)}
                  color="error"
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="client-container dashboard-content-container">
      {/* Header with title and subtitle */}
      <div className="page-header">
        <Typography variant="h4" className="page-title">Client Profiles</Typography>
        <Typography variant="body1" className="page-subtitle">
          Manage client information and GST details
        </Typography>
      </div>

      {/* Search and filter controls */}
      <div className="search-filter-container">
        <div className="search-input">
          <TextField
            fullWidth
            placeholder="Search clients..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        
        <div className="controls-container">
          {/* Filter button */}
          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
            sx={{ 
              bgcolor: showFilters ? brandColors.primary : 'transparent',
              color: showFilters ? 'white' : 'inherit',
              borderColor: 'var(--neutral-gray-300)',
              '&:hover': {
                bgcolor: showFilters ? brandColors.secondary : 'rgba(0, 38, 25, 0.04)',
              }
            }}
          >
            Filters
          </Button>
            
          {/* View mode toggle */}
          <div className="view-mode-toggle">
            <IconButton 
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              size="small"
            >
              <ViewModuleIcon fontSize="small" />
            </IconButton>
            <IconButton 
              className={`view-mode-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('table')}
              size="small"
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Add button */}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            className="add-button"
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* Additional filters */}
      {showFilters && (
        <div className="filters-container">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>GST Status</InputLabel>
                <Select
                  value={gstStatusFilter}
                  onChange={handleGstStatusFilterChange}
                  label="GST Status"
                >
                  {GST_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="name">Client Name</MenuItem>
                  <MenuItem value="gstStatus">GST Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  label="Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(searchTerm || gstStatusFilter !== 'All') && (
              <Grid item xs={12}>
                <Button 
                  size="small" 
                  onClick={handleResetFilters}
                  startIcon={<ClearIcon />}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Clear All Filters
                </Button>
              </Grid>
            )}
          </Grid>
        </div>
      )}

      {/* Results summary */}
      {!loading && filteredClients.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedClients.length} of {filteredClients.length} clients
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: brandColors.primary }} />
        </Box>
      ) : (
        <>
          {/* No clients message */}
          {clients.length === 0 ? (
            <div className="empty-state">
              <GroupsOutlinedIcon className="empty-state-icon" />
              <Typography variant="h6" className="empty-state-title">
                No clients found
              </Typography>
              <Typography variant="body2" className="empty-state-message">
                You haven't added any clients yet. Click the "Add Client" button to create your first client.
              </Typography>
              <Button 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddDialogOpen(true)}
                className="add-button"
              >
                Add Client
              </Button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <SearchIcon className="empty-state-icon" />
              <Typography variant="h6" className="empty-state-title">
                No matching clients
              </Typography>
              <Typography variant="body2" className="empty-state-message">
                No clients match your current filters. Try adjusting your search criteria.
              </Typography>
              <Button 
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Client list - grid or table view */}
              {viewMode === 'grid' ? renderGridView() : renderTableView()}
              
              {/* Pagination */}
              {filteredClients.length > rowsPerPage && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={Math.ceil(filteredClients.length / rowsPerPage)} 
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Forms */}
      <AddClientForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddClient}
      />

      <EditClientForm
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={handleEditClient}
        client={selectedClient}
      />

      {/* Add the ConfirmationDialog component */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirmation}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteConfirmation.clientName}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        confirmButtonColor="error"
      />

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 
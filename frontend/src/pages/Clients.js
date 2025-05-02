import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosConfig from '../config/axiosConfig';
import './Clients.css';

// Material UI Imports
import { 
  Typography, 
  Button, 
  CircularProgress, 
  Box, 
  Grid, 
  Paper, 
  Tooltip, 
  IconButton,
  Chip,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

// Icon imports
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

// Brand colors
const brandColors = {
  primary: '#1976d2',
  secondary: '#388e3c',
  accent: '#f57c00',
  light: '#f5f5f5',
  text: '#333333'
};

const Clients = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterGST, setFilterGST] = useState('all');

  useEffect(() => {
    fetchClients();
  }, [currentUser]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.get('/api/client', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      setClients(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients. Please try again later.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort clients
  const filteredClients = clients.filter(client => {
    // Filter by search term
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.phone && client.phone.includes(searchTerm));
    
    // Filter by GST status
    if (filterGST === 'all') return matchesSearch;
    if (filterGST === 'registered') return matchesSearch && client.gst_number;
    if (filterGST === 'unregistered') return matchesSearch && !client.gst_number;
    
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by selected field
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'email') {
      comparison = (a.email || '').localeCompare(b.email || '');
    } else if (sortBy === 'phone') {
      comparison = (a.phone || '').localeCompare(b.phone || '');
    }
    
    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Client statistics
  const totalClients = clients.length;
  const registeredGST = clients.filter(client => client.gst_number).length;
  const unregisteredGST = clients.filter(client => !client.gst_number).length;

  // Handle reset filters
  const handleReset = () => {
    setSearchTerm('');
    setSortBy('name');
    setSortOrder('asc');
    setFilterGST('all');
  };

  if (loading) {
    return (
      <Box className="clients-container loading-container">
        <CircularProgress size={60} thickness={4} sx={{ color: brandColors.primary }} />
        <Typography variant="h6" sx={{ mt: 2, color: brandColors.text }}>
          Loading clients...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="clients-container error-container">
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 60, color: 'error.main' }} />
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={fetchClients}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2, bgcolor: brandColors.primary, '&:hover': { bgcolor: brandColors.primary + 'dd' } }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <div className="clients-container">
      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <Typography variant="h4" component="h1" className="page-title">
            Client Management
          </Typography>
          <Button
            component={Link}
            to="/client/create"
            variant="contained"
            startIcon={<PersonAddAltOutlinedIcon />}
            className="create-client-btn"
            sx={{ bgcolor: brandColors.primary, '&:hover': { bgcolor: brandColors.primary + 'dd' } }}
          >
            Add New Client
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <Grid container spacing={3} className="client-stats">
        <Grid item xs={12} sm={4}>
          <Paper className="stat-card" elevation={2}>
            <PersonOutlineOutlinedIcon sx={{ color: brandColors.primary, fontSize: 32 }} />
            <div>
              <Typography variant="h6">Total Clients</Typography>
              <Typography variant="h4">{totalClients}</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="stat-card" elevation={2}>
            <ReceiptOutlinedIcon sx={{ color: brandColors.secondary, fontSize: 32 }} />
            <div>
              <Typography variant="h6">GST Registered</Typography>
              <Typography variant="h4">{registeredGST}</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="stat-card" elevation={2}>
            <ReceiptOutlinedIcon sx={{ color: brandColors.accent, fontSize: 32 }} />
            <div>
              <Typography variant="h6">Non-GST</Typography>
              <Typography variant="h4">{unregisteredGST}</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper className="search-filter-container" elevation={1}>
        <div className="search-box">
          <SearchOutlinedIcon className="search-icon" />
          <TextField 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients by name, email or phone"
            variant="standard"
            fullWidth
            InputProps={{ disableUnderline: true }}
          />
        </div>
        
        <div className="view-controls">
          <Tooltip title="Grid View">
            <IconButton 
              onClick={() => setViewMode('grid')} 
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <GridViewOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton 
              onClick={() => setViewMode('list')} 
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewListOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
        
        <div className="filter-controls">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 100, mr: 2 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Order"
            >
              <MenuItem value="asc">A-Z</MenuItem>
              <MenuItem value="desc">Z-A</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>GST Status</InputLabel>
            <Select
              value={filterGST}
              onChange={(e) => setFilterGST(e.target.value)}
              label="GST Status"
              startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Clients</MenuItem>
              <MenuItem value="registered">GST Registered</MenuItem>
              <MenuItem value="unregistered">Non-GST</MenuItem>
            </Select>
          </FormControl>
          
          {(searchTerm || sortBy !== 'name' || sortOrder !== 'asc' || filterGST !== 'all') && (
            <Tooltip title="Reset Filters">
              <IconButton onClick={handleReset} color="default" sx={{ ml: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Paper>

      {/* Client Content */}
      <div className="client-content">
        {filteredClients.length === 0 ? (
          <Box className="empty-state">
            <PersonOutlineOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {clients.length === 0 ? "No clients added yet" : "No matching clients found"}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph align="center">
              {clients.length === 0 
                ? "Start building your client list by adding your first client."
                : "Try adjusting your search or filter settings."}
            </Typography>
            {clients.length === 0 && (
              <Button
                component={Link}
                to="/client/create"
                variant="contained"
                startIcon={<PersonAddAltOutlinedIcon />}
                sx={{ mt: 2, bgcolor: brandColors.primary }}
              >
                Add First Client
              </Button>
            )}
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3} className="clients-grid">
            {filteredClients.map((client) => (
              <Grid item xs={12} sm={6} md={4} key={client._id}>
                <Card className="client-card" elevation={0}>
                  <div className="client-card-header">
                    <div className="client-icon">
                      <PersonOutlineOutlinedIcon />
                    </div>
                    <div>
                      <Typography variant="h6" className="client-name">
                        {client.name}
                      </Typography>
                      <Typography variant="body2" className="client-email">
                        {client.email || 'No email provided'}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="client-card-details">
                    {client.phone && (
                      <div className="client-detail">
                        <PhoneOutlinedIcon />
                        <div className="client-detail-content">
                          {client.phone}
                        </div>
                      </div>
                    )}
                    
                    {client.address && (
                      <div className="client-detail">
                        <HomeOutlinedIcon />
                        <div className="client-detail-content">
                          {client.address}
                        </div>
                      </div>
                    )}
                    
                    {client.gst_number && (
                      <div className="client-detail">
                        <ReceiptOutlinedIcon />
                        <div className="client-detail-content">
                          {client.gst_number}
                        </div>
                      </div>
                    )}
                    
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      <Chip 
                        label={client.gst_number ? "GST Registered" : "Non-GST"} 
                        size="small"
                        className="gst-status-chip"
                      />
                    </Box>
                  </div>
                  
                  <div className="client-card-actions">
                    <Button
                      component={Link}
                      to={`/client/${client._id}`}
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      className="action-btn view"
                    >
                      View
                    </Button>
                    <Button
                      component={Link}
                      to={`/client/edit/${client._id}`}
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      className="action-btn edit"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      className="action-btn delete"
                      onClick={() => {
                        // Delete functionality would go here
                        alert('Delete client: ' + client.name);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <div className="clients-table">
            <div className="table-header">
              <div className="col" data-label="Name">Name</div>
              <div className="col" data-label="Email">Email</div>
              <div className="col" data-label="Phone">Phone</div>
              <div className="col" data-label="GST Status">GST Status</div>
              <div className="col actions" data-label="Actions">Actions</div>
            </div>
            {filteredClients.map((client) => (
              <div className="table-row" key={client._id}>
                <div className="col" data-label="Name">
                  <div className="client-name-cell">
                    <PersonOutlineOutlinedIcon sx={{ mr: 1, color: brandColors.primary, fontSize: 20 }} />
                    {client.name}
                  </div>
                </div>
                <div className="col" data-label="Email">{client.email || 'N/A'}</div>
                <div className="col" data-label="Phone">{client.phone || 'N/A'}</div>
                <div className="col" data-label="GST Status">
                  <Chip 
                    label={client.gst_number ? "GST Registered" : "Non-GST"} 
                    size="small"
                    color={client.gst_number ? "success" : "default"}
                  />
                </div>
                <div className="col actions" data-label="Actions">
                  <Tooltip title="View Details">
                    <IconButton
                      component={Link}
                      to={`/client/${client._id}`}
                      size="small"
                      sx={{ mr: 1, color: brandColors.primary }}
                    >
                      <VisibilityOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      component={Link}
                      to={`/client/edit/${client._id}`}
                      size="small"
                      sx={{ mr: 1, color: brandColors.secondary }}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      sx={{ color: 'error.main' }}
                      onClick={() => {
                        // Delete functionality would go here
                        alert('Delete client: ' + client.name);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;

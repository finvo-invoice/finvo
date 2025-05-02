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
  Avatar,
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
  Tabs,
  Tab,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AddCompanyForm from '../components/company/AddCompanyForm';
import EditCompanyForm from '../components/company/EditCompanyForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import './CompanyProfiles.css'; // Import company-specific styles

// Premium icons
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';

// Add the SortIcon import
import SortIcon from '@mui/icons-material/Sort';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

// Add more suitable sorting icons
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import UpDownArrowsIcon from '@mui/icons-material/ImportExport';

export default function CompanyProfiles() {
  const { session } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Define premium brand colors
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
  
  // State for company data and UI
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Add state for delete confirmation dialog
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    companyId: null,
    companyName: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchCompanies();
    }
  }, [session]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch companies',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (newCompany) => {
    try {
      console.log('Adding company with data:', newCompany);
      
      const formData = new FormData();
      
      // Append basic company information
      formData.append('name', newCompany.name || '');
      formData.append('address', newCompany.address || '');
      formData.append('email', newCompany.email || '');
      formData.append('phone', newCompany.phone || '');
      formData.append('gst', newCompany.gst || '');
      formData.append('pan', newCompany.pan || ''); // Always include pan
      
      // Handle bank details properly
      const bankDetails = {
        accountName: newCompany.bankDetails.accountName || '',
        accountNumber: newCompany.bankDetails.accountNumber || '',
        bankName: newCompany.bankDetails.bankName || '',
        ifscCode: newCompany.bankDetails.ifscCode || '',
        branch: newCompany.bankDetails.branch || ''
      };
      formData.append('bankDetails', JSON.stringify(bankDetails));

      // Handle logo if present
      if (newCompany.logo instanceof File) {
        console.log('Appending logo file:', newCompany.logo.name);
        formData.append('logo', newCompany.logo);
      }

      const response = await axiosInstance.post('/api/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Company created successfully:', response.data);

      setCompanies([...companies, response.data]);
      setIsAddDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Company added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding company:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add company',
        severity: 'error'
      });
    }
  };

  const handleEditCompany = async (updatedCompany) => {
    try {
      console.log('Updating company with data:', updatedCompany);
      
      const formData = new FormData();
      
      // Append basic company information
      formData.append('name', updatedCompany.name || '');
      formData.append('address', updatedCompany.address || '');
      formData.append('email', updatedCompany.email || '');
      formData.append('phone', updatedCompany.phone || '');
      formData.append('gst', updatedCompany.gst || '');
      formData.append('pan', updatedCompany.pan || '');
      
      // Handle bank details properly
      const bankDetails = {
        accountName: updatedCompany.bankDetails.accountName || '',
        accountNumber: updatedCompany.bankDetails.accountNumber || '',
        bankName: updatedCompany.bankDetails.bankName || '',
        ifscCode: updatedCompany.bankDetails.ifscCode || '',
        branch: updatedCompany.bankDetails.branch || ''
      };
      formData.append('bankDetails', JSON.stringify(bankDetails));

      // Handle logo if present
      if (updatedCompany.logo instanceof File) {
        console.log('Appending logo file:', updatedCompany.logo.name);
        formData.append('logo', updatedCompany.logo);
      }

      const response = await axiosInstance.put(`/api/companies/${updatedCompany.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Company updated successfully:', response.data);

      setCompanies(companies.map(company => 
        company.id === updatedCompany.id ? response.data : company
      ));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setSnackbar({
        open: true,
        message: 'Company updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating company:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update company',
        severity: 'error'
      });
    }
  };

  const handleEditClick = (company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (company) => {
    setDeleteConfirmation({
      open: true,
      companyId: company.id,
      companyName: company.name
    });
  };

  const handleDeleteConfirmation = async () => {
    try {
      await axiosInstance.delete(`/api/companies/${deleteConfirmation.companyId}`);
      setCompanies(companies.filter(company => company.id !== deleteConfirmation.companyId));
      setSnackbar({
        open: true,
        message: 'Company deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete company',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmation({
        open: false,
        companyId: null,
        companyName: ''
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      open: false,
      companyId: null,
      companyName: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSortChange = (direction) => {
    setSortDirection(direction);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSortDirection('asc');
    setPage(1);
  };

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    return companies
      .filter(company => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (company.name && company.name.toLowerCase().includes(searchLower)) ||
          (company.email && company.email.toLowerCase().includes(searchLower)) ||
          (company.phone && company.phone.toLowerCase().includes(searchLower)) ||
          (company.address && company.address.toLowerCase().includes(searchLower))
          );
      })
      .sort((a, b) => {
        if (!a.name || !b.name) return 0;
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
  }, [companies, searchTerm, sortDirection]);

  // Paginate companies
  const paginatedCompanies = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCompanies, page, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);

  if (loading) {
    return (
      <div className="dashboard-content-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Companies</h1>
          <p className="dashboard-subtitle">Loading company data...</p>
        </div>
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <CircularProgress style={{ color: brandColors.primary }} />
        </div>
      </div>
    );
  }

  // Component to render company logo with proper styling
  const CompanyLogo = ({ company, size }) => (
    <Avatar
      className="company-logo"
                    src={company.logo_url}
                    alt={company.name}
                    sx={{ 
        width: size || 50, 
        height: size || 50,
        mr: 2,
        objectFit: 'contain',
        bgcolor: 'var(--neutral-gray-100)',
        borderRadius: '8px',
        border: '1px solid var(--neutral-gray-200)',
        '& .MuiAvatar-img': {
                      objectFit: 'contain',
          width: '80%',
          height: '80%',
          margin: 'auto'
        }
      }}
      variant="rounded"
      imgProps={{
        style: {
          maxWidth: '100%',
          maxHeight: '100%'
        }
      }}
    >
      {company.name.charAt(0)}
                  </Avatar>
  );

  return (
    <Box className="company-container">
      {/* Page Header with underline accent */}
      <Box className="page-header">
        <Typography variant="h4" className="page-title">
          Company Profiles
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Manage your company information for invoices and billing
                </Typography>
              </Box>

      {/* Search and filter section */}
      <Box className="search-filter-container">
        <TextField
          className="search-input"
          placeholder="Search companies..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={clearSearch}
                  size="small"
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearOutlinedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box className="controls-container">
          {/* View Mode Toggle */}
          <Box className="view-mode-toggle">
            <IconButton
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              size="small"
              aria-label="grid view"
            >
              <GridViewRoundedIcon />
            </IconButton>
            <IconButton
              className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              size="small"
              aria-label="list view"
            >
              <ViewListRoundedIcon />
            </IconButton>
          </Box>

          {/* Sort Button */}
          <Button
            className={`sort-button ${sortDirection === 'desc' ? 'desc' : ''}`}
            onClick={toggleSortDirection}
            startIcon={<SwapVertIcon className="sort-icon" />}
            size="small"
          >
            {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>

          {/* Add Company Button */}
          <Button
            className="add-button"
            onClick={() => setIsAddDialogOpen(true)}
            startIcon={<AddCircleOutlineRoundedIcon />}
            variant="contained"
          >
            Add Company
          </Button>
        </Box>
      </Box>

      {/* Main Content - Companies */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: brandColors.primary }} />
                  </Box>
      ) : (
        <>
          {companies.length === 0 ? (
            <Box className="no-data-container">
              <BusinessRoundedIcon className="no-data-icon" />
              <Typography variant="h6" className="no-data-text">
                No companies found
                    </Typography>
              <Button
                className="add-button"
                onClick={() => setIsAddDialogOpen(true)}
                startIcon={<AddCircleOutlineRoundedIcon />}
                variant="contained"
              >
                Add Your First Company
              </Button>
                  </Box>
          ) : viewMode === 'grid' ? (
            // Grid View
            <Box className="company-grid">
              {/* Map through companies and render grid cards */}
              {companies
                .filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {
                  const nameA = a.name.toLowerCase();
                  const nameB = b.name.toLowerCase();
                  if (sortDirection === 'asc') {
                    return nameA.localeCompare(nameB);
                  } else {
                    return nameB.localeCompare(nameA);
                  }
                })
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map(company => (
                  <Card key={company.id} className="company-card">
                    <Box className="company-card-header">
                      <CompanyLogo company={company} />
                      <Box>
                        <Typography variant="h6" className="company-name">
                          {company.name}
                    </Typography>
                        {company.gst && (
                        <Chip 
                          size="small" 
                            label={`GST: ${company.gst}`}
                            className="company-chip gst"
                            sx={{ mt: 1 }}
                          />
                        )}
                        {company.pan && (
                          <Chip 
                            size="small" 
                            label={`PAN: ${company.pan}`}
                            className="company-chip pan"
                            sx={{ mt: 1, ml: company.gst ? 1 : 0 }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box className="company-card-content">
                      {company.email && (
                        <Box className="company-detail">
                          <EmailOutlinedIcon fontSize="small" />
                          <Typography variant="body2">{company.email}</Typography>
                        </Box>
                      )}
                      {company.phone && (
                        <Box className="company-detail">
                          <PhoneOutlinedIcon fontSize="small" />
                          <Typography variant="body2">{company.phone}</Typography>
                        </Box>
                      )}
                      {company.address && (
                        <Box className="company-detail">
                          <LocationOnOutlinedIcon fontSize="small" />
                          <Typography variant="body2">{company.address}</Typography>
                        </Box>
                      )}
                      {company.bankDetails?.accountNumber && (
                        <Box className="company-detail">
                          <AccountBalanceOutlinedIcon fontSize="small" />
                          <Box>
                            <Typography variant="body2">
                              {company.bankDetails.bankName}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              A/C: {company.bankDetails.accountNumber}
                    </Typography>
                  </Box>
                </Box>
                      )}
              </Box>
                    <Box className="company-card-actions">
                      <IconButton 
                        onClick={() => handleEditClick(company)}
                        className="action-button edit"
                size="small"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(company)}
                        className="action-button delete"
                size="small"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
          </Card>
                ))}
            </Box>
          ) : (
            // List View
            <TableContainer className="dashboard-table">
              <Table>
        <TableHead>
          <TableRow>
                    <TableCell>Company Name</TableCell>
            <TableCell>Contact Info</TableCell>
            <TableCell>GST Number</TableCell>
            <TableCell>PAN Number</TableCell>
            <TableCell>Bank Details</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
                  {companies
                    .filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => {
                      const nameA = a.name.toLowerCase();
                      const nameB = b.name.toLowerCase();
                      if (sortDirection === 'asc') {
                        return nameA.localeCompare(nameB);
                      } else {
                        return nameB.localeCompare(nameA);
                      }
                    })
                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                    .map(company => (
                      <TableRow key={company.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CompanyLogo company={company} size={40} />
                            <Typography variant="subtitle2" className="company-name">
                              {company.name}
                            </Typography>
                </Box>
              </TableCell>
              <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {company.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailOutlinedIcon fontSize="small" sx={{ color: brandColors.primary }} />
                                <Typography variant="body2">{company.email}</Typography>
                    </Box>
                  )}
                  {company.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneOutlinedIcon fontSize="small" sx={{ color: brandColors.primary }} />
                                <Typography variant="body2">{company.phone}</Typography>
                    </Box>
                  )}
                          </Box>
              </TableCell>
              <TableCell>
                {company.gst ? (
                  <Chip 
                    size="small" 
                    label={company.gst} 
                              className="company-chip gst"
                  />
                ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Not provided
                            </Typography>
                )}
              </TableCell>
              <TableCell>
                {company.pan ? (
                  <Chip 
                    size="small" 
                    label={company.pan} 
                    className="company-chip pan"
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Not provided
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                          {company.bankDetails?.accountNumber ? (
                            <Box>
                              <Typography variant="subtitle2">
                      {company.bankDetails.bankName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          A/C: {company.bankDetails.accountNumber}
                              </Typography>
                        </Box>
                  ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Not provided
                            </Typography>
                  )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                            onClick={() => handleEditClick(company)}
                            className="action-button edit"
                  size="small"
                >
                            <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                            onClick={() => handleDeleteClick(company)}
                            className="action-button delete"
                  size="small"
                >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          )}
              
              {/* Pagination */}
          {companies.length > 0 && (
                  <Pagination 
              count={Math.ceil(companies.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase())).length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
              variant="outlined"
              shape="rounded"
              sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
            />
          )}
        </>
      )}

      {/* Add Company Dialog */}
      <AddCompanyForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCompany}
      />

      {/* Edit Company Dialog */}
      {selectedCompany && (
      <EditCompanyForm
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleEditCompany}
        company={selectedCompany}
      />
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        title="Delete Company"
        message={`Are you sure you want to delete ${deleteConfirmation.companyName || 'this company'}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirmation}
        onClose={handleDeleteCancel}
      />

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SortIcon from '@mui/icons-material/Sort';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import { useTheme, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';

import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import AddProjectForm from '../components/projects/AddProjectForm';
import EditProjectForm from '../components/projects/EditProjectForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

import './ProjectProfiles.css';

const PROJECT_STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];
const PAYMENT_STATUSES = ['All', 'Pending', 'Partial', 'Paid'];
const ROWS_PER_PAGE = 9;

export default function ProjectProfiles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { session } = useAuth();
  
  // State for projects
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    projectId: null,
    projectName: ''
  });
  
  // Fetch projects on component mount
  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    }
  }, [session]);
  
  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/projects');
      setProjects(response.data.map(project => ({
        ...project,
        notes: project.notes || '',
        links: project.links || ''
      })));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load projects',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new project
  const handleAddProject = async (projectData) => {
    try {
      const formattedData = {
        projectName: projectData.projectName,
        clientName: projectData.clientName,
        numberOfFiles: parseInt(projectData.numberOfFiles),
        unitPrice: parseFloat(projectData.unitPrice),
        projectStatus: projectData.projectStatus,
        paymentStatus: projectData.paymentStatus,
        notes: projectData.notes || '',
        links: projectData.links || '',
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null
      };
      
      const response = await axiosInstance.post('/api/projects', formattedData);
      setProjects([...projects, response.data]);
      setSnackbar({
        open: true,
        message: 'Project added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add project',
        severity: 'error'
      });
    }
  };
  
  // Handle editing a project
  const handleEditProject = async (projectData) => {
    try {
      const formattedData = {
        id: projectData.id,
        projectName: projectData.projectName,
        clientName: projectData.clientName,
        numberOfFiles: parseInt(projectData.numberOfFiles),
        unitPrice: parseFloat(projectData.unitPrice),
        projectStatus: projectData.projectStatus,
        paymentStatus: projectData.paymentStatus,
        notes: projectData.notes || '',
        links: projectData.links || '',
        startDate: projectData.startDate,
        endDate: projectData.endDate
      };
      
      const response = await axiosInstance.put(`/api/projects/${projectData.id}`, formattedData);
      setProjects(projects.map(project => project.id === projectData.id ? response.data : project));
      setSnackbar({
        open: true,
        message: 'Project updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update project',
        severity: 'error'
      });
    }
  };
  
  // Delete confirmation
  const handleDeleteClick = (project) => {
    setDeleteConfirmation({
      open: true,
      projectId: project.id,
      projectName: project.projectName
    });
  };
  
  // Handle delete confirmation
  const handleDeleteConfirmation = async () => {
    try {
      await axiosInstance.delete(`/api/projects/${deleteConfirmation.projectId}`);
      setProjects(projects.filter(project => project.id !== deleteConfirmation.projectId));
      setSnackbar({
        open: true,
        message: 'Project deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete project',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmation({
        open: false,
        projectId: null,
        projectName: ''
      });
    }
  };
  
  // Handle cancel delete
  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      open: false,
      projectId: null,
      projectName: ''
    });
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Functions for sorting and filtering
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };
  
  const handleProjectStatusFilterChange = (event) => {
    setProjectStatusFilter(event.target.value);
    setPage(1);
  };
  
  const handlePaymentStatusFilterChange = (event) => {
    setPaymentStatusFilter(event.target.value);
    setPage(1);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setProjectStatusFilter('All');
    setPaymentStatusFilter('All');
    setPage(1);
  };
  
  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        const matchesSearch = 
          project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesProjectStatus = 
          projectStatusFilter === 'All' || 
          project.projectStatus === projectStatusFilter;
        
        const matchesPaymentStatus = 
          paymentStatusFilter === 'All' || 
          project.paymentStatus === paymentStatusFilter;
        
        return matchesSearch && matchesProjectStatus && matchesPaymentStatus;
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        
        if (orderBy === 'projectName') {
          return isAsc 
            ? a.projectName.localeCompare(b.projectName) 
            : b.projectName.localeCompare(a.projectName);
        } else if (orderBy === 'clientName') {
          return isAsc 
            ? a.clientName.localeCompare(b.clientName) 
            : b.clientName.localeCompare(a.clientName);
        } else if (orderBy === 'total') {
          return isAsc 
            ? a.total - b.total 
            : b.total - a.total;
        } else if (orderBy === 'startDate') {
          const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
          return isAsc ? dateA - dateB : dateB - dateA;
        } else if (orderBy === 'createdAt') {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return isAsc ? dateA - dateB : dateB - dateA;
        }
        
        return 0;
      });
  }, [projects, searchTerm, projectStatusFilter, paymentStatusFilter, orderBy, order]);
  
  // Paginated projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredProjects, page]);
  
  // Status helper functions for styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'not-started';
      case 'In Progress':
        return 'in-progress';
      case 'Completed':
        return 'completed';
      default:
        return '';
    }
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'Partial':
        return 'partial';
      case 'Paid':
        return 'paid';
      default:
        return '';
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Render project card (grid view)
  const renderProjectCard = (project) => (
    <div className="project-card" key={project.id}>
      <div className="project-card-header">
        <div className="project-icon">
          <AssignmentOutlinedIcon />
        </div>
        <div>
          <Typography variant="h6" className="project-name">
            {project.projectName}
          </Typography>
          <Typography variant="body2" className="project-client">
            {project.clientName}
          </Typography>
        </div>
      </div>
      
      <div className="project-card-content">
        <div className="project-detail">
          <CalendarTodayIcon fontSize="small" />
          <div className="project-detail-content">
            <Typography variant="body2">
              Created: {formatDate(project.createdAt)}
            </Typography>
          </div>
        </div>
        
        <div className="project-detail">
          <PersonOutlineIcon fontSize="small" />
          <Typography variant="body2">
            {project.clientName}
          </Typography>
        </div>
        
        <div className="project-detail">
          <ReceiptOutlinedIcon fontSize="small" />
          <Typography variant="body2">
            {project.numberOfFiles} files × ₹{project.unitPrice.toFixed(2)}
          </Typography>
        </div>
        
        <div className="project-detail">
          <CurrencyRupeeIcon fontSize="small" />
          <Typography variant="body2" className="price-text">
            Total: ₹{project.total.toFixed(2)}
          </Typography>
        </div>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {project.projectStatus !== 'Not Started' && (
            <Chip 
              label={project.projectStatus} 
              size="small" 
              className={`project-status-chip ${getStatusColor(project.projectStatus)}`}
            />
          )}
          {project.paymentStatus !== 'Pending' && (
            <Chip 
              label={project.paymentStatus} 
              size="small" 
              className={`payment-status-chip ${getPaymentStatusColor(project.paymentStatus)}`}
            />
          )}
        </Box>
      </div>
      
      <div className="project-card-actions">
        <IconButton 
          className="action-button edit" 
          size="small" 
          onClick={() => {
            setSelectedProject(project);
            setIsEditDialogOpen(true);
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton 
          className="action-button delete" 
          size="small" 
          onClick={() => handleDeleteClick(project)}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );

  // Render table row (list view)
  const renderProjectTableRow = (project) => (
    <TableRow key={project.id} hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            bgcolor: 'var(--primary-dark)',
            color: 'white',
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5
          }}>
            <AssignmentOutlinedIcon fontSize="small" />
          </Box>
          <Typography fontWeight="medium">{project.projectName}</Typography>
        </Box>
      </TableCell>
      <TableCell>{project.clientName}</TableCell>
      <TableCell>
        <Chip 
          label={project.projectStatus} 
          size="small" 
          className={`project-status-chip ${getStatusColor(project.projectStatus)}`}
        />
      </TableCell>
      <TableCell>
        <Chip 
          label={project.paymentStatus} 
          size="small" 
          className={`payment-status-chip ${getPaymentStatusColor(project.paymentStatus)}`}
        />
      </TableCell>
      <TableCell>
        {formatDate(project.startDate)}
        {project.endDate && <> → {formatDate(project.endDate)}</>}
      </TableCell>
      <TableCell align="right" className="price-text">
        ₹{project.total.toFixed(2)}
      </TableCell>
      <TableCell align="right">
        <IconButton
          size="small"
          onClick={() => {
            setSelectedProject(project);
            setIsEditDialogOpen(true);
          }}
          sx={{ color: 'var(--primary-dark)' }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleDeleteClick(project)}
          color="error"
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="project-container dashboard-content-container">
      {/* Header with title and subtitle */}
      <div className="page-header">
        <Typography variant="h4" className="page-title">Project Profiles</Typography>
        <Typography variant="body1" className="page-subtitle">
          Manage your project information and track progress
        </Typography>
      </div>

      {/* Search and filter controls */}
      <div className="search-filter-container">
        <div className="search-input">
          <TextField
            fullWidth
            placeholder="Search projects..."
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
              bgcolor: showFilters ? 'var(--primary-dark)' : 'transparent',
              color: showFilters ? 'white' : 'inherit',
              borderColor: 'var(--neutral-gray-300)',
              '&:hover': {
                bgcolor: showFilters ? 'var(--primary-light)' : 'rgba(0, 38, 25, 0.04)',
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
            Add Project
          </Button>
        </div>
      </div>

      {/* Additional filters */}
      {showFilters && (
        <div className="filters-container">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Project Status</InputLabel>
                <Select
                  value={projectStatusFilter}
                  onChange={handleProjectStatusFilterChange}
                  label="Project Status"
                >
                  {PROJECT_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={handlePaymentStatusFilterChange}
                  label="Payment Status"
                >
                  {PAYMENT_STATUSES.map(status => (
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
                  <MenuItem value="createdAt">Creation Date</MenuItem>
                  <MenuItem value="projectName">Project Name</MenuItem>
                  <MenuItem value="clientName">Client Name</MenuItem>
                  <MenuItem value="total">Total Price</MenuItem>
                  <MenuItem value="startDate">Start Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(searchTerm || projectStatusFilter !== 'All' || paymentStatusFilter !== 'All') && (
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
      {!loading && filteredProjects.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedProjects.length} of {filteredProjects.length} projects
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: 'var(--primary-dark)' }} />
        </Box>
      ) : (
        <>
          {/* No projects message */}
          {projects.length === 0 ? (
            <div className="empty-state">
              <AssignmentOutlinedIcon className="empty-state-icon" />
              <Typography variant="h6" className="empty-state-title">
                No projects found
              </Typography>
              <Typography variant="body2" className="empty-state-message">
                You haven't added any projects yet. Click the "Add Project" button to create your first project.
              </Typography>
              <Button 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddDialogOpen(true)}
                className="add-button"
              >
                Add Project
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <SearchIcon className="empty-state-icon" />
              <Typography variant="h6" className="empty-state-title">
                No matching projects
              </Typography>
              <Typography variant="body2" className="empty-state-message">
                No projects match your current filters. Try adjusting your search criteria.
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
              {/* Project list - grid or table view */}
              {viewMode === 'grid' ? (
                <div className="project-grid">
                  {paginatedProjects.map(project => renderProjectCard(project))}
                </div>
              ) : (
                <div className="dashboard-table">
                  <Table aria-label="projects table">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'projectName'}
                            direction={orderBy === 'projectName' ? order : 'asc'}
                            onClick={() => handleRequestSort('projectName')}
                          >
                            Project Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'clientName'}
                            direction={orderBy === 'clientName' ? order : 'asc'}
                            onClick={() => handleRequestSort('clientName')}
                          >
                            Client
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'startDate'}
                            direction={orderBy === 'startDate' ? order : 'asc'}
                            onClick={() => handleRequestSort('startDate')}
                          >
                            Timeline
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'total'}
                            direction={orderBy === 'total' ? order : 'asc'}
                            onClick={() => handleRequestSort('total')}
                          >
                            Total
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProjects.map(project => renderProjectTableRow(project))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Pagination */}
              {filteredProjects.length > ROWS_PER_PAGE && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={Math.ceil(filteredProjects.length / ROWS_PER_PAGE)} 
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
      <AddProjectForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddProject}
      />

      <EditProjectForm
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleEditProject}
        project={selectedProject}
      />

      {/* Add the ConfirmationDialog component */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirmation}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmation.projectName}"? This action cannot be undone.`}
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
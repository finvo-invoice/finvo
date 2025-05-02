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
  Chip,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Pagination,
  Stack,
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
  Tabs,
  Tab,
  CircularProgress,
  alpha,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddProjectForm from '../components/projects/AddProjectForm';
import EditProjectForm from '../components/projects/EditProjectForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

// Constants for project status and payment status
const PROJECT_STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];
const PAYMENT_STATUSES = ['All', 'Pending', 'Partial', 'Paid'];

export default function Projects() {
  const { session } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for project data and UI
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('projectName');
  const [order, setOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Add state for delete confirmation dialog
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    projectId: null,
    projectName: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/projects');
      
      // Ensure notes and links are properly initialized
      const data = response.data.map(project => ({
        ...project,
        notes: project.notes || '',
        links: project.links || ''
      }));
      
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load projects. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (newProject) => {
    try {
      const formattedProject = {
        projectName: newProject.projectName,
        clientName: newProject.clientName,
        numberOfFiles: parseInt(newProject.numberOfFiles),
        unitPrice: parseFloat(newProject.unitPrice),
        projectStatus: newProject.projectStatus,
        paymentStatus: newProject.paymentStatus,
        notes: newProject.notes || '',
        links: newProject.links || ''
      };

      console.log('Sending new project data:', formattedProject);
      const response = await axiosInstance.post('/api/projects', formattedProject);
      console.log('Create response:', response.data);
      setProjects([...projects, response.data]);
      setIsAddDialogOpen(false);
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

  const handleEditSubmit = async (updatedProject) => {
    try {
      console.log('Updating project:', updatedProject);
      const formattedProject = {
        projectName: updatedProject.projectName,
        clientName: updatedProject.clientName,
        numberOfFiles: parseInt(updatedProject.numberOfFiles),
        unitPrice: parseFloat(updatedProject.unitPrice),
        projectStatus: updatedProject.projectStatus,
        paymentStatus: updatedProject.paymentStatus,
        notes: updatedProject.notes || '',
        links: updatedProject.links || ''
      };

      console.log('Sending formatted project data:', formattedProject);
      const response = await axiosInstance.put(`/api/projects/${updatedProject.id}`, formattedProject);
      console.log('Update response:', response.data);
      
      setProjects(projects.map(project => 
        project.id === updatedProject.id ? response.data : project
      ));
      setIsEditDialogOpen(false);
      setSelectedProject(null);
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

  const handleEditProject = (project) => {
    console.log('Editing project:', project);
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (project) => {
    console.log('Delete button clicked for project:', project);
    setDeleteConfirmation({
      open: true,
      projectId: project.id,
      projectName: project.projectName
    });
  };

  const handleDeleteConfirmation = async () => {
    try {
      console.log('Deleting project with ID:', deleteConfirmation.projectId);
      await axiosInstance.delete(`/api/projects/${deleteConfirmation.projectId}`);
      setProjects(projects.filter(project => project.id !== deleteConfirmation.projectId));
      setDeleteConfirmation({
        open: false,
        projectId: null,
        projectName: ''
      });
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
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      open: false,
      projectId: null,
      projectName: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'primary';
      case 'Not Started':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Partial':
        return 'warning';
      case 'Paid':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status, opacity = 1) => {
    switch (status) {
      case 'Paid':
        return opacity < 1 ? theme.palette.success.light : theme.palette.success.main;
      case 'Partial':
        return opacity < 1 ? theme.palette.warning.light : theme.palette.warning.main;
      case 'Pending':
        return opacity < 1 ? theme.palette.error.light : theme.palette.error.main;
      default:
        return opacity < 1 ? theme.palette.grey[300] : theme.palette.grey[700];
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleProjectStatusFilterChange = (event) => {
    setProjectStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePaymentStatusFilterChange = (event) => {
    setPaymentStatusFilter(event.target.value);
    setPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Set filters based on tab
    if (newValue === 0) { // All
      setProjectStatusFilter('All');
      setPaymentStatusFilter('All');
    } else if (newValue === 1) { // Not Started
      setProjectStatusFilter('Not Started');
      setPaymentStatusFilter('All');
    } else if (newValue === 2) { // In Progress
      setProjectStatusFilter('In Progress');
      setPaymentStatusFilter('All');
    } else if (newValue === 3) { // Completed
      setProjectStatusFilter('Completed');
      setPaymentStatusFilter('All');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setProjectStatusFilter('All');
    setPaymentStatusFilter('All');
    setTabValue(0);
    setPage(1);
  };

  // Filter and sort projects
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
        } else if (orderBy === 'numberOfFiles') {
          return isAsc 
            ? a.numberOfFiles - b.numberOfFiles 
            : b.numberOfFiles - a.numberOfFiles;
        }
        
        return 0;
      });
  }, [projects, searchTerm, projectStatusFilter, paymentStatusFilter, orderBy, order]);

  // Paginate projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredProjects.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredProjects, page, rowsPerPage]);

  // Calculate stats
  const projectStats = useMemo(() => {
    const total = projects.length;
    const notStarted = projects.filter(p => p.projectStatus === 'Not Started').length;
    const inProgress = projects.filter(p => p.projectStatus === 'In Progress').length;
    const completed = projects.filter(p => p.projectStatus === 'Completed').length;
    
    return { total, notStarted, inProgress, completed };
  }, [projects]);

  // Function to render project card
  const renderProjectCard = (project) => {
    console.log('Rendering project card with data:', project);
    
    // Format date function
    const formatDate = (dateString) => {
      if (!dateString) return 'Date not set';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    return (
      <Card 
        key={project.id} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom noWrap>
            {project.projectName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Client: {project.clientName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              Created: {formatDate(project.createdAt)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Number of Files: {project.numberOfFiles}
            </Typography>
            <Typography variant="body2">
              Unit Price: ₹{project.unitPrice.toLocaleString()}
            </Typography>
          </Box>
          
          <Typography variant="body2" fontWeight="bold" color="primary" gutterBottom>
            Total Amount: ₹{project.total.toLocaleString()}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {/* Only show project status chip if it's not "Not Started" */}
            {project.projectStatus !== 'Not Started' && (
              <Chip 
                label={project.projectStatus} 
                size="small"
                sx={{ 
                  bgcolor: getStatusColor(project.projectStatus, 0.1),
                  color: getStatusColor(project.projectStatus),
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    color: getStatusColor(project.projectStatus),
                  }
                }}
              />
            )}
            {/* Only show payment status chip if it's not "Pending" */}
            {project.paymentStatus !== 'Pending' && (
              <Chip 
                label={project.paymentStatus} 
                size="small"
                sx={{ 
                  bgcolor: getPaymentStatusColor(project.paymentStatus, 0.1),
                  color: getPaymentStatusColor(project.paymentStatus),
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    color: getPaymentStatusColor(project.paymentStatus),
                  }
                }}
              />
            )}
          </Box>
          
          {(project.notes !== undefined && project.notes !== null && project.notes.trim && project.notes.trim() !== '') && (
            <Box sx={{ mt: 2, border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Notes:
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  maxHeight: '80px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {project.notes}
              </Typography>
            </Box>
          )}
          
          {(project.links !== undefined && project.links !== null && project.links.trim && project.links.trim() !== '') && (
            <Box sx={{ mt: 2, border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Links:
              </Typography>
              <Box sx={{ maxHeight: '60px', overflow: 'hidden' }}>
                {project.links.split(/[\n,]+/).map((link, index) => {
                  const trimmedLink = link.trim();
                  if (!trimmedLink) return null;
                  
                  // Add https:// if not present
                  const fullLink = trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`;
                  
                  // Extract domain for display
                  let displayLink = trimmedLink;
                  try {
                    const url = new URL(fullLink);
                    displayLink = url.hostname;
                  } catch (e) {
                    // If URL parsing fails, just use the original
                  }
                  
                  return index < 2 ? (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      component="a" 
                      href={fullLink} 
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        display: 'block', 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {displayLink}
                    </Typography>
                  ) : index === 2 ? (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      + {project.links.split(/[\n,]+/).filter(l => l.trim()).length - 2} more
                    </Typography>
                  ) : null;
                })}
              </Box>
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
          <Button 
            size="small" 
            startIcon={<EditIcon />}
            onClick={() => handleEditProject(project)}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(project);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Function to render project table row
  const renderProjectTableRow = (project) => {
    return (
      <TableRow 
        key={project.id}
        sx={{ 
          '&:hover': { 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            cursor: 'pointer'
          }
        }}
        onClick={() => handleEditProject(project)}
      >
        <TableCell sx={{ width: '15%' }}>{project.projectName}</TableCell>
        <TableCell sx={{ width: '15%' }}>{project.clientName}</TableCell>
        <TableCell align="right" sx={{ width: '8%' }}>{project.numberOfFiles}</TableCell>
        <TableCell align="right" sx={{ width: '10%' }}>₹{project.unitPrice.toLocaleString()}</TableCell>
        <TableCell align="right" sx={{ width: '10%' }}>₹{project.total.toLocaleString()}</TableCell>
        <TableCell sx={{ width: '10%' }}>
          {project.projectStatus !== 'Not Started' && (
            <Chip 
              label={project.projectStatus} 
              size="small"
              sx={{ 
                bgcolor: getStatusColor(project.projectStatus, 0.1),
                color: getStatusColor(project.projectStatus),
                fontWeight: 500
              }}
            />
          )}
        </TableCell>
        <TableCell sx={{ width: '10%' }}>
          {project.paymentStatus !== 'Pending' && (
            <Chip 
              label={project.paymentStatus} 
              size="small"
              sx={{ 
                bgcolor: getPaymentStatusColor(project.paymentStatus, 0.1),
                color: getPaymentStatusColor(project.paymentStatus),
                fontWeight: 500,
                '& .MuiChip-label': {
                  color: getPaymentStatusColor(project.paymentStatus),
                }
              }}
            />
          )}
        </TableCell>
        <TableCell sx={{ width: '15%' }}>
          {project.notes && (
            <Tooltip title={project.notes.length > 100 ? project.notes : ""}>
              <Typography 
                variant="body2" 
                sx={{ 
                  maxWidth: '150px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {project.notes.length > 0 ? project.notes : "-"}
              </Typography>
            </Tooltip>
          )}
        </TableCell>
        <TableCell sx={{ width: '15%' }}>
          {project.links && (
            <Box>
              {project.links.split(/[\n,]+/).map((link, index) => {
                const trimmedLink = link.trim();
                if (!trimmedLink || index > 0) return null;
                
                // Add https:// if not present
                const fullLink = trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`;
                
                // Extract domain for display
                let displayLink = trimmedLink;
                try {
                  const url = new URL(fullLink);
                  displayLink = url.hostname;
                } catch (e) {
                  // If URL parsing fails, just use the original
                }
                
                return (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    component="a" 
                    href={fullLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      display: 'block',
                      maxWidth: '150px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {displayLink}
                  </Typography>
                );
              })}
              {project.links.split(/[\n,]+/).filter(l => l.trim()).length > 1 && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  + {project.links.split(/[\n,]+/).filter(l => l.trim()).length - 1} more
                </Typography>
              )}
            </Box>
          )}
        </TableCell>
        <TableCell align="right" sx={{ width: '120px', minWidth: '120px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for project:', project);
                  setDeleteConfirmation({
                    open: true,
                    projectId: project.id,
                    projectName: project.projectName
                  });
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  // Update the table headers
  const tableHeaders = [
    { id: 'projectName', label: 'Project Name', sortable: true, width: '15%' },
    { id: 'clientName', label: 'Client', sortable: true, width: '15%' },
    { id: 'numberOfFiles', label: 'Files', align: 'right', sortable: true, width: '8%' },
    { id: 'unitPrice', label: 'Unit Price', align: 'right', sortable: true, width: '10%' },
    { id: 'total', label: 'Total', align: 'right', sortable: true, width: '10%' },
    { id: 'projectStatus', label: 'Status', sortable: true, width: '10%' },
    { id: 'paymentStatus', label: 'Payment', sortable: true, width: '10%' },
    { id: 'notes', label: 'Notes', sortable: false, width: '15%' },
    { id: 'links', label: 'Links', sortable: false, width: '15%' },
    { id: 'actions', label: 'Actions', align: 'right', sortable: false, width: '120px' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header with title and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Project
        </Button>
      </Box>

      {/* Project stats cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="h4" color="text.primary">{projectStats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Projects</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="h4">{projectStats.notStarted}</Typography>
            <Typography variant="body2">Not Started</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4">{projectStats.inProgress}</Typography>
            <Typography variant="body2">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h4">{projectStats.completed}</Typography>
            <Typography variant="body2">Completed</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for quick filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label={`All (${projectStats.total})`} />
          <Tab label={`Not Started (${projectStats.notStarted})`} />
          <Tab label={`In Progress (${projectStats.inProgress})`} />
          <Tab label={`Completed (${projectStats.completed})`} />
        </Tabs>
      </Box>

      {/* Search and filter controls */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects or clients..."
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
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="medium"
            >
              Filters
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Grid view">
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('grid')}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Table view">
                <IconButton 
                  color={viewMode === 'table' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('table')}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  {filteredProjects.length} projects found
                </Typography>
                {(searchTerm || projectStatusFilter !== 'All' || paymentStatusFilter !== 'All') && (
                  <Button 
                    size="small" 
                    onClick={handleResetFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Additional filters */}
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="projectName">Project Name</MenuItem>
                    <MenuItem value="clientName">Client Name</MenuItem>
                    <MenuItem value="total">Total Amount</MenuItem>
                    <MenuItem value="numberOfFiles">Number of Files</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
          </Box>
        )}
      </Box>

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* No projects message */}
          {projects.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No projects found. Click "Add Project" to create one.
              </Typography>
            </Paper>
          ) : filteredProjects.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No projects match your filters. Try adjusting your search criteria.
              </Typography>
              <Button 
                sx={{ mt: 2 }} 
                variant="outlined" 
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <>
              {/* Project list - grid or table view */}
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {paginatedProjects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={project.id}>
                      {renderProjectCard(project)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    mt: 2,
                    overflowX: 'auto',
                    width: '100%',
                    minWidth: 1200,
                    '& .MuiTable-root': {
                      minWidth: 1200, // Ensure table has enough width for all columns
                      tableLayout: 'fixed'
                    }
                  }}
                >
                  <Table 
                    aria-label="projects table" 
                    sx={{ 
                      minWidth: 1200,
                      tableLayout: 'fixed',
                      width: '100%'
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map((header) => (
                          <TableCell
                            key={header.id}
                            align={header.align}
                            sortDirection={orderBy === header.id ? order : false}
                            sx={{ 
                              width: header.width,
                              minWidth: header.id === 'actions' ? '120px' : 'auto'
                            }}
                          >
                            <TableSortLabel
                              active={orderBy === header.id}
                              direction={orderBy === header.id ? order : 'asc'}
                              onClick={() => handleRequestSort(header.id)}
                            >
                              {header.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProjects.map((project) => 
                        renderProjectTableRow(project)
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Pagination */}
              {filteredProjects.length > rowsPerPage && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={Math.ceil(filteredProjects.length / rowsPerPage)} 
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    showFirstButton
                    showLastButton
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
        onSubmit={handleEditSubmit}
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
    </Container>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  Stack
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  Assignment as ProjectIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import { format, parseISO, isValid } from 'date-fns';

const ProjectTimeline = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('timeline'); // timeline, month, week, day
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Add parsed dates for easier handling
        const enhancedProjects = data.map(project => ({
          ...project,
          parsedStartDate: project.start_date ? parseISO(project.start_date) : null,
          parsedEndDate: project.end_date ? parseISO(project.end_date) : null
        }));
        
        setProjects(enhancedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProjects();
    }
  }, [user]);
  
  const handleViewChange = (event, newView) => {
    setView(newView);
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return theme.palette.success.main;
      case 'in progress':
        return theme.palette.primary.main;
      case 'not started':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
  };
  
  const renderTimeline = () => {
    if (projects.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column',
          p: 4
        }}>
          <ProjectIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No projects to display
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a new project to see it in the timeline
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            href="/projects"
          >
            Go to Projects
          </Button>
        </Box>
      );
    }
    
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        {projects.map((project) => (
          <Box key={project.id} sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            mb: 3
          }}>
            {!isMobile && (
              <Box sx={{ 
                width: '150px', 
                pr: 2, 
                textAlign: 'right',
                borderRight: `2px solid ${getStatusColor(project.status)}`,
                mr: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(project.start_date || project.created_at)}
                </Typography>
                {project.end_date && (
                  <Typography variant="body2" color="text.secondary">
                    Due: {formatDate(project.end_date)}
                  </Typography>
                )}
              </Box>
            )}
            <Box sx={{ 
              flex: 1, 
              position: 'relative',
              ...(isMobile && {
                borderLeft: `2px solid ${getStatusColor(project.status)}`,
                pl: 2,
                ml: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '-5px',
                  top: '15px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(project.status)
                }
              })
            }}>
              {isMobile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {formatDate(project.start_date || project.created_at)}
                </Typography>
              )}
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" component="div">
                  {project.project_name}
                </Typography>
                <Chip 
                  label={project.status || 'No Status'} 
                  size="small" 
                  sx={{ 
                    my: 1,
                    bgcolor: getStatusColor(project.status),
                    color: '#fff'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {project.description || 'No description provided'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    href={`/projects/${project.id}`}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        ))}
      </Stack>
    );
  };
  
  const renderCalendarView = () => {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6">
          Calendar View Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          We're working on a comprehensive calendar view for your projects.
        </Typography>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Project Timeline
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          href="/projects"
        >
          Manage Projects
        </Button>
      </Box>
      
      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }} elevation={2}>
        <Tabs
          value={view}
          onChange={handleViewChange}
          variant="scrollable"
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{ 
            px: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: theme.palette.background.default
          }}
        >
          <Tab 
            value="timeline" 
            label="Timeline" 
            icon={<TimelineIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="month" 
            label="Month" 
            icon={<CalendarIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="week" 
            label="Week" 
            icon={<WeekIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="day" 
            label="Day" 
            icon={<DayIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ p: { xs: 0, sm: 2 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : (
            <Box>
              {view === 'timeline' && renderTimeline()}
              {(view === 'month' || view === 'week' || view === 'day') && renderCalendarView()}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectTimeline; 
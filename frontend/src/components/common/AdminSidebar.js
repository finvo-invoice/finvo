import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      title: 'Users',
      icon: <PeopleIcon />,
      path: '/admin/users'
    },
    {
      title: 'Messages',
      icon: <EmailIcon />,
      path: '/admin/messages'
    },
    {
      title: 'Payments',
      icon: <PaymentsIcon />,
      path: '/admin/payments'
    },
    {
      title: 'Analytics',
      icon: <InsightsIcon />,
      path: '/admin/analytics'
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/admin/settings'
    }
  ];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        minHeight: '100%',
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        width: 240,
        position: 'sticky',
        top: 64
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="primary" fontWeight="bold">
          Admin Portal
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path}
            key={item.title}
            selected={location.pathname === item.path}
            sx={{
              py: 1,
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                borderRight: '3px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'medium' : 'regular'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminSidebar; 
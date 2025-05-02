import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  AttachMoney as MoneyIcon,
  Mail as MailIcon,
  InsertChart as ChartIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';

// Mock data
const dashboardStats = {
  totalUsers: 783,
  newUsersThisMonth: 124,
  totalRevenue: '$58,945',
  revenueGrowth: 23.5,
  pendingInquiries: 18,
  activeSubscriptions: 651
};

const recentUsers = [
  {
    id: 1,
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    plan: 'Pro',
    joinDate: '2023-07-20',
    avatar: '#5e35b1'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    plan: 'Enterprise',
    joinDate: '2023-07-18',
    avatar: '#1e88e5'
  },
  {
    id: 3,
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    plan: 'Free',
    joinDate: '2023-07-15',
    avatar: '#43a047'
  },
  {
    id: 4,
    name: 'David Rodriguez',
    email: 'david.r@example.com',
    plan: 'Pro',
    joinDate: '2023-07-12',
    avatar: '#e53935'
  }
];

const AdminDashboard = () => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPlanColor = (plan) => {
    switch(plan) {
      case 'Free':
        return 'text.secondary';
      case 'Pro':
        return 'primary.main';
      case 'Enterprise':
        return 'secondary.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of system metrics and recent activity
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Users
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {dashboardStats.totalUsers}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                {dashboardStats.newUsersThisMonth} new this month
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Revenue
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {dashboardStats.totalRevenue}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                {dashboardStats.revenueGrowth}% increase
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MailIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Messages
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {dashboardStats.pendingInquiries}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography 
                variant="body2"
                component={Link}
                to="/admin/messages"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                View pending inquiries
                <ArrowForwardIcon sx={{ fontSize: 14, ml: 0.5 }} />
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Subscriptions
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {dashboardStats.activeSubscriptions}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
              <Typography variant="body2" color="error.main">
                5 cancellations this week
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Users */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            overflow: 'hidden'
          }}>
            <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">
                Recent Users
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {recentUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ bgcolor: user.avatar, width: 32, height: 32, fontSize: '0.875rem' }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {user.name}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color={getPlanColor(user.plan)}
                            sx={{ ml: 1, fontWeight: 'medium' }}
                          >
                            {user.plan}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {user.email} • Joined {formatDate(user.joinDate)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {user.id !== recentUsers.length && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button 
                component={Link}
                to="/admin/users"
                size="small"
                endIcon={<ArrowForwardIcon />}
              >
                View All Users
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card 
                  component={Link} 
                  to="/admin/messages"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MailIcon sx={{ mr: 2 }} />
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1">
                      Manage Contact Messages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and respond to customer inquiries
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  component={Link} 
                  to="/admin/users"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <PeopleIcon sx={{ mr: 2 }} />
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1">
                      User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View, edit, and manage user accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  component={Link} 
                  to="/admin/analytics"
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <ChartIcon sx={{ mr: 2 }} />
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1">
                      Analytics Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View detailed platform statistics
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 
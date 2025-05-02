import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  IconButton,
  Tooltip,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  Menu
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

// Define keyframes for badge pulse animation
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;

// Define keyframes for bell animation
const bellRingAnimation = keyframes`
  0% { transform: rotate(0); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-15deg); }
  15% { transform: rotate(13deg); }
  20% { transform: rotate(-13deg); }
  25% { transform: rotate(10deg); }
  30% { transform: rotate(-10deg); }
  35% { transform: rotate(7deg); }
  40% { transform: rotate(-7deg); }
  45% { transform: rotate(3deg); }
  50% { transform: rotate(0); }
  100% { transform: rotate(0); }
`;

// Styled notification button
const NotificationButton = styled(IconButton)(({ theme, hasUnread }) => ({
  width: '48px',
  height: '48px',
  backgroundColor: hasUnread ? alpha(theme.palette.error.light, 0.1) : 'transparent',
  border: hasUnread 
    ? `2px solid ${theme.palette.error.main}`
    : `1px solid ${alpha(theme.palette.grey[400], 0.5)}`,
  color: hasUnread 
    ? theme.palette.primary.main
    : alpha(theme.palette.text.primary, 0.8),
  transition: 'all 0.2s ease',
  marginRight: theme.spacing(1),
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.05)'
  },
  '& .MuiSvgIcon-root': {
    animation: hasUnread ? `${bellRingAnimation} 2s ease-in-out` : 'none',
    animationDelay: '0.5s',
    fontSize: '1.75rem',
    display: 'block',
    color: hasUnread ? theme.palette.primary.main : 'inherit'
  }
}));

const NotificationMenu = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <SuccessIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <NotificationButton
          hasUnread={unreadCount > 0}
          onClick={handleToggle}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          aria-label="Notifications"
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: '20px',
                minWidth: '20px',
                padding: '0 6px',
                fontWeight: 'bold',
                animation: unreadCount > 0 ? `${pulseAnimation} 2s infinite` : 'none'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </NotificationButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        PaperProps={{
          elevation: 6,
          sx: {
            width: 360,
            maxWidth: '100%',
            mt: 1.5,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 100px)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.primary.main,
            color: '#fff'
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="inherit">
            Notifications {unreadCount > 0 && `(${unreadCount} new)`}
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={markAllAsRead} sx={{ color: '#fff', mr: 1 }}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {notifications.length > 0 && (
              <Tooltip title="Clear all notifications">
                <IconButton size="small" onClick={clearAllNotifications} sx={{ color: '#fff' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        bgcolor: notification.read 
                          ? alpha(theme.palette.primary.main, 0.04)
                          : alpha(theme.palette.primary.main, 0.12)
                      },
                      position: 'relative',
                      '&::after': notification.read ? {} : {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: theme.palette.primary.main
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          fontWeight={notification.read ? 400 : 600}
                          gutterBottom
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {getTimeAgo(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <Tooltip title="Delete notification">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{ 
                          ml: 1, 
                          mt: 0.5,
                          opacity: 0.5,
                          '&:hover': {
                            opacity: 1,
                            color: theme.palette.error.main
                          } 
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsOffIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.primary, 0.2), mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications to display
              </Typography>
            </Box>
          )}
        </Box>
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              onClick={() => {
                handleClose();
                // Navigate to a dedicated notifications page if you have one
                // navigate('/notifications');
              }}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../config/axiosConfig';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Simulate API call - in a real app, this would be an actual API endpoint
      // const response = await axiosInstance.get('/api/notifications');
      
      // For now, we'll use mock data
      const mockNotifications = [
        {
          id: '1',
          title: 'Invoice Paid',
          message: 'Client ABC has paid invoice #INV-2023-001',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          link: '/invoices/1'
        },
        {
          id: '2',
          title: 'New Comment',
          message: 'John added a comment to Project XYZ',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          link: '/projects/1'
        },
        {
          id: '3',
          title: 'Invoice Overdue',
          message: 'Invoice #INV-2023-002 is now overdue',
          type: 'warning',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          link: '/invoices/2'
        },
        {
          id: '4',
          title: 'Project Deadline',
          message: 'Project ABC is due tomorrow',
          type: 'warning',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          link: '/projects/2'
        },
        {
          id: '5',
          title: 'New Client',
          message: 'XYZ Corporation has been added as a new client',
          type: 'info',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
          link: '/client-profiles'
        },
        {
          id: '6',
          title: 'Payment Failed',
          message: 'Recurring payment for subscription has failed',
          type: 'error',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          link: '/settings'
        }
      ];

      setNotifications(mockNotifications);
      updateUnreadCount(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  // Update the unread count
  const updateUnreadCount = (notifs) => {
    const count = notifs.filter(notification => !notification.read).length;
    setUnreadCount(count);
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      // In a real app, this would be an API call
      // await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      // await axiosInstance.put('/api/notifications/read-all');
      
      // Update local state
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add a new notification (for testing purposes)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      // In a real app, this would be an API call
      // await axiosInstance.delete(`/api/notifications/${notificationId}`);
      
      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // In a real app, this would be an API call
      // await axiosInstance.delete('/api/notifications');
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Add multiple test notifications (for development/testing)
  const addTestNotifications = () => {
    const types = ['success', 'info', 'warning', 'error'];
    const titles = ['Invoice Created', 'Project Updated', 'Meeting Scheduled', 'Task Completed'];
    const messages = [
      'A new invoice has been created for client XYZ',
      'Project ABC has been updated with new tasks',
      'Meeting scheduled with client XYZ on Monday',
      'Task "Design Homepage" has been marked as complete'
    ];
    
    for (let i = 0; i < 4; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      addNotification({
        title,
        message,
        type,
        link: '#',
      });
    }
  };

  // Value to be provided to consumers
  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    clearAllNotifications,
    addTestNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
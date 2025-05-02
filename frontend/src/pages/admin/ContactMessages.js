import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Mock data for contact messages
const mockContactMessages = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Pricing Question',
    message: 'I have a question about your pricing plans. Can you provide more details about the enterprise plan?',
    date: '2023-07-15T10:30:00',
    status: 'unread'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Technical Support',
    message: 'I\'m having trouble connecting my bank account. Can someone from your support team help me with this issue?',
    date: '2023-07-14T14:45:00',
    status: 'read'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    subject: 'Feature Request',
    message: 'I would love to see a budget forecasting feature in the next update. This would be incredibly helpful for my business planning.',
    date: '2023-07-13T09:15:00',
    status: 'replied'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    subject: 'Account Issue',
    message: 'I\'m unable to reset my password. I\'ve tried following the instructions in the email but it\'s not working.',
    date: '2023-07-12T16:20:00',
    status: 'unread'
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael@example.com',
    subject: 'Integration Question',
    message: 'Does your platform integrate with QuickBooks? I need to sync my accounting data between the two systems.',
    date: '2023-07-11T11:50:00',
    status: 'read'
  }
];

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // In a real application, fetch messages from API
    setMessages(mockContactMessages);
  }, []);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setOpenDialog(true);
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, status: 'read' } : msg
      );
      setMessages(updatedMessages);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReply('');
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    
    // Update message status to replied
    const updatedMessages = messages.map(msg => 
      msg.id === selectedMessage.id ? { ...msg, status: 'replied' } : msg
    );
    setMessages(updatedMessages);
    
    // In a real app, send the reply via API
    console.log(`Replying to ${selectedMessage.email}: ${reply}`);
    
    // Close the dialog
    handleCloseDialog();
  };

  const handleDeleteMessage = (id) => {
    // Filter out the deleted message
    const updatedMessages = messages.filter(msg => msg.id !== id);
    setMessages(updatedMessages);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'unread':
        return <Chip size="small" label="Unread" color="error" />;
      case 'read':
        return <Chip size="small" label="Read" color="primary" />;
      case 'replied':
        return <Chip size="small" label="Replied" color="success" icon={<CheckCircleIcon />} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and respond to customer inquiries
        </Typography>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id} hover>
                  <TableCell>{getStatusChip(message.status)}</TableCell>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{formatDate(message.date)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewMessage(message)} size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMessage(message.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No messages found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Message Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedMessage.subject}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                From: {selectedMessage.name} ({selectedMessage.email})
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedMessage.message}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reply
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Your response"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply} 
                variant="contained" 
                color="primary"
                startIcon={<EmailIcon />}
                disabled={!reply.trim()}
              >
                Send Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ContactMessages; 
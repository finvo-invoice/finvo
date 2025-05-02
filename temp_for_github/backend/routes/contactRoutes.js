const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../config/supabase');

/**
 * @route POST /api/contact
 * @desc Submit a contact message
 * @access Private (requires authentication)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert contact message into database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        id: uuidv4(),
        user_id: userId,
        name,
        email,
        subject,
        message,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting contact message:', error);
      return res.status(500).json({ message: 'Failed to submit contact message', error: error.message });
    }

    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        id: uuidv4(),
        user_id: userId,
        title: 'Contact Message Received',
        message: `We've received your message about "${subject}". Our team will get back to you soon.`,
        type: 'info',
        link: '/contact',
        read: false,
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification creation fails
    }

    return res.status(201).json({ 
      message: 'Your message has been submitted successfully. We will get back to you soon.',
      success: true
    });
  } catch (error) {
    console.error('Server error in contact submission:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/contact
 * @desc Get all contact messages for the authenticated user
 * @access Private (requires authentication)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin (you would need to implement this logic)
    const isAdmin = req.user.role === 'admin';
    
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    // If not admin, only show user's own messages
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching contact messages:', error);
      return res.status(500).json({ message: 'Failed to fetch contact messages', error: error.message });
    }
    
    return res.status(200).json({ 
      messages: data,
      success: true
    });
  } catch (error) {
    console.error('Server error in fetching contact messages:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route PUT /api/contact/:id
 * @desc Update a contact message status (admin only)
 * @access Private (requires admin authentication)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if user is admin (you would need to implement this logic)
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Update message status
    const { data, error } = await supabase
      .from('contact_messages')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating contact message:', error);
      return res.status(500).json({ message: 'Failed to update contact message', error: error.message });
    }
    
    // Get the message to notify the user
    const { data: messageData, error: messageError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!messageError && messageData) {
      // Create a notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          id: uuidv4(),
          user_id: messageData.user_id,
          title: 'Contact Message Update',
          message: `Your message "${messageData.subject}" has been updated to status: ${status}`,
          type: 'info',
          link: '/contact',
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue even if notification creation fails
      }
    }
    
    return res.status(200).json({ 
      message: 'Contact message updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Server error in updating contact message:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 
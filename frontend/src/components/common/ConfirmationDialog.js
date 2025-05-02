import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * A reusable confirmation dialog component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {Function} props.onCancel - Function to call when the dialog is canceled (alias for onClose)
 * @param {Function} props.onConfirm - Function to call when the action is confirmed
 * @param {string} props.title - The dialog title
 * @param {string} props.message - The confirmation message
 * @param {string} props.content - The confirmation message (alias for message)
 * @param {string} props.confirmButtonText - Text for the confirm button
 * @param {string} props.cancelButtonText - Text for the cancel button
 * @param {string} props.confirmButtonColor - Color for the confirm button
 */
const ConfirmationDialog = ({
  open,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message,
  content,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'error'
}) => {
  // Handle both content and message props for backward compatibility
  const dialogMessage = message || content || 'Are you sure you want to proceed?';
  // Use onCancel as a fallback for onClose for backward compatibility
  const handleClose = onClose || onCancel;

  const theme = useTheme();

  const handleConfirm = () => {
    onConfirm();
    // Call onClose if it exists, otherwise try onCancel
    if (handleClose) {
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '450px',
          padding: '8px'
        }
      }}
    >
      <DialogTitle 
        id="alert-dialog-title"
        sx={{ 
          fontSize: '1.3rem', 
          fontWeight: 600,
          color: '#1F2937',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineIcon color={confirmButtonColor} />
          {title}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText 
          id="alert-dialog-description"
          sx={{
            color: '#4B5563',
            fontSize: '0.95rem',
            mb: 1
          }}
        >
          {dialogMessage}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          variant="outlined"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          {cancelButtonText}
        </Button>
        <Button 
          onClick={handleConfirm} 
          color={confirmButtonColor} 
          variant="contained" 
          autoFocus
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            boxShadow: `0 4px 10px ${theme.palette[confirmButtonColor].main}25`,
            px: 3
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 
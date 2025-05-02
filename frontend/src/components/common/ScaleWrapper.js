import React from 'react';
import { Box } from '@mui/material';

/**
 * ScaleWrapper - A component that scales down the content by 10%
 * The navbar is outside this wrapper to remain at full width
 */
const ScaleWrapper = ({ children }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          px: 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ScaleWrapper; 
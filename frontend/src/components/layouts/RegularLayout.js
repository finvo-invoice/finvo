import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import ScaleWrapper from '../common/ScaleWrapper';

const RegularLayout = () => {
  return (
    <Box sx={{ 
      marginTop: 0,
      minHeight: 'calc(100vh - 70px)'
    }}>
      <ScaleWrapper>
        <Outlet />
      </ScaleWrapper>
    </Box>
  );
};

export default RegularLayout; 
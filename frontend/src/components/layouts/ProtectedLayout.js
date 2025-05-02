import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import ScaleWrapper from '../common/ScaleWrapper';
import RequireAuth from '../auth/RequireAuth';
import Layout from '../common/Layout';

const ProtectedLayout = () => {
  return (
    <Box sx={{ marginTop: '64px', width: '100%' }}>
      <ScaleWrapper>
        <RequireAuth>
          <Layout hideNavbar={true}>
            <Outlet />
          </Layout>
        </RequireAuth>
      </ScaleWrapper>
    </Box>
  );
};

export default ProtectedLayout; 
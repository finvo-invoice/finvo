import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import NavBar from '../components/common/NavBar';
import AdminSidebar from '../components/common/AdminSidebar';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Box sx={{ display: 'flex', flex: 1, pt: 8 }}>
        <AdminSidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout; 
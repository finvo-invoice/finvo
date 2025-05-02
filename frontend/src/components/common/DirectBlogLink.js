import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';

const DirectBlogLink = () => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    console.log('Direct blog link clicked');
    navigate('/blog', { replace: false });
  };
  
  return (
    <Button
      component={Link}
      to="/blog"
      variant="contained"
      color="primary"
      startIcon={<BookIcon />}
      onClick={handleClick}
    >
      Go to Blog
    </Button>
  );
};

export default DirectBlogLink; 
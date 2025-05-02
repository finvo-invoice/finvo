import React from 'react';
import { Link } from 'react-router-dom';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import '../../pages/CreateInvoice.css';

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  backgroundColor: '#002619',
  color: 'white',
  padding: '10px 24px',
  borderRadius: '6px',
  fontWeight: '500',
  textDecoration: 'none',
  border: 'none',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const iconStyle = {
  color: '#4CAF50',
  fontSize: '20px',
};

const textStyle = {
  color: 'white',
};

const hoverStyle = {
  backgroundColor: '#0d3629',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const CreateInvoiceButton = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link 
      to="/create-invoice"
      style={{
        ...buttonStyle,
        ...(isHovered ? hoverStyle : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ReceiptOutlinedIcon style={iconStyle} />
      <span style={textStyle}>Create Invoice</span>
    </Link>
  );
};

export default CreateInvoiceButton; 
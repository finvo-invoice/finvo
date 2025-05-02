import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';
import logoImage from '../../assets/images/finvo-logo.svg'; // Import the SVG logo

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicks outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    // Using the anchor directly to let SmoothScroll component handle it
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">
          <img src={logoImage} alt="Finvo Logo" style={{ height: '32px' }} />
        </div>
      </Link>

      {/* Navigation Menu */}
      <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        <ul className="navbar-nav">
          {/* Public links - always visible */}
          
          {/* Home page sections - only visible on home page */}
          {isHomePage && !user && (
            <>
              <li>
                <a 
                  href="#benefits" 
                  className="nav-link"
                  onClick={(e) => scrollToSection('benefits', e)}
                >
                  Benefits
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  className="nav-link"
                  onClick={(e) => scrollToSection('features', e)}
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#testimonials" 
                  className="nav-link"
                  onClick={(e) => scrollToSection('testimonials', e)}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a 
                  href="#get-started" 
                  className="nav-link"
                  onClick={(e) => scrollToSection('get-started', e)}
                >
                  Get Started
                </a>
              </li>
            </>
          )}
          
          {/* If user is logged in, show user links */}
          {user && (
            <>
              <li>
                <Link to="/company-profiles" className={location.pathname === '/company-profiles' ? 'nav-link active' : 'nav-link'}>
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/client-profiles" className={location.pathname === '/client-profiles' || location.pathname === '/clients' ? 'nav-link active' : 'nav-link'}>
                  Clients
                </Link>
              </li>
              <li>
                <Link to="/project-profiles" className={location.pathname === '/project-profiles' || location.pathname === '/projects' ? 'nav-link active' : 'nav-link'}>
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/all-invoices" className={location.pathname === '/all-invoices' || location.pathname === '/invoices' ? 'nav-link active' : 'nav-link'}>
                  Invoices
                </Link>
              </li>
              <li>
                <Link to="/create-invoice" className={location.pathname === '/create-invoice' ? 'nav-link active' : 'nav-link'}>
                  Create Invoice
                </Link>
              </li>
            </>
          )}
          
          {!user && (
            <>
              <li>
                <Link to="/about" className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}>
                  Contact
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isMenuOpen ? (
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </button>

      {/* Auth Buttons */}
      {user ? (
        <div className="user-profile" ref={profileRef}>
          <button className="profile-btn" onClick={toggleProfile}>
            <div className="avatar">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
          {isProfileOpen && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="dropdown-item logout">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StaticBanner from '../components/StaticBanner';
import Footer from '../components/common/Footer';
import { 
  Receipt as InvoiceIcon, 
  Person as ClientIcon, 
  Assignment as ProjectsIcon,
  ArrowForwardIos as NextIcon,
  ArrowBackIos as PrevIcon
} from '@mui/icons-material';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Testimonials data
  const testimonials = [
    {
      text: "Finvo has transformed how I manage my freelance business. Invoicing is now seamless, and I get paid faster than ever before.",
      author: "Sarah Johnson, Graphic Designer"
    },
    {
      text: "Managing clients and projects used to be a headache. With Finvo, I've cut my admin time in half and improved my client relationships.",
      author: "Michael Chen, Web Developer"
    },
    {
      text: "The financial insights have been invaluable for growing my business. I can now make data-driven decisions that improve my bottom line.",
      author: "Priya Sharma, Marketing Consultant"
    },
    {
      text: "As a small business owner, I needed something simple yet powerful. Finvo delivers exactly that - it's intuitive but has all the features I need.",
      author: "Thomas Wilson, Photography Studio"
    }
  ];
  
  // Handle testimonial navigation
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  
  // Auto-advance testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Ensure proper scrolling behavior
  useEffect(() => {
    // Allow scrolling on the body
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
    
    // Clean up function
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  
  // Handle scroll visibility for the scroll-to-top button and navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show scroll-to-top button after scrolling halfway
      setShowScrollTop(scrollPosition > window.innerHeight / 2);
      
      // Update navbar appearance based on scroll position
      const navbar = document.querySelector('.MuiAppBar-root') || document.querySelector('.full-width-navbar');
      if (navbar) {
        if (scrollPosition > 50) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="home">
      {/* Hero Section - Fullscreen Banner */}
      <div className="hero-fullscreen">
        <StaticBanner />
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Streamline Your Business Finances</h1>
          <p>Professional invoicing, client management, and financial tracking for freelancers and small businesses</p>
          <div className="cta-buttons">
            {user ? (
              <Link to="/create-invoice" className="cta-button primary">
                Create Invoice
              </Link>
            ) : (
              <Link to="/register" className="cta-button primary">
                Get Started Free
              </Link>
            )}
            {!user && (
              <Link to="/login" className="cta-button secondary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Content that scrolls over the banner */}
      <div className="content-wrapper">
        {/* Key Benefits Section */}
        <div className="benefits-section" id="benefits">
          <div className="container">
            <h2>Simplify Your Business Operations</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <InvoiceIcon />
                </div>
                <h3>Professional Invoicing</h3>
                <p>Create branded invoices in seconds and get paid faster with automated payment reminders</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <ClientIcon />
                </div>
                <h3>Client Management</h3>
                <p>Organize client information, track communication, and build stronger business relationships</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <ProjectsIcon />
                </div>
                <h3>Project Tracking</h3>
                <p>Monitor project progress, timelines, and profitability from a centralized dashboard</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonial Section */}
        <div className="testimonial-section" id="testimonials">
          <div className="container">
            <h2>Trusted by Businesses Worldwide</h2>
            <div className="testimonial-carousel">
              <button className="carousel-arrow prev" onClick={prevTestimonial}>
                <PrevIcon />
              </button>
              
              <div className="testimonial-card">
                <p>"{testimonials[activeTestimonial].text}"</p>
                <div className="testimonial-author">{testimonials[activeTestimonial].author}</div>
              </div>
              
              <button className="carousel-arrow next" onClick={nextTestimonial}>
                <NextIcon />
              </button>
            </div>
            
            <div className="carousel-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Final CTA Section */}
        <div className="final-cta" id="get-started">
          <div className="container">
            <h2>Ready to streamline your business?</h2>
            <p>Join thousands of businesses using Finvo to save time and get paid faster</p>
            {user ? (
              <Link to="/create-invoice" className="cta-button primary">
                Create Invoice
              </Link>
            ) : (
              <Link to="/register" className="cta-button primary">
                Start Your Free Account
              </Link>
            )}
          </div>
        </div>
        
        {/* Add Footer Component */}
        <Footer />
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Home; 
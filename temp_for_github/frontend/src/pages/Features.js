import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <div className="features-page">
      <div className="features-header">
        <div className="container">
          <h1>Features</h1>
          <p>Discover what makes Finvo the perfect solution for your business</p>
        </div>
      </div>
      
      <div className="features-content">
        <div className="container">
          <div className="features-list">
            <div className="feature-item">
              <h2>Smart Invoicing</h2>
              <p>Create professional invoices in minutes with our intuitive interface. Automatically calculate taxes, add your branding, and send them directly to clients.</p>
            </div>
            
            <div className="feature-item">
              <h2>Project Management</h2>
              <p>Track projects from start to finish. Set milestones, monitor progress, and ensure deadlines are met with our comprehensive project management tools.</p>
            </div>
            
            <div className="feature-item">
              <h2>Client Portal</h2>
              <p>Give your clients a dedicated portal to view invoices, track project progress, and maintain clear communication throughout the engagement.</p>
            </div>
            
            <div className="feature-item">
              <h2>Financial Analytics</h2>
              <p>Get insights into your business performance with detailed financial reports, revenue tracking, and expense management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 
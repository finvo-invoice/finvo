const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');
const itemService = require('../services/itemService');
const companyService = require('../services/companyService');
const projectService = require('../services/projectService');
const clientService = require('../services/clientService');
const invoiceNumberService = require('../services/invoiceNumberService');
const invoiceService = require('../services/invoiceService');
const dashboardService = require('../services/dashboardService');
const { supabase } = require('../config/supabase');
const contactRoutes = require('./contactRoutes');
const blogRoutes = require('./blogRoutes');
const { generateSitemap } = require('../utils/sitemapGenerator');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected routes - require authentication
router.use(authMiddleware);

// Use contact routes
router.use('/contact', contactRoutes);

// Blog routes
router.use('/blog', blogRoutes);

// Get all items
router.get('/items', async (req, res) => {
  try {
    const items = await itemService.getAllItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get('/items/:id', async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new item
router.post('/items', upload.single('logo'), async (req, res) => {
  try {
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      logo: req.file
    };
    const newItem = await itemService.createItem(itemData);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.put('/items/:id', upload.single('logo'), async (req, res) => {
  try {
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      logo: req.file
    };
    const updatedItem = await itemService.updateItem(req.params.id, itemData);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    await itemService.deleteItem(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies(req.user.id, req.supabase);
    res.json(companies);
  } catch (error) {
    console.error('Error in GET /companies:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get company by ID
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await companyService.getCompanyById(req.params.id, req.user.id, req.supabase);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error in GET /companies/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new company
router.post('/companies', upload.single('logo'), async (req, res) => {
  try {
    console.log('Received company creation request');
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const companyData = {
      ...req.body,
      logo: req.file,
      pan: req.body.pan || '' // Ensure pan is always included, even if empty
    };

    const newCompany = await companyService.createCompany(companyData, req.user.id, req.supabase);
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error in POST /companies route:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create company',
      error: error
    });
  }
});

// Update company
router.put('/companies/:id', upload.single('logo'), async (req, res) => {
  try {
    console.log('Received company update request');
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const companyData = {
      ...req.body,
      logo: req.file
    };

    const updatedCompany = await companyService.updateCompany(req.params.id, companyData, req.user.id, req.supabase);
    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(updatedCompany);
  } catch (error) {
    console.error('Error in PUT /companies/:id route:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to update company',
      error: error
    });
  }
});

// Delete company
router.delete('/companies/:id', async (req, res) => {
  try {
    await companyService.deleteCompany(req.params.id, req.user.id, req.supabase);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /companies/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all projects
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await projectService.getAllProjects(req.user.id, req.supabase);
    res.json(projects);
  } catch (error) {
    console.error('Error in GET /projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id, req.supabase);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    console.log('Creating new project with data:', req.body);
    const projectData = {
      ...req.body,
      user_id: req.user.id
    };
    const result = await projectService.createProject(projectData, req.user.id, req.supabase);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating project with ID:', id);
    console.log('Update data:', req.body);
    const result = await projectService.updateProject(id, req.body, req.user.id, req.supabase);
    console.log('Project updated successfully:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Deleting project with ID:', req.params.id);
    
    const result = await projectService.deleteProject(
      req.params.id,
      req.user.id,
      req.supabase
    );
    
    console.log('Project deletion result:', result);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /projects/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await clientService.getAllClients(req.user.id, req.supabase);
    res.json(clients);
  } catch (error) {
    console.error('Error in GET /clients:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get client by ID
router.get('/clients/:id', async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id, req.user.id, req.supabase);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error in GET /clients/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new client
router.post('/clients', async (req, res) => {
  try {
    console.log('Creating client with data:', req.body);
    const newClient = await clientService.createClient(req.body, req.user.id, req.supabase);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error in POST /clients:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update client
router.put('/clients/:id', async (req, res) => {
  try {
    console.log('Updating client with data:', req.body);
    const updatedClient = await clientService.updateClient(req.params.id, req.body, req.user.id, req.supabase);
    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(updatedClient);
  } catch (error) {
    console.error('Error in PUT /clients/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete client
router.delete('/clients/:id', async (req, res) => {
  try {
    await clientService.deleteClient(req.params.id, req.user.id, req.supabase);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /clients/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get next invoice number
router.get('/invoice-number', authMiddleware, async (req, res) => {
  try {
    const nextInvoiceNumber = await invoiceNumberService.getNextInvoiceNumber(req.user.id);
    res.json({ nextInvoiceNumber });
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    // Return a safe default with current year
    res.json({ nextInvoiceNumber: `${new Date().getFullYear()}001` });
  }
});

// Create invoice
router.post('/invoices', authMiddleware, async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.company) {
      return res.status(400).json({ message: 'Company is required' });
    }
    if (!req.body.client) {
      return res.status(400).json({ message: 'Client is required' });
    }
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Get next invoice number
    const nextInvoiceNumber = await invoiceNumberService.getNextInvoiceNumber(req.user.id);
    
    // Add invoice number to request body
    const invoiceData = {
      ...req.body,
      invoice_number: nextInvoiceNumber,
      bill_number: nextInvoiceNumber // Use same number for bill_number
    };
    
    // Create the invoice
    const invoice = await invoiceService.createInvoice(invoiceData, req.user.id, req.supabase);
    
    // Increment the invoice number counter for the user
    await invoiceNumberService.incrementInvoiceNumber(req.user.id);
      
    // Get the new next invoice number for the response
    const newNextInvoiceNumber = await invoiceNumberService.getNextInvoiceNumber(req.user.id);
    
    // Return the created invoice and the next invoice number
    res.status(201).json({ ...invoice, next_invoice_number: newNextInvoiceNumber });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create invoice',
      error: error
    });
  }
});

// Get all invoices
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const invoices = await invoiceService.getAllInvoices(req.user.id, req.supabase);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get invoice by ID
router.get('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id, req.supabase);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update invoice
router.put('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Received invoice update request');
    console.log('Request body:', req.body);
    
    const invoiceData = req.body;
    
    // Validate required fields
    if (!invoiceData.company) {
      return res.status(400).json({ message: 'Company is required' });
    }
    
    if (!invoiceData.client) {
      return res.status(400).json({ message: 'Client is required' });
    }
    
    if (!invoiceData.items || invoiceData.items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }
    
    // Update the invoice
    const updatedInvoice = await invoiceService.updateInvoice(req.params.id, invoiceData, req.user.id, req.supabase);
    console.log('Invoice updated successfully:', updatedInvoice);
    
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    
    // Send a more detailed error response
    res.status(500).json({ 
      message: error.message || 'Failed to update invoice',
      error: error
    });
  }
});

// Generate and download invoice PDF
router.get('/invoices/:id/download', authMiddleware, async (req, res) => {
  try {
    // Fetch invoice data
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id, req.supabase);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    // Generate PDF - pass the Supabase client
    const pdfBuffer = await invoiceService.generateInvoicePDF(invoice, req.supabase);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/invoices/:id', authMiddleware, async (req, res) => {
  try {
    await invoiceService.deleteInvoice(req.params.id, req.user.id, req.supabase);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dashboard routes
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    // Validate request
    if (!req.user || !req.user.id) {
      console.error('Dashboard stats request missing user ID');
      // Return empty stats instead of error
      return res.json({ 
        success: true, 
        data: {
          counts: { projects: 0, companies: 0, clients: 0, invoices: 0 },
          revenue: { total: 0, monthly: 0 },
          financials: { totalRevenue: 0, averageInvoiceValue: 0 },
          recent: { invoices: [], projects: [] }
        },
        message: 'No user ID found, returning default stats'
      });
    }

    if (!req.supabase) {
      console.error('Dashboard stats request missing Supabase client');
      // Return empty stats instead of error
      return res.json({ 
        success: true, 
        data: {
          counts: { projects: 0, companies: 0, clients: 0, invoices: 0 },
          revenue: { total: 0, monthly: 0 },
          financials: { totalRevenue: 0, averageInvoiceValue: 0 },
          recent: { invoices: [], projects: [] }
        },
        message: 'No database client found, returning default stats'
      });
    }

    console.log('Fetching dashboard stats for user:', req.user.id);
    
    // Get dashboard stats
    const stats = await dashboardService.getDashboardStats(req.user.id, req.supabase);
    
    // Send response
    res.json({ success: true, data: stats });
    
  } catch (error) {
    console.error('Error in dashboard stats route:', error);
    
    // Return empty stats instead of error
    res.json({ 
      success: true, 
      data: {
        counts: { projects: 0, companies: 0, clients: 0, invoices: 0 },
        revenue: { total: 0, monthly: 0 },
        financials: { totalRevenue: 0, averageInvoiceValue: 0 },
        recent: { invoices: [], projects: [] }
      },
      message: 'Error occurred, returning default stats'
    });
  }
});

// Sitemap generation route
router.get('/sitemap.xml', async (req, res) => {
  try {
    const supabase = req.supabase;
    const path = require('path');
    
    // Get all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, category, created_at, updated_at')
      .eq('status', 'published');
    
    if (blogError) throw blogError;
    
    // Define static pages
    const staticPages = [
      { path: '/', changefreq: 'monthly', priority: '1.0' },
      { path: '/about', changefreq: 'monthly', priority: '0.8' },
      { path: '/contact', changefreq: 'monthly', priority: '0.8' },
      { path: '/blog', changefreq: 'weekly', priority: '0.9' },
      { path: '/login', changefreq: 'yearly', priority: '0.5' },
      { path: '/subscribe', changefreq: 'yearly', priority: '0.5' },
    ];
    
    // Generate sitemap
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const baseUrl = process.env.FRONTEND_URL || 'https://finvo.com';
    
    await generateSitemap({
      baseUrl,
      blogPosts,
      staticPages,
      outputPath: sitemapPath
    });
    
    // Send the sitemap
    res.sendFile(sitemapPath);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

module.exports = router; 
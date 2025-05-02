const PDFDocument = require('pdfkit');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Generate a PDF for an invoice
 * @param {Object} invoice - The invoice data
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Buffer>} - The PDF as a buffer
 */
const generateInvoicePDF = async (invoice, supabase) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Generating invoice PDF with data:', JSON.stringify(invoice, null, 2));
      
      // Fetch company details if they're not in the invoice object
      let companyData = {};
      if (invoice.company_id && supabase && (!invoice.company_address || !invoice.company_email || !invoice.company_phone || !invoice.company_gst || !invoice.company_pan)) {
        try {
          console.log('Fetching complete company details for invoice PDF...');
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', invoice.company_id)
            .single();
            
          if (error) {
            console.error('Error fetching company details:', error);
          } else if (data) {
            console.log('Successfully fetched company details:', data);
            companyData = data;
            // Add the data to the invoice object
            invoice.company_name = companyData.name || invoice.company_name;
            invoice.company_address = companyData.address || invoice.company_address;
            invoice.company_email = companyData.email || invoice.company_email;
            invoice.company_phone = companyData.phone || invoice.company_phone;
            invoice.company_gst = companyData.gst || companyData.gst_number || invoice.company_gst;
            invoice.company_pan = companyData.pan || companyData.pan_number || invoice.company_pan;
            invoice.company_logo = companyData.logo_url || invoice.company_logo;
          }
        } catch (err) {
          console.error('Exception fetching company details for PDF:', err);
        }
      }
      
      // Create a new PDF document with clean margins
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        font: 'Helvetica',
        autoFirstPage: true,
        bufferPages: true  // Add buffer pages to be able to count pages
      });
      
      // Register standard fonts - using built-in fonts only
      doc.registerFont('NormalFont', 'Helvetica');
      doc.registerFont('BoldFont', 'Helvetica-Bold');
      
      // Indian Rupee Symbol - using Rs. as the safer option that works with all fonts
      const rupeeSymbol = 'Rs.';
      
      // Buffer to store PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Page dimensions
      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);
      
      // Define positioning
      let yPos = 30; // Reduced from 50 to minimize top space
      
      // Get company name early so we can use it for the logo placeholder if needed
      const companyName = invoice.company_name || 'Company Name';
      
      // Logo display - only if company has uploaded one
      let logoDisplayed = false;
      
      if (invoice.company_logo) {
        try {
          console.log('Attempting to load custom company logo from URL:', invoice.company_logo);
          
          // Download the image from the URL
          const response = await axios.get(invoice.company_logo, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'binary');
          
          // Create temporary file path
          const tempDir = os.tmpdir();
          const tempImagePath = path.join(tempDir, `logo-${Date.now()}.png`);
          
          // Save image to temporary file
          fs.writeFileSync(tempImagePath, imageBuffer);
          console.log('Logo downloaded and saved to:', tempImagePath);
          
          // Position parameters
          const maxWidth = 220;
          const maxHeight = 140;
          const logoX = (pageWidth - maxWidth) / 2; // Center horizontally
          const logoY = yPos;
          
          // Image with auto-scaling to maintain aspect ratio
          doc.image(tempImagePath, logoX, logoY, {
            fit: [maxWidth, maxHeight],
            align: 'center',
            valign: 'center'
          });
          
          // Clean up temp file
          try {
            fs.unlinkSync(tempImagePath);
          } catch (cleanupError) {
            console.error('Error cleaning up temporary logo file:', cleanupError);
          }
          
          yPos += 100; // Add space after logo
          logoDisplayed = true;
          console.log('Custom company logo loaded successfully');
        } catch (logoError) {
          console.error('Error loading company logo:', logoError);
        }
      }
      
      // Company Name (same font size as details, bold, centered)
      doc.font('BoldFont')
         .fillColor('#000000')
         .fontSize(10)  // Reduced from 22 to match company details
         .text(companyName, margin, yPos, { 
           align: 'center',
           width: contentWidth
         });
      
      yPos += 15;  // Reduced spacing after name since font is smaller
      
      // Add PAN number right under company name if available
      if (companyData.pan) {
        doc.font('BoldFont')
           .fillColor('#000000')
           .fontSize(9)
           .text(`PAN: ${companyData.pan}`, margin, yPos, {
             align: 'center',
             width: contentWidth
           });
        yPos += 15;
      }
      
      // Company Details - Comprehensive approach with better formatting
      const companyInfo = {
        address: invoice.company_address || invoice.address || (invoice.company_details?.address) || null,
        gstNumber: invoice.company_gst || invoice.gst_number || (invoice.company_details?.gst_number) || null,
        panNumber: invoice.company_pan || invoice.pan_number || (invoice.company_details?.pan_number) || null,
        email: invoice.company_email || invoice.email || (invoice.company_details?.email) || null,
        phoneNumber: invoice.company_phone || invoice.phone_number || (invoice.company_details?.phone_number) || null
      };
      
      // Collect and format all available company info
      let companyDetailsText = '';
      
      // Address on its own line with priority
      if (companyInfo.address) companyDetailsText += `${companyInfo.address}\n`;
      
      // GST and PAN with clear labels
      let taxInfoLine = '';
      if (companyInfo.gstNumber) taxInfoLine += `GST: ${companyInfo.gstNumber}`;
      if (companyInfo.panNumber) {
        taxInfoLine += taxInfoLine ? ' | ' : '';
        taxInfoLine += `PAN: ${companyInfo.panNumber}`;
      }
      if (taxInfoLine) companyDetailsText += `${taxInfoLine}\n`;
      
      // Contact info with clear labels
      let contactInfoLine = '';
      if (companyInfo.email) contactInfoLine += `Email: ${companyInfo.email}`;
      if (companyInfo.phoneNumber) {
        contactInfoLine += contactInfoLine ? ' | ' : '';
        contactInfoLine += `Phone: ${companyInfo.phoneNumber}`;
      }
      if (contactInfoLine) companyDetailsText += contactInfoLine;
      
      if (companyDetailsText) {
        doc.fontSize(10) // Consistent with company name
           .font('BoldFont') // Changed from NormalFont to BoldFont
           .text(companyDetailsText, margin, yPos, {
        align: 'center',
        width: contentWidth,
        lineGap: 2
      });
      
        const detailsHeight = doc.heightOfString(companyDetailsText, {
        width: contentWidth,
        lineGap: 2
      });
      
        yPos += detailsHeight + 20; // Increased spacing after company details
      } else {
        yPos += 15;
      }
      
      // Add a separator line before the invoice title
      doc.moveTo(margin, yPos - 10)
         .lineTo(margin + contentWidth, yPos - 10)
         .lineWidth(0.2)
         .opacity(0.5)
         .stroke()
         .opacity(1);
      
      // Invoice title section with clean border (removed border, just background)
      doc.rect(margin, yPos, contentWidth, 30) // Slightly taller
         .fill('#F0F0F0'); // Light gray
         
      doc.fillColor('#000000')
         .font('BoldFont')
         .fontSize(16) // Larger for better visibility
         .text('INVOICE', 0, yPos + 8, { // Center vertically in the bar
           align: 'center',
           width: pageWidth
         });
      
      yPos += 45; // Increased space after title
      
      // Two-column layout with balanced proportions
      const columnGap = 20; // Slightly more gap
      const leftColWidth = (contentWidth - columnGap) * 0.45;
      const rightColWidth = (contentWidth - columnGap) * 0.45;
      const rightColX = margin + contentWidth - rightColWidth;
      
      // Bill To section with heading in darker shade
      doc.font('BoldFont')
         .fontSize(10)
         .fillColor('#333333')
         .text('Bill To', margin, yPos);
      
      // Client details
      const clientInfo = {
        name: invoice.client_name || 'Client Name',
        address: invoice.client_address || invoice.bill_to || '',
        gst: invoice.client_gst || ''
      };
      
      // Client name and details with proper indentation and increased spacing
      doc.font('BoldFont')
         .fillColor('#000000')
         .fontSize(9)
         .text(clientInfo.name, margin, yPos + 18);
      
      doc.font('NormalFont')
         .fontSize(8);
      
      if (clientInfo.address) {
        doc.text(clientInfo.address, margin, yPos + 32, {
          width: leftColWidth - 20,
          lineGap: 1
        });
      }
      
      // Add client GST if available
      let addressEndY = yPos + 32;
      if (clientInfo.address) {
        const addrHeight = doc.heightOfString(clientInfo.address, { 
          width: leftColWidth - 20, 
          lineGap: 1
        });
        addressEndY += addrHeight + 5;
      }
      
      if (clientInfo.gst) {
        doc.text(`GST: ${clientInfo.gst}`, margin, addressEndY, {
          width: leftColWidth - 20
        });
      }
      
      // Invoice Details section title
      doc.font('BoldFont')
         .fontSize(10)
         .fillColor('#333333')
         .text('Invoice Details', rightColX, yPos, {
           align: 'right',
           width: rightColWidth
         });
      
      // Get invoice details
      const billNumber = invoice.invoice_number || invoice.bill_number || 'N/A';
      const invoiceDate = invoice.date || 
                         new Date().toLocaleDateString('en-IN', {
                           day: '2-digit',
                           month: '2-digit',
                           year: 'numeric'
                         });
      
      // Simple clean approach with fixed positions
      const detailStartY = yPos + 18;
      const rowHeight = 16;
      
      // Bill No row - directly combine label and value with no space between
      doc.font('BoldFont')
         .fontSize(9)
         .fillColor('#000000');
      
      // Use right alignment for the entire combined text
      doc.text(`Bill No:${billNumber}`, rightColX, detailStartY, {
         align: 'right',
         width: rightColWidth
      });
      
      // Date row - directly combine label and value with no space between
      doc.text(`Date:${invoiceDate}`, rightColX, detailStartY + rowHeight, {
         align: 'right',
         width: rightColWidth
      });
      
      // Move position below both columns
      yPos += 95; // Fixed space for the header section
      
      // INVOICE TABLE with improved layout
      const tableTop = yPos;
      
      // Define column widths proportionally
      const descColWidth = contentWidth * 0.55; // More space for description
      const qtyColWidth = contentWidth * 0.10;
      const priceColWidth = contentWidth * 0.15;
      const amountColWidth = contentWidth * 0.20;
      
      // Column positions
      const descriptionX = margin;
      const quantityX = margin + descColWidth;
      const unitPriceX = quantityX + qtyColWidth;
      const amountX = unitPriceX + priceColWidth;
      
      // Add a subtle full-width separator line before the table
      doc.moveTo(margin, tableTop - 10)
         .lineTo(margin + contentWidth, tableTop - 10)
         .lineWidth(0.2)
         .opacity(0.5)
         .stroke()
         .opacity(1);
      
      // Draw table header with filled background - kept light background without border
      doc.rect(margin, tableTop, contentWidth, 22)
         .fill('#F0F0F0');
      
      // Table headers with consistent alignment
      doc.fillColor('#000000')
         .font('BoldFont')
         .fontSize(9);
      
      doc.text('Description', descriptionX + 5, tableTop + 7, { width: descColWidth - 10, align: 'left' });
      doc.text('Quantity', quantityX + 5, tableTop + 7, { width: qtyColWidth - 10, align: 'center' });
      doc.text('Unit Price', unitPriceX + 5, tableTop + 7, { width: priceColWidth - 10, align: 'right' });
      doc.text('Amount', amountX + 5, tableTop + 7, { width: amountColWidth - 10, align: 'right' });
      
      // Table rows
      let tableRowY = tableTop + 22;
      const lineHeight = 24;
      
      doc.font('NormalFont')
         .fontSize(9);
      
      // Ensure items is an array
      let itemsArray = [];
      if (invoice.items) {
        if (Array.isArray(invoice.items)) {
          itemsArray = invoice.items;
        } else if (invoice.items.items && Array.isArray(invoice.items.items)) {
          itemsArray = invoice.items.items;
        }
      }
      
      // Draw table rows without borders
      itemsArray.forEach((item, i) => {
        // Alternate row shading - lighter shade for better contrast
        if (i % 2 === 1) {
        doc.rect(margin, tableRowY + (i * lineHeight), contentWidth, lineHeight)
             .fill('#F8F8F8');
        }
        
        const y = tableRowY + (i * lineHeight) + 8;
        
        doc.fillColor('#000000')
           .text(item.description, descriptionX + 5, y, { width: descColWidth - 10, align: 'left' });
        doc.text(item.quantity.toString(), quantityX + 5, y, { width: qtyColWidth - 10, align: 'center' });
        doc.text(`${rupeeSymbol} ${parseFloat(item.rate).toFixed(2)}`, unitPriceX + 5, y, { width: priceColWidth - 10, align: 'right' });
        doc.text(`${rupeeSymbol} ${parseFloat(item.amount).toFixed(2)}`, amountX + 5, y, { width: amountColWidth - 10, align: 'right' });
      });
      
      // Calculate the bottom of the table
      const tableBottom = tableRowY + (itemsArray.length * lineHeight);
      
      // Add a subtle separator after the table
      doc.moveTo(margin, tableBottom + 5)
         .lineTo(margin + contentWidth, tableBottom + 5)
         .lineWidth(0.2)
         .opacity(0.5)
         .stroke()
         .opacity(1);
      
      // TOTALS SECTION - removed border, but better formatting
      const totalsWidth = contentWidth * 0.4;
      const totalsStartX = margin + contentWidth - totalsWidth;
      
      let totalsY = tableBottom + 15;
      
      // Get GST rates and amounts
      let cgstRate = invoice.cgst_rate || 9;
      let sgstRate = invoice.sgst_rate || 9;
      let cgstAmount = invoice.cgst_amount || 0;
      let sgstAmount = invoice.sgst_amount || 0;
      let subtotal = invoice.subtotal || 0;
      
      // Try to extract GST info from different possible fields
      if (invoice.items && typeof invoice.items === 'object' && invoice.items.metadata) {
        cgstRate = invoice.items.metadata.cgstRate || cgstRate;
        sgstRate = invoice.items.metadata.sgstRate || sgstRate;
        
        if (invoice.items.metadata.cgstAmount !== undefined) {
          cgstAmount = invoice.items.metadata.cgstAmount;
        }
        if (invoice.items.metadata.sgstAmount !== undefined) {
          sgstAmount = invoice.items.metadata.sgstAmount;
        }
      }
      
      if (cgstAmount === 0 && invoice.cgst !== undefined) {
        cgstAmount = invoice.cgst;
      }
      
      if (sgstAmount === 0 && invoice.sgst !== undefined) {
        sgstAmount = invoice.sgst;
      }
      
      if (cgstAmount === 0 && invoice.gst !== undefined) {
        cgstAmount = invoice.gst / 2;
      }
      
      if (sgstAmount === 0 && invoice.gst !== undefined) {
        sgstAmount = invoice.gst / 2;
      }
      
      // Use 0 as fallback
      cgstAmount = cgstAmount || 0;
      sgstAmount = sgstAmount || 0;
      
      // Totals with improved layout and consistent right alignment for all monetary values
      const totalLabelWidth = 100;
      const totalValueWidth = totalsWidth - totalLabelWidth;
      
      // Subtotal row
      doc.font('NormalFont')
         .fontSize(9)
         .text('Subtotal:', totalsStartX, totalsY, { width: totalLabelWidth, align: 'right' });
      doc.text(`${rupeeSymbol} ${parseFloat(subtotal).toFixed(2)}`, totalsStartX + totalLabelWidth, totalsY, { width: totalValueWidth, align: 'right' });
      
      // CGST row
      doc.text(`CGST (${cgstRate}%):`, totalsStartX, totalsY + 20, { width: totalLabelWidth, align: 'right' });
      doc.text(`${rupeeSymbol} ${parseFloat(cgstAmount).toFixed(2)}`, totalsStartX + totalLabelWidth, totalsY + 20, { width: totalValueWidth, align: 'right' });
      
      // SGST row
      doc.text(`SGST (${sgstRate}%):`, totalsStartX, totalsY + 40, { width: totalLabelWidth, align: 'right' });
      doc.text(`${rupeeSymbol} ${parseFloat(sgstAmount).toFixed(2)}`, totalsStartX + totalLabelWidth, totalsY + 40, { width: totalValueWidth, align: 'right' });
      
      // Subtle separator before total
      doc.moveTo(totalsStartX, totalsY + 60)
         .lineTo(totalsStartX + totalsWidth, totalsY + 60)
         .lineWidth(0.2)
         .stroke();
      
      // Total amount (bold)
      const total = invoice.total_amount || invoice.total || 0;
      doc.font('BoldFont')
         .fontSize(10)
         .text('Total:', totalsStartX, totalsY + 70, { width: totalLabelWidth, align: 'right' });
      doc.text(`${rupeeSymbol} ${parseFloat(total).toFixed(2)}`, totalsStartX + totalLabelWidth, totalsY + 70, { width: totalValueWidth, align: 'right' });
      
      // Add a full-width separator before bank details
      doc.moveTo(margin, totalsY + 100)
         .lineTo(margin + contentWidth, totalsY + 100)
         .lineWidth(0.2)
         .opacity(0.5)
         .stroke()
         .opacity(1);
      
      // Spacing for bank details - increase this value for more space
      totalsY += 150; // Increased from 110 to 150 to add more space above Bank Details
      
      // BANK DETAILS SECTION
      const bankBoxWidth = contentWidth * 0.45;
         
      doc.font('BoldFont')
         .fontSize(10)
         .text('Bank Details', margin, totalsY);
      
      // Gather bank details from all possible sources
      let bankDetailsObj = null;
      
      // Try to parse bank_details from the invoice object
      if (invoice.bank_details) {
        if (typeof invoice.bank_details === 'string') {
          try {
            bankDetailsObj = JSON.parse(invoice.bank_details);
          } catch (e) {
            console.error('Failed to parse bank_details string:', e);
          }
        } else if (typeof invoice.bank_details === 'object') {
          bankDetailsObj = invoice.bank_details;
        }
      }
      
      // Format bank details in a clean structured way with better spacing
      if (bankDetailsObj) {
        doc.font('NormalFont')
           .fontSize(9);
           
        const bankY = totalsY + 20;
        const lineSpacing = 15;
        
        // Key-value format with no spacing between labels and values
        const bankName = bankDetailsObj.bankName || bankDetailsObj.bank_name;
        if (bankName) {
          doc.font('BoldFont').text('Bank:', margin, bankY, {continued: true});
          doc.font('NormalFont').text(bankName);
        }
        
        const accountNumber = bankDetailsObj.accountNumber || bankDetailsObj.account_number;
        if (accountNumber) {
          doc.font('BoldFont').text('Account:', margin, bankY + lineSpacing, {continued: true});
          doc.font('NormalFont').text(accountNumber);
        }
        
        const ifscCode = bankDetailsObj.ifscCode || bankDetailsObj.ifsc_code;
        if (ifscCode) {
          doc.font('BoldFont').text('IFSC:', margin, bankY + lineSpacing * 2, {continued: true});
          doc.font('NormalFont').text(ifscCode);
      }
      
        const branch = bankDetailsObj.branch;
        if (branch) {
          doc.font('BoldFont').text('Branch:', margin, bankY + lineSpacing * 3, {continued: true});
          doc.font('NormalFont').text(branch);
        }
      } else {
        // Fallback to direct fields or default values with better formatting
        let bankDetails = '';
        
        if (invoice.bank_name) bankDetails += `Bank: ${invoice.bank_name}\n`;
        if (invoice.account_number) bankDetails += `Account: ${invoice.account_number}\n`;
        if (invoice.ifsc_code) bankDetails += `IFSC: ${invoice.ifsc_code}\n`;
        if (invoice.branch) bankDetails += `Branch: ${invoice.branch}\n`;
      
      // Default bank details if nothing else is available
        if (!bankDetails) {
          bankDetails = `${companyName} Bank Details\n`;
        bankDetails += "Bank: HDFC Bank\n";
        bankDetails += "Account: 50200086903682\n";
        bankDetails += "IFSC: HDFC0001130\n";
        bankDetails += "Branch: Dunlop Branch (Kolkata, West Bengal)";
      }
      
        doc.font('NormalFont')
         .fontSize(9)
           .text(bankDetails, margin, totalsY + 20, {
             width: bankBoxWidth - 30,
             lineGap: 3
           });
      }
      
      // Add clean footer
      const footerY = doc.page.height - 40;
      
      // Final separator before footer
      doc.moveTo(margin, footerY - 15)
         .lineTo(margin + contentWidth, footerY - 15)
         .lineWidth(0.2)
         .opacity(0.3)
         .stroke()
         .opacity(1);
      
      // Make sure we're still on the first page before adding the footer
      if (doc.page.pageNumber === 1) {
        doc.fontSize(8)
           .font('NormalFont')
           .text('Thank you for your business!', margin, footerY, {
             align: 'center',
             width: contentWidth,
             color: '#666666'
           });
      }
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

/**
 * Get all invoices for a user
 * @param {string} userId - The user ID
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Array>} - The invoices
 */
const getAllInvoices = async (userId, supabase) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

/**
 * Get an invoice by ID
 * @param {string} invoiceId - The invoice ID
 * @param {string} userId - The user ID
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Object>} - The invoice
 */
const getInvoiceById = async (invoiceId, userId, supabase) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - The invoice data
 * @param {string} userId - The user ID
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Object>} - The created invoice
 */
const createInvoice = async (invoiceData, userId, supabase) => {
  console.log('Creating invoice with data:', invoiceData);
  
  // Validate Supabase client
  if (!supabase) {
    console.error('Supabase client is not provided');
    throw new Error('Database client is not available');
  }
  
  // Check if the Supabase client has the required methods
  if (typeof supabase.from !== 'function') {
    console.error('Invalid Supabase client: missing "from" method');
    throw new Error('Database client is not properly initialized');
  }
  
  if (!userId) {
    console.error('User ID is not provided');
    throw new Error('User authentication is required');
  }
  
  // Get company details to include logo_url and bank details
  let companyDetails = null;
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', invoiceData.company_id)
      .single();
      
    if (error) {
      console.error('Error fetching company details:', error);
    } else if (data) {
      companyDetails = data;
      console.log('Company details fetched successfully:', data);
    }
  } catch (err) {
    console.error('Exception fetching company details:', err);
  }
  
  // Get client details if needed
  let clientName = '';
  try {
    if (invoiceData.client_id) {
      const { data, error } = await supabase
        .from('clients')
        .select('name')
        .eq('id', invoiceData.client_id)
        .single();
        
      if (!error && data) {
        clientName = data.name;
        console.log('Client name fetched:', clientName);
      }
    }
  } catch (err) {
    console.error('Exception fetching client details:', err);
  }
  
  // Convert date to ISO format if needed
  const parseDateToISO = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    
    // If already ISO format, return as is
    if (dateStr.includes('T')) return dateStr;
    
    // Handle DD-MM-YYYY format
    try {
      const [day, month, year] = dateStr.split('-').map(n => parseInt(n, 10));
      return new Date(year, month - 1, day).toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date().toISOString();
    }
  };
  
  const isoDate = parseDateToISO(invoiceData.invoice_date);
  
  // Store gstRate, cgstRate and sgstRate in the metadata field of items
  const itemsWithMetadata = {
    items: invoiceData.items || [],
    metadata: {
      gstRate: (invoiceData.cgst_rate + invoiceData.sgst_rate) || 18,
      cgstRate: invoiceData.cgst_rate || 9,
      sgstRate: invoiceData.sgst_rate || 9,
      cgstAmount: invoiceData.cgst_amount || 0,
      sgstAmount: invoiceData.sgst_amount || 0
    }
  };
  
  // Check if the invoices table has cgst and sgst columns
  console.log('Checking database schema for CGST/SGST columns...');
  let hasGSTColumns = false;
  try {
    hasGSTColumns = await checkForGSTColumns(supabase);
    console.log('Database has dedicated GST columns:', hasGSTColumns);
  } catch (error) {
    console.error('Error checking for GST columns, assuming they do not exist:', error);
    hasGSTColumns = false;
  }
  
  // Prepare the data for insertion with all required fields
  const dataToInsert = {
    user_id: userId,
    invoice_number: invoiceData.invoice_number,
    bill_number: invoiceData.invoice_number,
    bill_to: clientName || invoiceData.client_name || 'Client',
    bill_date: isoDate, // Use the properly converted ISO date
    date: invoiceData.invoice_date,
    company_id: invoiceData.company_id,
    client_id: invoiceData.client_id,
    company_name: companyDetails?.name || '',
    client_name: clientName || invoiceData.client_name || '',
    items: itemsWithMetadata,
    subtotal: invoiceData.subtotal,
    total: invoiceData.total_amount,
    created_at: new Date().toISOString(),
    company_logo: companyDetails?.logo_url || null,
    bank_details: companyDetails?.bank_details || null
  };
  
  // Only add cgst and sgst columns if they exist in the database
  if (hasGSTColumns) {
    dataToInsert.cgst = invoiceData.cgst || invoiceData.gst / 2;
    dataToInsert.sgst = invoiceData.sgst || invoiceData.gst / 2;
  }
  
  console.log('Inserting data into invoices table');
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert(dataToInsert)
      .select();
      
    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after insert');
      throw new Error('Failed to create invoice: No data returned');
    }
    
    console.log('Invoice created successfully with ID:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('Exception creating invoice:', error);
    throw new Error(`Failed to create invoice: ${error.message || 'Unknown database error'}`);
  }
};

/**
 * Check if the invoices table has cgst and sgst columns
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<boolean>} - Whether the columns exist
 */
const checkForGSTColumns = async (supabase) => {
  try {
    // Validate that supabase client exists and has the 'from' method
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Invalid Supabase client provided to checkForGSTColumns');
      return false; // Cannot check columns if client is invalid
    }
    
    // Try to get columns information by selecting a dummy record with specific columns
    const { error } = await supabase
      .from('invoices')
      .select('cgst, sgst')
      .limit(1);
    
    // If there's an error about missing columns, return false
    if (error && (
        error.message.includes('column') || 
        error.message.includes('field') || 
        error.message.includes('not found') ||
        error.message.includes('schema cache')
      )) {
      console.log('GST columns check result: Columns not found');
      return false;
    }
    
    // No error related to missing columns, so they exist
    console.log('GST columns check result: Columns exist');
    return true;
  } catch (error) {
    console.error('Error checking for GST columns:', error);
    return false; // Assume columns don't exist if there's an error
  }
};

/**
 * Update an existing invoice
 * @param {string} invoiceId - The invoice ID
 * @param {Object} invoiceData - The updated invoice data
 * @param {string} userId - The user ID
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Object>} - The updated invoice
 */
const updateInvoice = async (invoiceId, invoiceData, userId, supabase) => {
  console.log('Updating invoice with data:', invoiceData);
  
  // First, check if the invoice exists and belongs to the user
  const { data: existingInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching existing invoice:', fetchError);
    throw new Error('Invoice not found or access denied');
  }
  
  // Get company details to include logo_url
  let companyDetails = null;
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', invoiceData.company_id || invoiceData.company)
      .single();
      
    if (!error && data) {
      companyDetails = data;
    }
  } catch (err) {
    console.error('Error fetching company details:', err);
  }
  
  // Get client details if needed
  let clientName = '';
  try {
    const clientId = invoiceData.client_id || invoiceData.client;
    if (clientId) {
      const { data, error } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single();
        
      if (!error && data) {
        clientName = data.name;
      }
    }
  } catch (err) {
    console.error('Exception fetching client details:', err);
  }
  
  // Convert date to ISO format if needed
  const parseDateToISO = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    
    // If already ISO format, return as is
    if (dateStr.includes('T')) return dateStr;
    
    // Handle DD-MM-YYYY format
    try {
      const [day, month, year] = dateStr.split('-').map(n => parseInt(n, 10));
      return new Date(year, month - 1, day).toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date().toISOString();
    }
  };
  
  // Determine which format the invoice data is in
  const isNewFormat = 'invoice_number' in invoiceData;
  
  // Store gstRate, cgstRate and sgstRate in the metadata field of items
  const itemsWithMetadata = {
    items: invoiceData.items,
    metadata: {
      gstRate: isNewFormat 
        ? (invoiceData.cgst_rate + invoiceData.sgst_rate) || 18
        : invoiceData.gstRate || 18,
      cgstRate: isNewFormat ? invoiceData.cgst_rate || 9 : invoiceData.cgstRate || 9,
      sgstRate: isNewFormat ? invoiceData.sgst_rate || 9 : invoiceData.sgstRate || 9,
      cgstAmount: isNewFormat 
        ? invoiceData.cgst_amount || 0
        : invoiceData.cgst || (invoiceData.gst ? invoiceData.gst / 2 : 0),
      sgstAmount: isNewFormat 
        ? invoiceData.sgst_amount || 0
        : invoiceData.sgst || (invoiceData.gst ? invoiceData.gst / 2 : 0)
    }
  };
  
  // Check if the invoices table has cgst and sgst columns
  const hasGSTColumns = await checkForGSTColumns(supabase);
  
  // Get date in appropriate format
  const date = isNewFormat ? invoiceData.invoice_date : invoiceData.date;
  const isoDate = parseDateToISO(date);
  
  // Prepare the data for update
  const dataToUpdate = {
    invoice_number: isNewFormat ? invoiceData.invoice_number : invoiceData.invoiceNumber,
    bill_number: isNewFormat ? invoiceData.invoice_number : invoiceData.invoiceNumber,
    bill_to: clientName || (isNewFormat ? invoiceData.client_name : invoiceData.clientName) || 'Client',
    bill_date: isoDate,
    date: date,
    company_id: isNewFormat ? invoiceData.company_id : invoiceData.company,
    client_id: isNewFormat ? invoiceData.client_id : invoiceData.client,
    company_name: companyDetails?.name || (isNewFormat ? '' : invoiceData.companyName) || '',
    client_name: clientName || (isNewFormat ? invoiceData.client_name : invoiceData.clientName) || '',
    items: itemsWithMetadata,
    subtotal: invoiceData.subtotal,
    total: isNewFormat ? invoiceData.total_amount : invoiceData.total,
    updated_at: new Date().toISOString(),
    company_logo: companyDetails?.logo_url || existingInvoice.company_logo,
    bank_details: companyDetails?.bank_details || existingInvoice.bank_details || null
  };
  
  // Only add cgst and sgst columns if they exist in the database
  if (hasGSTColumns) {
    dataToUpdate.cgst = isNewFormat 
      ? invoiceData.cgst_amount || 0
      : invoiceData.cgst || (invoiceData.gst ? invoiceData.gst / 2 : 0);
    dataToUpdate.sgst = isNewFormat 
      ? invoiceData.sgst_amount || 0
      : invoiceData.sgst || (invoiceData.gst ? invoiceData.gst / 2 : 0);
  }
  
  console.log('Updating with data:', dataToUpdate);
  
  const { data, error } = await supabase
    .from('invoices')
    .update(dataToUpdate)
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .select();
    
  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
  
  return data[0];
};

/**
 * Delete an invoice
 * @param {string} invoiceId - The invoice ID
 * @param {string} userId - The user ID
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<void>}
 */
const deleteInvoice = async (invoiceId, userId, supabase) => {
  console.log(`Deleting invoice ${invoiceId} for user ${userId}`);
  
  // Check if the invoice exists and belongs to the user
  const { data: existingInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching invoice to delete:', fetchError);
    throw new Error('Invoice not found or access denied');
  }
  
  // Delete the invoice
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};

module.exports = {
  generateInvoicePDF,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
}; 
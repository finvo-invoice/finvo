const fs = require('fs');
const path = require('path');

/**
 * Generates an XML sitemap for the website
 * @param {Object} options - Configuration options
 * @param {string} options.baseUrl - The base URL of the website (e.g., https://finvo.com)
 * @param {Array} options.blogPosts - Array of blog post objects with slugs and lastmod dates
 * @param {Array} options.staticPages - Array of static page objects with paths and priorities
 * @param {string} options.outputPath - Path where the sitemap should be saved
 * @returns {Promise<string>} - Path to the generated sitemap
 */
const generateSitemap = async (options) => {
  const { baseUrl, blogPosts = [], staticPages = [], outputPath } = options;
  
  if (!baseUrl) {
    throw new Error('baseUrl is required to generate sitemap');
  }
  
  // Normalize baseUrl to ensure it doesn't end with a slash
  const normalizedBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  
  // Start XML content
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
  
  // Add static pages
  staticPages.forEach(page => {
    xmlContent += `  <url>
    <loc>${normalizedBaseUrl}${page.path}</loc>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.8'}</priority>
  </url>
`;
  });
  
  // Add blog posts
  blogPosts.forEach(post => {
    const lastmod = post.updated_at || post.created_at || new Date().toISOString().split('T')[0];
    
    xmlContent += `  <url>
    <loc>${normalizedBaseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  
  // Add blog category pages if available
  const categories = [...new Set(blogPosts.map(post => post.category))];
  categories.forEach(category => {
    if (category) {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      xmlContent += `  <url>
    <loc>${normalizedBaseUrl}/blog/category/${categorySlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
  });
  
  // Close XML
  xmlContent += `</urlset>`;
  
  // Ensure directory exists
  const directory = path.dirname(outputPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  // Write to file
  return new Promise((resolve, reject) => {
    fs.writeFile(outputPath, xmlContent, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(outputPath);
    });
  });
};

module.exports = { generateSitemap }; 
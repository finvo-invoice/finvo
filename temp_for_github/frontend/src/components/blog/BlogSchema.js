import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component that generates schema.org JSON-LD markup for blog posts
 * 
 * @param {Object} props - Component props
 * @param {Object} props.post - Blog post data
 * @param {string} props.baseUrl - Base URL of the website
 * @returns {JSX.Element} - Helmet component with JSON-LD script
 */
const BlogSchema = ({ post, baseUrl = 'https://finvo.com' }) => {
  if (!post) return null;
  
  // Normalize baseUrl to ensure it doesn't end with a slash
  const normalizedBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  
  // Format date to ISO format if it's not already
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString();
    
    // Check if date is already in ISO format
    if (dateString.includes('T')) return dateString;
    
    // Convert YYYY-MM-DD to ISO format
    return new Date(dateString).toISOString();
  };
  
  // Prepare schema data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${normalizedBaseUrl}/blog/${post.slug}`
    },
    "headline": post.title,
    "description": post.excerpt || post.summary || "",
    "image": post.image || `${normalizedBaseUrl}/images/blog-default.jpg`,
    "author": {
      "@type": "Person",
      "name": post.author || "Finvo Team",
      "url": post.authorUrl || `${normalizedBaseUrl}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Finvo",
      "logo": {
        "@type": "ImageObject",
        "url": `${normalizedBaseUrl}/images/logo.png`
      }
    },
    "datePublished": formatDate(post.date || post.created_at),
    "dateModified": formatDate(post.updated_at || post.date || post.created_at)
  };
  
  // Add article body if available
  if (post.content) {
    schemaData.articleBody = post.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 500); // Limit to 500 chars
  }
  
  // Add keywords if available
  if (post.tags && post.tags.length > 0) {
    schemaData.keywords = post.tags.join(', ');
  }
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default BlogSchema; 
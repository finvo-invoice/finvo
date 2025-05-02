import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box, 
  Divider, 
  TextField,
  InputAdornment,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axiosInstance from '../utils/axiosConfig';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import '../styles/blog.css';

// Sample blog posts data (fallback if API fails)
export const SAMPLE_BLOG_POSTS = [
  {
    id: 1,
    title: 'How to Streamline Your Invoice Generation Process',
    slug: 'streamline-invoice-generation-process',
    excerpt: 'Learn how to optimize your invoicing workflow and save hours each month with these proven strategies.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Invoicing',
    date: '2023-06-15',
    readTime: '5 min read',
    author: 'Sarah Johnson',
    featured: true
  },
  {
    id: 2,
    title: '7 Invoice Templates That Will Impress Your Clients',
    slug: '7-invoice-templates-impress-clients',
    excerpt: 'Stand out from the competition with these professionally designed invoice templates that enhance your brand image.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Templates',
    date: '2023-05-28',
    readTime: '4 min read',
    author: 'Michael Chen',
    featured: false
  },
  {
    id: 3,
    title: 'The Ultimate Guide to SaaS Pricing Models',
    slug: 'ultimate-guide-saas-pricing-models',
    excerpt: 'Explore different SaaS pricing strategies and discover which model works best for your business and customer base.',
    image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'SaaS',
    date: '2023-05-10',
    readTime: '8 min read',
    author: 'Alex Rivera',
    featured: false
  },
  {
    id: 4,
    title: 'Tax Compliance for Digital Invoices: What You Need to Know',
    slug: 'tax-compliance-digital-invoices',
    excerpt: 'Stay compliant with the latest tax regulations for digital invoicing across different regions and jurisdictions.',
    image: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Compliance',
    date: '2023-04-22',
    readTime: '6 min read',
    author: 'Emma Thompson',
    featured: false
  },
  {
    id: 5,
    title: 'How AI is Transforming Financial Management for Small Businesses',
    slug: 'ai-transforming-financial-management-small-businesses',
    excerpt: 'Discover how artificial intelligence is making financial tasks easier and more efficient for small business owners.',
    image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Technology',
    date: '2023-04-05',
    readTime: '7 min read',
    author: 'David Wilson',
    featured: true
  },
  {
    id: 6,
    title: 'Automating Your Accounts Receivable: A Step-by-Step Guide',
    slug: 'automating-accounts-receivable-step-by-step',
    excerpt: 'Learn how to implement automation in your accounts receivable process to improve cash flow and reduce manual work.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Automation',
    date: '2023-03-18',
    readTime: '9 min read',
    author: 'Jessica Lee',
    featured: false
  }
];

// Sample categories
const CATEGORIES = [
  { name: 'Invoicing', count: 12 },
  { name: 'SaaS', count: 8 },
  { name: 'Templates', count: 6 },
  { name: 'Automation', count: 5 },
  { name: 'Compliance', count: 4 },
  { name: 'Technology', count: 7 }
];

const BlogPost = ({ post }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const handleReadMore = (e) => {
    e.preventDefault();
    console.log('Read More clicked for post:', post.title, 'with slug:', post.slug);
    navigate(`/blog/${post.slug}`);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={post.featured_image || post.image}
        alt={post.title}
        onClick={handleReadMore}
        sx={{ cursor: 'pointer' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 1 }}>
          <Chip 
            label={post.category_name || post.category} 
            size="small" 
            color="primary" 
            sx={{ mr: 1 }} 
            component={RouterLink}
            to={`/blog/category/${(post.category_slug || post.category || '').toLowerCase()}`}
            clickable
          />
          <Typography variant="caption" color="text.secondary">
            {post.published_at || post.date} • {post.read_time || post.readTime || '5 min read'}
          </Typography>
        </Box>
        <Typography 
          gutterBottom 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1,
            cursor: 'pointer'
          }}
          onClick={handleReadMore}
        >
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {post.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            By {post.author_name || post.author}
          </Typography>
          <Button 
            onClick={handleReadMore}
            size="small" 
            color="primary"
            aria-label={`Read more about ${post.title}`}
          >
            Read More
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const FeaturedPost = ({ post }) => {
  const navigate = useNavigate();
  
  const handleReadArticle = (e) => {
    e.preventDefault();
    console.log('Read Article clicked for featured post:', post.title, 'with slug:', post.slug);
    navigate(`/blog/${post.slug}`);
  };
  
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      mb: 4,
      overflow: 'hidden',
      boxShadow: 3
    }}>
      <CardMedia
        component="img"
        sx={{ 
          width: { xs: '100%', md: '40%' },
          height: { xs: 240, md: 'auto' },
          cursor: 'pointer'
        }}
        image={post.featured_image || post.image}
        alt={post.title}
        onClick={handleReadArticle}
      />
      <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={post.category_name || post.category} 
            size="small" 
            color="primary" 
            sx={{ mr: 1 }} 
            component={RouterLink}
            to={`/blog/category/${(post.category_slug || post.category || '').toLowerCase()}`}
            clickable
          />
          <Typography variant="caption" color="text.secondary">
            {post.published_at || post.date} • {post.read_time || post.readTime || '5 min read'}
          </Typography>
        </Box>
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            lineHeight: 1.2,
            cursor: 'pointer'
          }}
          onClick={handleReadArticle}
        >
          {post.title}
        </Typography>
        <Typography 
          variant="subtitle1" 
          paragraph 
          sx={{ 
            color: 'text.secondary',
            mb: 3
          }}
        >
          {post.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By {post.author_name || post.author}
          </Typography>
          <Button 
            onClick={handleReadArticle}
            variant="contained" 
            color="primary"
            aria-label={`Read article about ${post.title}`}
          >
            Read Article
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Blog = () => {
  console.log('Blog component rendered - Path:', window.location.pathname);
  
  // Add a useEffect to log when the component mounts
  useEffect(() => {
    console.log('Blog component mounted');
    
    // Return cleanup function
    return () => {
      console.log('Blog component unmounted');
    };
  }, []);
  
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [regularPosts, setRegularPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    
    if (pageParam) {
      setPage(parseInt(pageParam));
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);
  
  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      console.log('Fetching blog posts...');
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 6);
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        console.log('Fetching from API with params:', params.toString());
        
        try {
          // Fetch posts
          const response = await axiosInstance.get(`/blog/posts?${params.toString()}`);
          
          console.log('API response:', response.data);
          
          if (response.data && response.data.posts) {
            setPosts(response.data.posts);
            
            // Set pagination data
            if (response.data.pagination) {
              setTotalPages(response.data.pagination.totalPages);
            }
            
            // Process posts
            const featured = response.data.posts.filter(post => post.featured);
            const regular = response.data.posts.filter(post => !post.featured);
            
            setFeaturedPosts(featured.length > 0 ? featured : []);
            setRegularPosts(regular);
          } else {
            throw new Error('No posts found in API response');
          }
        } catch (apiError) {
          console.log('API error or no posts found, using sample data:', apiError);
          // Fallback to sample data if API returns empty or fails
          const featured = SAMPLE_BLOG_POSTS.filter(post => post.featured);
          const regular = SAMPLE_BLOG_POSTS.filter(post => !post.featured);
          
          setPosts(SAMPLE_BLOG_POSTS);
          setFeaturedPosts(featured);
          setRegularPosts(regular);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        
        console.log('Using sample data as fallback');
        // Fallback to sample data
        const featured = SAMPLE_BLOG_POSTS.filter(post => post.featured);
        const regular = SAMPLE_BLOG_POSTS.filter(post => !post.featured);
        
        setPosts(SAMPLE_BLOG_POSTS);
        setFeaturedPosts(featured);
        setRegularPosts(regular);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/blog/categories');
        
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          // Fallback to sample categories
          setCategories(CATEGORIES);
        }
      } catch (err) {
        console.error('Error fetching blog categories:', err);
        // Fallback to sample categories
        setCategories(CATEGORIES);
      }
    };
    
    const fetchPopularPosts = async () => {
      try {
        const response = await axiosInstance.get('/blog/popular');
        
        if (response.data && response.data.posts) {
          setPopularPosts(response.data.posts);
        } else {
          // Fallback to sample posts
          setPopularPosts(SAMPLE_BLOG_POSTS.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching popular posts:', err);
        // Fallback to sample posts
        setPopularPosts(SAMPLE_BLOG_POSTS.slice(0, 3));
      }
    };
    
    fetchPosts();
    fetchCategories();
    fetchPopularPosts();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Update URL with search term
      const params = new URLSearchParams();
      if (e.target.value) {
        params.append('search', e.target.value);
      }
      params.append('page', 1); // Reset to page 1 for new search
      
      navigate(`/blog?${params.toString()}`);
      setSearchTerm(e.target.value);
      setPage(1);
    }
  };
  
  const handlePageChange = (event, value) => {
    // Update URL with page number
    const params = new URLSearchParams();
    params.append('page', value);
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    navigate(`/blog?${params.toString()}`);
    setPage(value);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };

  // Schema.org BlogPosting structured data for SEO
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "headline": "Finvo Blog: Insights on Invoicing, Financial Management & SaaS",
    "description": "Expert articles, guides, and tips on invoice generation, financial management, and SaaS solutions for businesses of all sizes.",
    "publisher": {
      "@type": "Organization",
      "name": "Finvo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://finvo.com/logo.png"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.featured_image || post.image,
      "datePublished": post.published_at || post.date,
      "author": {
        "@type": "Person",
        "name": post.author_name || post.author
      },
      "url": `${window.location.origin}/blog/${post.slug}`
    }))
  };

  return (
    <>
      <Helmet>
        <title>Finvo Blog: Insights on Invoicing, Financial Management & SaaS</title>
        <meta name="description" content="Expert articles, guides, and tips on invoice generation, financial management, and SaaS solutions for businesses of all sizes." />
        <meta name="keywords" content="invoice generation, SaaS, financial management, invoicing software, business automation, digital invoices" />
        <link rel="canonical" href={`${window.location.origin}/blog${location.search}`} />
        <meta property="og:title" content="Finvo Blog: Insights on Invoicing, Financial Management & SaaS" />
        <meta property="og:description" content="Expert articles, guides, and tips on invoice generation, financial management, and SaaS solutions for businesses of all sizes." />
        <meta property="og:url" content={`${window.location.origin}/blog${location.search}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finvo Blog: Insights on Invoicing, Financial Management & SaaS" />
        <meta name="twitter:description" content="Expert articles, guides, and tips on invoice generation, financial management, and SaaS solutions for businesses of all sizes." />
        <script type="application/ld+json">
          {JSON.stringify(blogPostingSchema)}
        </script>
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Breadcrumbs for SEO and navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <MuiLink component={RouterLink} to="/" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">Blog</Typography>
        </Breadcrumbs>

        {/* Blog Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            component="h1" 
            variant="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 2 
            }}
          >
            Finvo Blog
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4
            }}
          >
            Expert insights on invoicing, financial management, and SaaS solutions
          </Typography>
          <TextField
            fullWidth
            placeholder="Search articles..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            sx={{ 
              maxWidth: '600px',
              mx: 'auto'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Typography 
                  component="h2" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <TrendingUpIcon sx={{ mr: 1 }} /> Featured Articles
                </Typography>
                {featuredPosts.map(post => (
                  <FeaturedPost key={post.id} post={post} />
                ))}
              </Box>
            )}

            {/* Main Content */}
            <Grid container spacing={4}>
              {/* Blog Posts */}
              <Grid item xs={12} md={8}>
                <Typography 
                  component="h2" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Latest Articles
                </Typography>
                
                {regularPosts.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 4 }}>
                    No articles found. {searchTerm && 'Try a different search term.'}
                  </Alert>
                ) : (
                  <>
                    <Grid container spacing={3}>
                      {regularPosts.map(post => (
                        <Grid item key={post.id} xs={12} sm={6} md={6}>
                          <BlogPost post={post} />
                        </Grid>
                      ))}
                    </Grid>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                          count={totalPages} 
                          page={page} 
                          onChange={handlePageChange}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} md={4}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  {/* Categories */}
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Typography 
                        component="h3" 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        Categories
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {categories.map(category => (
                        <Box 
                          key={category.id || category.name} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 1.5,
                            pb: 1.5,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none',
                              mb: 0,
                              pb: 0
                            }
                          }}
                        >
                          <MuiLink 
                            component={RouterLink} 
                            to={`/blog/category/${category.slug || category.name.toLowerCase()}`}
                            underline="hover"
                            color="inherit"
                          >
                            {category.name}
                          </MuiLink>
                          <Chip 
                            label={category.post_count || category.count} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Popular Posts */}
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Typography 
                        component="h3" 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <BookmarkIcon sx={{ mr: 1 }} /> Popular Posts
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {popularPosts.map(post => (
                        <Box 
                          key={post.id} 
                          sx={{ 
                            display: 'flex', 
                            mb: 2,
                            pb: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none',
                              mb: 0,
                              pb: 0
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, borderRadius: 1 }}
                            image={post.featured_image || post.image}
                            alt={post.title}
                          />
                          <Box sx={{ ml: 2 }}>
                            <Typography 
                              variant="subtitle2" 
                              component={RouterLink} 
                              to={`/blog/${post.slug}`}
                              sx={{ 
                                textDecoration: 'none',
                                color: 'text.primary',
                                fontWeight: 600,
                                '&:hover': {
                                  color: 'primary.main'
                                }
                              }}
                            >
                              {post.title}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                  
                  {/* Newsletter Signup */}
                  <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography 
                        component="h3" 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        Subscribe to Our Newsletter
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Get the latest articles, guides, and industry insights delivered to your inbox.
                      </Typography>
                      <Box 
                        component="form" 
                        noValidate 
                        sx={{ mt: 1 }}
                      >
                        <input
                          type="email"
                          placeholder="Your email address"
                          style={{ 
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '4px',
                            border: 'none'
                          }}
                        />
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          fullWidth
                        >
                          Subscribe
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default Blog;
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Typography, 
  Box, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Avatar, 
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axiosInstance from '../utils/axiosConfig';
import { format } from 'date-fns';
import { SAMPLE_BLOG_POSTS } from './Blog';
import BlogSchema from '../components/blog/BlogSchema';
import InternalLinkSuggestions from '../components/blog/InternalLinkSuggestions';
import '../styles/blog.css';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  console.log('BlogPost component rendered with slug:', slug);
  
  useEffect(() => {
    // Fetch post data from API
    const fetchPost = async () => {
      console.log('Fetching blog post with slug:', slug);
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API
        try {
          console.log('Making API request to:', `/blog/posts/${slug}`);
          const response = await axiosInstance.get(`/blog/posts/${slug}`);
          console.log('API response:', response.data);
          
          if (response.data && response.data.post) {
            setPost(response.data.post);
            setRelatedPosts(response.data.relatedPosts || []);
            console.log('Post data set successfully');
          } else {
            console.error('Post data not found in API response');
            throw new Error('Post data not found');
          }
        } catch (apiError) {
          console.error('Error fetching from API, falling back to sample data:', apiError);
          
          // Fallback to sample data
          console.log('Looking for post in sample data with slug:', slug);
          const foundPost = SAMPLE_BLOG_POSTS.find(p => p.slug === slug);
          
          if (foundPost) {
            console.log('Found post in sample data:', foundPost.title);
            setPost(foundPost);
            
            // Get related posts (same category, excluding current post)
            const related = SAMPLE_BLOG_POSTS
              .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
              .slice(0, 3);
            
            setRelatedPosts(related);
            console.log('Related posts set from sample data:', related.length);
          } else {
            console.error('Post not found in sample data');
            throw new Error('Post not found');
          }
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. The article may have been moved or deleted.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
    
    // Scroll to top when navigating to a new post
    window.scrollTo(0, 0);
  }, [slug]);
  
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Finvo Blog Post';
    
    let shareUrl;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Loading article...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <AlertTitle>Article Not Found</AlertTitle>
          The article you're looking for could not be found. It may have been moved or deleted.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            component={RouterLink} 
            to="/blog" 
            variant="contained" 
            color="primary"
            startIcon={<ArrowBackIcon />}
          >
            Back to Blog
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Format date for display
  const formatPublishedDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get formatted date
  const publishedDate = formatPublishedDate(post.published_at || post.date);
  
  // Sample article content (in a real app, this would come from the API)
  const articleContent = post.content || `
    <p>In today's fast-paced business environment, efficient invoice generation is not just a nice-to-have—it's essential for maintaining healthy cash flow and professional client relationships. Many businesses still struggle with manual invoicing processes that are time-consuming, error-prone, and delay payments.</p>
    
    <h2>The Cost of Inefficient Invoicing</h2>
    <p>Before diving into solutions, let's understand what inefficient invoicing is costing your business:</p>
    <ul>
      <li>On average, manual invoice processing costs $15-$40 per invoice</li>
      <li>Delays in sending invoices typically result in 30% longer payment times</li>
      <li>Error rates in manual invoicing can reach up to 4%, leading to payment disputes</li>
      <li>Administrative staff spend approximately 20% of their time handling invoice-related issues</li>
    </ul>
    
    <h2>Key Strategies to Streamline Your Invoice Generation</h2>
    
    <h3>1. Implement Cloud-Based Invoicing Software</h3>
    <p>Cloud-based invoicing solutions like Finvo offer significant advantages over traditional methods:</p>
    <ul>
      <li>Access your invoicing system from anywhere, anytime</li>
      <li>Automatic updates ensure you're always using the latest features</li>
      <li>Reduced IT maintenance costs compared to on-premise solutions</li>
      <li>Seamless integration with other business tools</li>
    </ul>
    
    <h3>2. Create Standardized Invoice Templates</h3>
    <p>Professionally designed templates save time and reinforce your brand identity:</p>
    <ul>
      <li>Develop templates for different types of services or products</li>
      <li>Include all legally required information pre-formatted</li>
      <li>Incorporate your brand colors, logo, and fonts</li>
      <li>Ensure templates are mobile-responsive for clients viewing on different devices</li>
    </ul>
    
    <h3>3. Automate Recurring Invoices</h3>
    <p>For subscription-based services or regular clients, automation is a game-changer:</p>
    <ul>
      <li>Set up automatic generation and delivery of invoices at specified intervals</li>
      <li>Reduce manual data entry errors</li>
      <li>Free up staff time for more valuable tasks</li>
      <li>Improve cash flow predictability</li>
    </ul>
    
    <h3>4. Integrate with Payment Gateways</h3>
    <p>Make it easy for clients to pay you immediately:</p>
    <ul>
      <li>Include direct payment links in digital invoices</li>
      <li>Offer multiple payment options (credit card, bank transfer, digital wallets)</li>
      <li>Set up automatic payment reminders</li>
      <li>Enable automatic reconciliation of payments with invoices</li>
    </ul>
    
    <h2>Measuring the Impact of Streamlined Invoicing</h2>
    <p>After implementing these strategies, businesses typically see:</p>
    <ul>
      <li>60-80% reduction in invoice processing time</li>
      <li>30-50% faster payment receipt</li>
      <li>90% decrease in invoicing errors</li>
      <li>Significant improvement in client satisfaction scores</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>Streamlining your invoice generation process isn't just about efficiency—it's about improving your entire business operation. By implementing the strategies outlined above, you'll not only save time and reduce errors but also project a more professional image to your clients and improve your cash flow management.</p>
    
    <p>Remember that the best invoicing solution is one that fits your specific business needs. Take time to evaluate your current process, identify pain points, and select tools that address those challenges directly.</p>
  `;
  
  // Extract tags from post
  const tags = post.tags || ['Invoice Generation', 'Business Efficiency', 'Automation', 'SaaS'];
  
  // Generate meta description from excerpt
  const metaDescription = post.excerpt || post.meta_description || `Read about ${post.title} and learn how to improve your business operations.`;
  
  // Generate canonical URL
  const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Helmet>
        <title>{post.title} | Finvo Blog</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={Array.isArray(tags) ? tags.join(', ') : tags} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={post.featured_image || post.image} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={post.featured_image || post.image} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      {/* Add Schema.org markup */}
      <BlogSchema post={post} baseUrl={window.location.origin} />
      
      {/* Breadcrumbs for SEO and navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={RouterLink} to="/" color="inherit">
          Home
        </MuiLink>
        <MuiLink component={RouterLink} to="/blog" color="inherit">
          Blog
        </MuiLink>
        <MuiLink 
          component={RouterLink} 
          to={`/blog/category/${(post.category_slug || post.category || '').toLowerCase()}`} 
          color="inherit"
        >
          {post.category_name || post.category}
        </MuiLink>
        <Typography color="text.primary">{post.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Article Header */}
          <Box sx={{ mb: 4 }}>
            <Chip 
              label={post.category_name || post.category} 
              color="primary" 
              size="small" 
              component={RouterLink} 
              to={`/blog/category/${(post.category_slug || post.category || '').toLowerCase()}`}
              clickable
              sx={{ mb: 2 }}
            />
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2
              }}
            >
              {post.title}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexWrap: 'wrap',
                mb: 3
              }}
            >
              <Avatar 
                src={post.author_avatar || `https://ui-avatars.com/api/?name=${(post.author_name || post.author || '').replace(' ', '+')}&background=random`} 
                alt={post.author_name || post.author}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ mr: 2 }}>
                By <strong>{post.author_name || post.author}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {publishedDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.read_time || post.readTime || '5 min read'}
              </Typography>
            </Box>
          </Box>

          {/* Featured Image */}
          <Box sx={{ mb: 4 }}>
            <img 
              src={post.featured_image || post.image} 
              alt={post.title}
              style={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: '8px',
                maxHeight: '500px',
                objectFit: 'cover'
              }}
            />
          </Box>

          {/* Social Share */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Share this article:
              </Typography>
              <Box>
                <IconButton 
                  color="primary" 
                  aria-label="share on facebook"
                  onClick={() => handleShare('facebook')}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  color="primary" 
                  aria-label="share on twitter"
                  onClick={() => handleShare('twitter')}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton 
                  color="primary" 
                  aria-label="share on linkedin"
                  onClick={() => handleShare('linkedin')}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Box>
            <Button 
              startIcon={<BookmarkBorderIcon />}
              variant="outlined"
              size="small"
              aria-label="save article for later"
            >
              Save for later
            </Button>
          </Box>

          {/* Article Content */}
          <Box 
            sx={{ mb: 6 }}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />

          {/* Tags */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Related Topics:
            </Typography>
            <Box>
              {Array.isArray(tags) ? tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag} 
                  component={RouterLink} 
                  to={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  clickable
                  sx={{ mr: 1, mb: 1 }}
                />
              )) : (
                <Chip 
                  label={tags} 
                  component={RouterLink} 
                  to={`/blog/tag/${tags.toLowerCase().replace(/\s+/g, '-')}`}
                  clickable
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>
          </Box>

          {/* Author Bio */}
          <Card sx={{ mb: 6, bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={post.author_avatar || `https://ui-avatars.com/api/?name=${(post.author_name || post.author || '').replace(' ', '+')}&size=128&background=random`} 
                  alt={post.author_name || post.author}
                  sx={{ width: 80, height: 80, mr: 3 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    About {post.author_name || post.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.author_bio || `${post.author_name || post.author} is a financial technology expert with over 10 years of experience in the SaaS industry. 
                    Specializing in invoice automation and financial process optimization, they have helped hundreds of 
                    businesses streamline their operations and improve cash flow management.`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                component="h2" 
                variant="h4" 
                sx={{ 
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Related Articles
              </Typography>
              <Grid container spacing={3}>
                {relatedPosts.map(relatedPost => {
                  const handleReadRelated = (e) => {
                    e.preventDefault();
                    console.log('Navigating to related post:', relatedPost.title, 'with slug:', relatedPost.slug);
                    navigate(`/blog/${relatedPost.slug}`);
                  };
                  
                  return (
                    <Grid item key={relatedPost.id} xs={12} sm={6} md={4}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-5px)'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={relatedPost.featured_image || relatedPost.image}
                          alt={relatedPost.title}
                          onClick={handleReadRelated}
                          sx={{ cursor: 'pointer' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography 
                            gutterBottom 
                            variant="subtitle1" 
                            component="h3" 
                            sx={{ fontWeight: 600, cursor: 'pointer' }}
                            onClick={handleReadRelated}
                          >
                            {relatedPost.title}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {relatedPost.published_at || relatedPost.date}
                            </Typography>
                            <Button 
                              onClick={handleReadRelated}
                              size="small" 
                              color="primary"
                            >
                              Read
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
          
          {/* Back to Blog Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Button 
              component={RouterLink} 
              to="/blog" 
              variant="outlined" 
              color="primary"
              startIcon={<ArrowBackIcon />}
            >
              Back to Blog
            </Button>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Internal Link Suggestions */}
          <InternalLinkSuggestions 
            currentPost={post} 
            keywords={Array.isArray(tags) ? [...tags, post.category_name || post.category] : [tags, post.category_name || post.category]}
            maxSuggestions={3}
          />
          
          {/* Newsletter Signup */}
          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
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

          {/* Featured Resources */}
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
                Featured Resources
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  component={RouterLink} 
                  to="/resources/invoice-templates"
                  sx={{ 
                    display: 'block',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Free Invoice Templates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Download our professionally designed invoice templates for various industries.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  component={RouterLink} 
                  to="/resources/invoicing-guide"
                  sx={{ 
                    display: 'block',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Complete Invoicing Guide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our comprehensive guide to professional invoicing and payment collection.
                </Typography>
              </Box>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  component={RouterLink} 
                  to="/resources/roi-calculator"
                  sx={{ 
                    display: 'block',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Invoicing ROI Calculator
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calculate how much time and money you can save with automated invoicing.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card sx={{ bgcolor: 'secondary.light' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography 
                component="h3" 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Ready to Streamline Your Invoicing?
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Try Finvo's automated invoicing solution and save hours each month.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                component={RouterLink}
                to="/signup"
                fullWidth
              >
                Start Free Trial
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                No credit card required. 14-day free trial.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BlogPost; 
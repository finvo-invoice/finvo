import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import { SAMPLE_BLOG_POSTS } from '../../pages/Blog';

/**
 * Component that suggests internal links for blog posts
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentPost - Current blog post data
 * @param {Array} props.keywords - Keywords to match for suggestions
 * @param {number} props.maxSuggestions - Maximum number of suggestions to show
 * @returns {JSX.Element} - Component with internal link suggestions
 */
const InternalLinkSuggestions = ({ 
  currentPost, 
  keywords = [], 
  maxSuggestions = 3 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentPost) return;
    
    // In a real app, this would be an API call
    // For now, we'll use the sample data
    const findSuggestions = () => {
      // Extract keywords from the current post if not provided
      const postKeywords = keywords.length > 0 
        ? keywords 
        : [
            currentPost.category, 
            ...currentPost.title.toLowerCase().split(' ')
              .filter(word => word.length > 4)
          ];
      
      // Find posts that match keywords but exclude current post
      const matches = SAMPLE_BLOG_POSTS
        .filter(post => post.id !== currentPost.id)
        .map(post => {
          // Calculate relevance score based on keyword matches
          const titleWords = post.title.toLowerCase().split(' ');
          const excerptWords = post.excerpt.toLowerCase().split(' ');
          const allWords = [...titleWords, ...excerptWords, post.category.toLowerCase()];
          
          let score = 0;
          postKeywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (post.category.toLowerCase() === keywordLower) {
              score += 5; // Category match is highly relevant
            }
            
            if (post.title.toLowerCase().includes(keywordLower)) {
              score += 3; // Title match is very relevant
            }
            
            if (post.excerpt.toLowerCase().includes(keywordLower)) {
              score += 1; // Excerpt match is somewhat relevant
            }
            
            // Count word matches
            allWords.forEach(word => {
              if (word === keywordLower) score += 0.5;
            });
          });
          
          return { ...post, relevanceScore: score };
        })
        .filter(post => post.relevanceScore > 0) // Only include posts with some relevance
        .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
        .slice(0, maxSuggestions); // Limit to max suggestions
      
      setSuggestions(matches);
    };
    
    findSuggestions();
  }, [currentPost, keywords, maxSuggestions]);
  
  if (suggestions.length === 0) return null;
  
  const handlePostClick = (slug) => {
    console.log('Navigating to suggested post with slug:', slug);
    navigate(`/blog/${slug}`);
  };
  
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          Related Articles You Might Like
        </Typography>
        
        <List sx={{ width: '100%', p: 0 }}>
          {suggestions.map((post, index) => (
            <React.Fragment key={post.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start" 
                onClick={() => handlePostClick(post.slug)}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemAvatar>
                  {post.image ? (
                    <Avatar 
                      alt={post.title} 
                      src={post.image} 
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 1 }}
                    />
                  ) : (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ArticleIcon />
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={post.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {post.category} • {post.readTime}
                      </Typography>
                      {post.excerpt.substring(0, 80)}...
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default InternalLinkSuggestions; 
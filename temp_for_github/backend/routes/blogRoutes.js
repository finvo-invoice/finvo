const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../config/supabase');

/**
 * @route GET /api/blog/posts
 * @desc Get all blog posts with pagination
 * @access Public
 */
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('blog_posts')
      .select('*, blog_categories(name)')
      .eq('published', true)
      .order('published_at', { ascending: false });
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (tag) {
      // For tags, we need to use contains since tags are stored as an array
      query = query.contains('tags', [tag]);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%`);
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('published', true);
    
    // Get paginated results
    const { data, error } = await query
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return res.status(500).json({ message: 'Failed to fetch blog posts', error: error.message });
    }
    
    return res.status(200).json({
      posts: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Server error in fetching blog posts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/posts/:slug
 * @desc Get a single blog post by slug
 * @access Public
 */
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get the post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*, blog_categories(name)')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) {
      console.error('Error fetching blog post:', error);
      return res.status(404).json({ message: 'Blog post not found', error: error.message });
    }
    
    // Increment view count
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ views: post.views + 1 })
      .eq('id', post.id);
    
    if (updateError) {
      console.error('Error updating view count:', updateError);
      // Continue even if view count update fails
    }
    
    // Get related posts from the same category
    const { data: relatedPosts, error: relatedError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, published_at, category_id')
      .eq('category_id', post.category_id)
      .eq('published', true)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (relatedError) {
      console.error('Error fetching related posts:', relatedError);
      // Continue even if related posts fetch fails
    }
    
    return res.status(200).json({
      post,
      relatedPosts: relatedPosts || []
    });
  } catch (error) {
    console.error('Server error in fetching blog post:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/categories
 * @desc Get all blog categories
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching blog categories:', error);
      return res.status(500).json({ message: 'Failed to fetch blog categories', error: error.message });
    }
    
    return res.status(200).json({ categories: data });
  } catch (error) {
    console.error('Server error in fetching blog categories:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/tags
 * @desc Get all blog tags
 * @access Public
 */
router.get('/tags', async (req, res) => {
  try {
    // This is a more complex query to extract unique tags from the tags array in all posts
    const { data, error } = await supabase
      .rpc('get_unique_blog_tags');
    
    if (error) {
      console.error('Error fetching blog tags:', error);
      return res.status(500).json({ message: 'Failed to fetch blog tags', error: error.message });
    }
    
    return res.status(200).json({ tags: data });
  } catch (error) {
    console.error('Server error in fetching blog tags:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/featured
 * @desc Get featured blog posts
 * @access Public
 */
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, blog_categories(name)')
      .eq('published', true)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('Error fetching featured blog posts:', error);
      return res.status(500).json({ message: 'Failed to fetch featured blog posts', error: error.message });
    }
    
    return res.status(200).json({ posts: data });
  } catch (error) {
    console.error('Server error in fetching featured blog posts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/popular
 * @desc Get popular blog posts based on view count
 * @access Public
 */
router.get('/popular', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, featured_image, published_at, views')
      .eq('published', true)
      .order('views', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching popular blog posts:', error);
      return res.status(500).json({ message: 'Failed to fetch popular blog posts', error: error.message });
    }
    
    return res.status(200).json({ posts: data });
  } catch (error) {
    console.error('Server error in fetching popular blog posts:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/blog/posts
 * @desc Create a new blog post (admin only)
 * @access Private (requires admin authentication)
 */
router.post('/posts', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }
    
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      featured_image, 
      category_id, 
      tags, 
      meta_title, 
      meta_description,
      published,
      featured
    } = req.body;
    
    // Validate required fields
    if (!title || !slug || !content || !category_id) {
      return res.status(400).json({ message: 'Title, slug, content, and category are required' });
    }
    
    // Check if slug already exists
    const { data: existingPost, error: slugCheckError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existingPost) {
      return res.status(400).json({ message: 'A post with this slug already exists' });
    }
    
    // Create new post
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        id: uuidv4(),
        title,
        slug,
        excerpt: excerpt || '',
        content,
        featured_image: featured_image || '',
        category_id,
        tags: tags || [],
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt || '',
        author_id: req.user.id,
        published: published || false,
        featured: featured || false,
        views: 0,
        published_at: published ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ message: 'Failed to create blog post', error: error.message });
    }
    
    return res.status(201).json({ 
      message: 'Blog post created successfully',
      post: data
    });
  } catch (error) {
    console.error('Server error in creating blog post:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route PUT /api/blog/posts/:id
 * @desc Update a blog post (admin only)
 * @access Private (requires admin authentication)
 */
router.put('/posts/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }
    
    const { id } = req.params;
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      featured_image, 
      category_id, 
      tags, 
      meta_title, 
      meta_description,
      published,
      featured
    } = req.body;
    
    // Check if post exists
    const { data: existingPost, error: postCheckError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (postCheckError) {
      return res.status(404).json({ message: 'Blog post not found', error: postCheckError.message });
    }
    
    // If slug is being changed, check if new slug already exists
    if (slug !== existingPost.slug) {
      const { data: slugExists, error: slugCheckError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();
      
      if (slugExists) {
        return res.status(400).json({ message: 'A post with this slug already exists' });
      }
    }
    
    // Prepare update data
    const updateData = {
      title: title || existingPost.title,
      slug: slug || existingPost.slug,
      excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
      content: content || existingPost.content,
      featured_image: featured_image !== undefined ? featured_image : existingPost.featured_image,
      category_id: category_id || existingPost.category_id,
      tags: tags || existingPost.tags,
      meta_title: meta_title || title || existingPost.meta_title,
      meta_description: meta_description !== undefined ? meta_description : (excerpt || existingPost.meta_description),
      published: published !== undefined ? published : existingPost.published,
      featured: featured !== undefined ? featured : existingPost.featured,
      updated_at: new Date().toISOString()
    };
    
    // If publishing for the first time, set published_at
    if (published && !existingPost.published) {
      updateData.published_at = new Date().toISOString();
    }
    
    // Update post
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blog post:', error);
      return res.status(500).json({ message: 'Failed to update blog post', error: error.message });
    }
    
    return res.status(200).json({ 
      message: 'Blog post updated successfully',
      post: data
    });
  } catch (error) {
    console.error('Server error in updating blog post:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route DELETE /api/blog/posts/:id
 * @desc Delete a blog post (admin only)
 * @access Private (requires admin authentication)
 */
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }
    
    const { id } = req.params;
    
    // Delete post
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting blog post:', error);
      return res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
    }
    
    return res.status(200).json({ 
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Server error in deleting blog post:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/blog/categories
 * @desc Create a new blog category (admin only)
 * @access Private (requires admin authentication)
 */
router.post('/categories', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }
    
    const { name, slug, description } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }
    
    // Check if slug already exists
    const { data: existingCategory, error: slugCheckError } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    
    // Create new category
    const { data, error } = await supabase
      .from('blog_categories')
      .insert({
        id: uuidv4(),
        name,
        slug,
        description: description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog category:', error);
      return res.status(500).json({ message: 'Failed to create blog category', error: error.message });
    }
    
    return res.status(201).json({ 
      message: 'Blog category created successfully',
      category: data
    });
  } catch (error) {
    console.error('Server error in creating blog category:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/blog/sitemap
 * @desc Generate XML sitemap for blog posts
 * @access Public
 */
router.get('/sitemap', async (req, res) => {
  try {
    // Get all published posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);
    
    if (postsError) {
      console.error('Error fetching posts for sitemap:', postsError);
      return res.status(500).json({ message: 'Failed to generate sitemap', error: postsError.message });
    }
    
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select('slug');
    
    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError);
      return res.status(500).json({ message: 'Failed to generate sitemap', error: categoriesError.message });
    }
    
    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add blog index
    xml += '  <url>\n';
    xml += '    <loc>https://finvo.com/blog</loc>\n';
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
    
    // Add blog posts
    posts.forEach(post => {
      xml += '  <url>\n';
      xml += `    <loc>https://finvo.com/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    // Add categories
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>https://finvo.com/blog/category/${category.slug}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    // Set content type to XML
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    console.error('Server error in generating sitemap:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 
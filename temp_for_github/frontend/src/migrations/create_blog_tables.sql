-- Create blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a GIN index for full-text search on title and content
  -- This will make text searches much faster
  CONSTRAINT blog_posts_title_content_idx UNIQUE (id)
);

-- Create a GIN index for full-text search
CREATE INDEX IF NOT EXISTS blog_posts_title_content_search_idx ON blog_posts USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
);

-- Create an index on the slug for faster lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);

-- Create an index on the category_id for faster filtering
CREATE INDEX IF NOT EXISTS blog_posts_category_id_idx ON blog_posts (category_id);

-- Create an index on the published and published_at for faster filtering
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, published_at);

-- Create an index on the featured flag for faster filtering
CREATE INDEX IF NOT EXISTS blog_posts_featured_idx ON blog_posts (featured);

-- Create an index on the tags array for faster filtering
CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON blog_posts USING GIN (tags);

-- Create a function to extract unique tags from all blog posts
CREATE OR REPLACE FUNCTION get_unique_blog_tags()
RETURNS TABLE (tag TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT t.tag, COUNT(*) OVER (PARTITION BY t.tag) as count
  FROM blog_posts, unnest(tags) AS t(tag)
  WHERE published = TRUE
  ORDER BY count DESC, tag ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories
-- Anyone can view categories
CREATE POLICY "Categories are viewable by everyone" ON blog_categories
  FOR SELECT USING (true);

-- Only admins can insert, update, or delete categories
CREATE POLICY "Categories can be inserted by admins" ON blog_categories
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Categories can be updated by admins" ON blog_categories
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Categories can be deleted by admins" ON blog_categories
  FOR DELETE USING (auth.role() = 'admin');

-- Create policies for blog_posts
-- Published posts are viewable by everyone
CREATE POLICY "Published posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (published = true);

-- Unpublished posts are only viewable by their authors and admins
CREATE POLICY "Unpublished posts are viewable by authors and admins" ON blog_posts
  FOR SELECT USING (
    published = false AND (
      auth.uid() = author_id OR auth.role() = 'admin'
    )
  );

-- Only admins can insert posts
CREATE POLICY "Posts can be inserted by admins" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'admin');

-- Only admins can update posts
CREATE POLICY "Posts can be updated by admins" ON blog_posts
  FOR UPDATE USING (auth.role() = 'admin');

-- Only admins can delete posts
CREATE POLICY "Posts can be deleted by admins" ON blog_posts
  FOR DELETE USING (auth.role() = 'admin');

-- Insert some initial categories
INSERT INTO blog_categories (name, slug, description)
VALUES 
  ('Invoicing', 'invoicing', 'Articles about invoice generation, management, and best practices'),
  ('SaaS', 'saas', 'Software as a Service trends, insights, and strategies'),
  ('Financial Management', 'financial-management', 'Tips and guides for better financial management'),
  ('Automation', 'automation', 'How to automate your business processes'),
  ('Compliance', 'compliance', 'Stay up to date with financial regulations and compliance'),
  ('Technology', 'technology', 'Latest technology trends in financial software')
ON CONFLICT (slug) DO NOTHING; 
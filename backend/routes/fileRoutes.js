const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images, PDFs, and common document formats
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and common document formats are allowed'));
  }
});

// Upload file to Supabase Storage
async function uploadToSupabase(filePath, fileName, userId) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(`${userId}/${fileName}`, fileBuffer, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-files')
      .getPublicUrl(`${userId}/${fileName}`);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

// Upload a file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    // Upload to Supabase Storage
    const fileUrl = await uploadToSupabase(filePath, fileName, userId);
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error in POST /files/upload:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all files for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase.storage
      .from('user-files')
      .list(userId);
    
    if (error) {
      console.error('Error listing files:', error);
      return res.status(500).json({ message: error.message });
    }
    
    const files = data.map(file => ({
      name: file.name,
      size: file.metadata.size,
      created: file.created_at,
      url: supabase.storage.from('user-files').getPublicUrl(`${userId}/${file.name}`).data.publicUrl
    }));
    
    res.json(files);
  } catch (error) {
    console.error('Error in GET /files:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a file
router.delete('/:fileName', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileName = req.params.fileName;
    
    const { error } = await supabase.storage
      .from('user-files')
      .remove([`${userId}/${fileName}`]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({ message: error.message });
    }
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /files/:fileName:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
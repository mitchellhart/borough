require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

// Initialize Firebase Admin and Express app first
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const app = express();

// Add your middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'borough-ai.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5431,
});

// Define authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// NOW initialize and use the files router (after pool and auth are defined)
const filesRouter = require('./routes/files')(pool, authenticateUser);
app.use('/api/files', filesRouter);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client:', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Create files table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Error creating files table:', err));

// File upload endpoint with database integration
app.post('/api/files', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log("uploading file");

    const userId = req.user.uid;
    const fileData = {
      user_id: userId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype
    };

    const result = await pool.query(
      `INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [fileData.user_id, fileData.filename, fileData.original_name, 
       fileData.file_path, fileData.file_size, fileData.mime_type]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: result.rows[0]
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Example query endpoint
app.get('/api/test-db', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});


// Add the files route handler
app.get('/api/files', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('Attempting to fetch files for userId:', userId);
    
    const result = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY upload_date DESC',
      [userId]
    );
    
    console.log('Query executed. Number of files found:', result.rows.length);
    console.log('Files:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Move this AFTER all API routes but BEFORE the catch-all route
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('path/to/your/build/folder'));
  
  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'path/to/your/build/folder', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

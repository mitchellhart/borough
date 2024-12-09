require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const { PdfReader } = require('pdfreader');
const OpenAI = require('openai');
const { type } = require('os');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { updateUserSubscription, getUserSubscriptionStatus, pool } = require('./routes/users');

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Add validation before initialization
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID is not set in environment variables');
}

// Add this debug logging
console.log('Environment variables:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  databaseUrl: process.env.FIREBASE_DATABASE_URL
});

// Then the existing check
if (!process.env.FIREBASE_STORAGE_BUCKET) {
  console.error('Storage bucket not found in environment');
  throw new Error('FIREBASE_STORAGE_BUCKET is not configured');
}

// Then initialize Firebase with the storage bucket
try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Finally get the bucket reference
const bucket = getStorage().bucket();

const app = express();

// FIRST: Set up CORS middleware before any routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://borough-ai.com', 'https://borough-ai.onrender.com']
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// THEN: Mount Stripe routes (including webhook) BEFORE body parsing
const stripeRoutes = require('./routes/stripe')(authenticateUser);
app.use('/api', stripeRoutes);

// AFTER: Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Initialize routes with middleware
const webhookRoutes = require('./routes/webhook');

// Mount routes
app.use('/api/webhook', webhookRoutes);

// THEN: Add your other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize PostgreSQL connection pool
// const pool = new Pool({
//   user: process.env.POSTGRES_USER,
//   host: process.env.POSTGRES_HOST,
//   database: process.env.POSTGRES_DB,
//   password: process.env.POSTGRES_PASSWORD,
//   port: process.env.POSTGRES_PORT || 5432,
// });

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
    text_content TEXT,
    ai_analysis JSONB,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Error creating files table:', err));

// Add this near your other CREATE TABLE queries
pool.query(`
  CREATE TABLE IF NOT EXISTS file_analyses (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Error creating file_analyses table:', err));

// Add this near your other CREATE TABLE queries
pool.query(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Error creating subscriptions table:', err));

// First check if the table exists
pool.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  )
`).then(result => {
  console.log('Users table exists:', result.rows[0].exists);
  
  // If table exists, let's also check its structure
  if (result.rows[0].exists) {
    return pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
  }
}).then(result => {
  if (result) {
    console.log('Users table columns:', result.rows);
  }
}).catch(err => console.error('Error checking users table:', err));

// Create table only if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    auth_id TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Add trigger to automatically update updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  
  CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
`).then(() => {
  console.log('Users table setup completed');
}).catch(err => console.error('Error setting up users table:', err));

// Add the email saving endpoint
app.post('/api/save-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Received email save request:', { email });

    // Basic email validation
    if (!email || !email.includes('@')) {
      console.log('Invalid email format:', { email });
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Log the query we're about to execute
    console.log('Executing query with email:', email);

    // Save to users table, explicitly specifying the email column in ON CONFLICT
    const result = await pool.query(
      `INSERT INTO users (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE
       SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [email]
    );

    console.log('Query result:', result.rows[0]);

    res.status(201).json({
      message: 'Email saved successfully',
      email: result.rows[0].email
    });

  } catch (error) {
    // Enhanced error logging
    console.error('Error saving email:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    
    // Send more specific error message
    res.status(500).json({ 
      error: 'Failed to save email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update your authentication middleware to link the auth_id when they sign up
// This could go in your auth routes or where you handle user creation
const linkUserAuth = async (email, authId) => {
  try {
    await pool.query(
      `UPDATE users 
       SET auth_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE email = $2`,
      [authId, email]
    );
  } catch (error) {
    console.error('Error linking auth:', error);
    throw error;
  }
};

// File upload endpoint with database integration
app.post('/api/files', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.uid;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${req.file.originalname}`;
    const filePath = `uploads/${userId}/${fileName}`;

    // Only process PDFs
    const isPDF = req.file.mimetype === 'application/pdf';
    let extractedText = '';

    if (isPDF) {
      // Extract text from PDF
      extractedText = await new Promise((resolve, reject) => {
        let text = '';
        new PdfReader().parseFileItems(req.file.path, (err, item) => {
          if (err) reject(err);
          else if (!item) resolve(text);
          else if (item.text) text += item.text + ' ';
        });
      });
    }

    // Upload to Firebase Storage
    await bucket.upload(req.file.path, {
      destination: filePath,
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          userId: userId
        }
      }
    });

    // Get the public URL
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future date - you might want to adjust this
    });

    const fileData = {
      user_id: userId,
      filename: fileName,
      original_name: req.file.originalname,
      file_path: filePath,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      text_content: isPDF ? extractedText : null  // Add the extracted text
    };

    // Save metadata to database
    const result = await pool.query(
      `INSERT INTO files (
        user_id, filename, original_name, file_path, 
        file_size, mime_type, text_content
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        fileData.user_id, fileData.filename, fileData.original_name,
        fileData.file_path, fileData.file_size, fileData.mime_type,
        fileData.text_content
      ]
    );

    // Clean up local file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        ...result.rows[0],
        url: url
      }
    });

  } catch (error) {
    console.error('Upload Error:', error);
    // Clean up local file if it exists
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error uploading file' });
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
    
    // console.log('Query executed. Number of files found:', result.rows.length);
    // console.log('Files:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// THEN: Add the session status endpoint specifically
app.get('/api/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    
    // Add this block to update subscription when session is complete
    if (session.status === 'complete') {
      const userId = session.metadata?.userId;
      if (userId) {
        await updateUserSubscription(userId);
      }
    }

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Stripe session status error:', error);
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

// Add this BEFORE the catch-all route
app.get('/api/subscription-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('Checking subscription status for user:', {
      userId: userId,
      userEmail: req.user.email
    });
    
    const subscriptionStatus = await getUserSubscriptionStatus(userId);
    console.log('Sending subscription status response:', subscriptionStatus);
    
    res.json(subscriptionStatus);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch subscription status'
    });
  }
});

// THEN the catch-all route for React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../ui/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../ui/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
// Don't log the private key for security reasons

app.delete('/api/files/:fileId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileId = req.params.fileId;

    // Get file info from database
    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileResult.rows[0];

    // Delete from Firebase Storage
    try {
      await bucket.file(file.file_path).delete();
    } catch (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue even if storage delete fails
    }

    // Delete from database
    await pool.query(
      'DELETE FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.get('/api/files/:fileId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileId = req.params.fileId;

    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];
    const [url] = await bucket.file(file.file_path).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // URL expires in 15 minutes
    });

    res.json({
      ...file,
      url: url
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// Add validation for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/files/:fileId/analyze', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileId = req.params.fileId;

    // Fetch the file and its text content
    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];
    if (!file.text_content) {
      return res.status(400).json({ error: 'No text content available for analysis' });
    }

    console.log('Analyzing file:', {
      fileId,
      fileName: file.original_name,
      textLength: file.text_content.length
    });

    // Call OpenAI API
    const completion = await openai.beta.chat.completions.parse({
      messages: [
        { 
          role: "system", 
          content: "You are a powerful home inspector software that analyzes inspection reports and shares back helpful and accurate information in the format specified below. Please look at the provided report and share your best answers in the format provided. If you cannot find information, simply state 'No inspected'." 
        },
        { 
          role: "user", 
          content: file.text_content 
        }
      ],
      model: "gpt-4o-2024-11-20",  // change model here
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "inspectionReport",
          schema: {
            type: "object",
            properties: {
              property: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  inspectionDate: { type: "string" },
                  inspectedBy: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      license: { type: "string" }
                    },
                    required: ["name", "license"],
                    additionalProperties: false
                  },
                  summary: { 
                    type: "string",
                    description : "A summary of the entire inspection report in 3 sentances."
                   },
                  shortSummary: { 
                    type: "string",
                    description : "A brief summary of the entire inspection report in 1 short sentance."
                   }
                },
                required: ["address", "inspectionDate", "inspectedBy", "summary", "shortSummary"],
                additionalProperties: false
              },
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    issue: { type: "string" },
                    recommendation: { type: "string" },
                    category: {
                      type: "string",
                      enum: [
                        "Plumbing",
                        "Electrical",
                        "Roofing",
                        "Foundation and Masonry",
                        "HVAC and Ventilation",
                        "Interior Finishes (Drywall, Trim, Paint)",
                        "Exterior (Siding, Gutters, Trim)",
                        "Windows and Doors",
                        "Appliances",
                        "Insulation and Energy Efficiency",
                        "Site and Landscaping",
                        "Specialty Systems"
                      ]
                    },
                    urgency: { type: "integer" },
                    estimate: { type: "integer" }
                  },
                  required: ["item", "issue", "recommendation", "category", "urgency", "estimate"],
                  additionalProperties: false
                }
              }
            },
            required: ["property", "findings"],
            additionalProperties: false
          },
          strict: true
        }
      }
      
    });

    console.log('OpenAI Response:', {
      status: 'success',
      response: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    });

    // Update the ai_analysis column in the files table
    const updateResult = await pool.query(
      `UPDATE files 
       SET ai_analysis = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [completion.choices[0].message.content, fileId, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send back the analysis
    res.json({
      fileId: fileId,
      analysis: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Analysis Error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to analyze file' });
  }
});

// Modify the get analysis endpoint to use the files table
app.get('/api/files/:fileId/analysis', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const fileId = req.params.fileId;

    const result = await pool.query(
      'SELECT ai_analysis FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!result.rows[0].ai_analysis) {
      return res.status(404).json({ error: 'No analysis found for this file' });
    }

    res.json(result.rows[0].ai_analysis);

  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Regular routes with JSON parsing
app.use(express.json());



// IMPORTANT: Move this AFTER the webhook route
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Update your authentication middleware to save user data
app.post('/api/link-auth', authenticateUser, async (req, res) => {
  try {
    const { email, authId } = req.body;
    console.log('Received link-auth request:', { email, authId }); // Debug log
    
    // Verify that the authId matches the authenticated user
    if (req.user.uid !== authId) {
      console.log('Auth mismatch:', { 
        requestAuthId: authId, 
        userUid: req.user.uid 
      }); // Debug log
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('Executing database query...'); // Debug log

    // Insert or update user in database with subscription status
    const result = await pool.query(
      `INSERT INTO users (email, auth_id, subscription_status)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET 
         auth_id = EXCLUDED.auth_id,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [email, authId, 'pending']
    );

    console.log('Database query result:', result.rows[0]); // Debug log
    
    res.json({ 
      message: 'Auth linked successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error linking auth:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Failed to link auth', details: error.message });
  }
});

// // Add this endpoint
// app.get('/api/users/:userId/subscription', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const subscriptionData = await getUserSubscriptionStatus(userId);
//     res.json(subscriptionData);
//   } catch (error) {
//     console.error('Error getting subscription status:', error);
//     res.status(500).json({ error: 'Failed to get subscription status' });
//   }
// });

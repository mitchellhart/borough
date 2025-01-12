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
const { updateUserSubscription, getUserSubscriptionStatus, canAnalyzeReport, deductCredit, pool } = require('./routes/users');

const nodeMailer = require('nodemailer');


async function sendEmail(userEmail) {
  const transporter = nodeMailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'mitchellhart@gmail.com',
      pass: process.env.EMAIL_KEY
    }
  })
  const info = await transporter.sendMail({
    from: 'Borough <mitchellhart@gmail.com>',
    to: 'mitch@superfort.tv',
    subject: 'Welcome to Borough!',
    html: `<h1>Hello, you have a new user: ${userEmail}</h1>`
  })
  console.log('Message sent: %s', info.messageId);
}


const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
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

// 1. First, mount the webhook route (before any body parsers)
const webhookRoutes = require('./routes/webhook');
app.use('/api/webhook', webhookRoutes);

// 2. Then add your body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Finally mount other routes including Stripe routes
const stripeRoutes = require('./routes/stripe')(authenticateUser);
app.use('/api', stripeRoutes);



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
  -- First create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    auth_id TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'pending',
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Then add the credits column if it doesn't exist
  ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

  -- Your existing trigger setup
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
  console.log('Users table setup completed with credits column');
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

// Add this BEFORE the catch-all route
app.get('/api/subscription-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
   
    const subscriptionStatus = await getUserSubscriptionStatus(userId);

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
  app.use(express.static('../ui/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../ui/dist', 'index.html'));
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
    

    const accessCheck = await canAnalyzeReport(userId);
    if (!accessCheck.canAnalyze) {
      return res.status(403).json({ 
        error: 'Access denied', 
        reason: accessCheck.reason 
      });
    }

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
          content: `
You are an advocate for new home buyers who are unaware of the important systems within a home and what the important parts of a home inspection report. Your task is to carefully read the provided report data, identify all reported items, and assess whether each item is functioning properly, the age and life expectancy of said items, and if there are any potential issues.

Major systems to prioritize:

Furnace/Heating
Foundation
Electrical
Plumbing
Roof
Windows and Doors
Insulation and Ventilation
Appliances (if applicable)
Exterior (e.g., siding, gutters)
Interior (e.g., walls, flooring)
For each system or item, provide helpful, accurate, and relevant information. If specific data (e.g., age or condition) is provided, compare it to typical performance expectations and note potential concerns.

Key considerations for identifying concerns:

Compare the age of systems to their expected lifespan (e.g., furnace lifespan: 20–25 years).
Identify signs of wear, damage, or other issues (e.g., rust, cracks, leaks).
Highlight any items that may need repair, replacement, or further inspection.
If no issues are mentioned or the system is not inspected, respond with 'Not inspected.'

Always prioritize accuracy, clarity, and highlighting potential risks for the listed systems.
`
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
                    description: "A summary of the entire inspection report in 3 sentences."
                  },
                  shortSummary: {
                    type: "string",
                    description: "A brief summary of the entire inspection report in one short sentence."
                  }
                },
                required: ["address", "inspectionDate", "inspectedBy", "summary", "shortSummary"],
                additionalProperties: false
              },
              findings: {
                type: "array",
                items: {
                  type: "object",
                  description: "Identify every single inspected item in the report and provide an acurate analysis of the item including the estimated cost, hours to fix, and difficulty of fixing the item.",
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
                        "Heating",
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
                    estimate: { type: "integer" },
                    difficultyScore: {
                      type: "integer",
                      description: "How difficult this issue is to fix by yourself (DIY). Answer 1-5"
                    },
                    difficultyDescription: {
                      type: "string",
                      description: "Briefly explaing in how difficult this issue is to fix withough a professional or speciized tools. If it is easy, explain why. If it is hard, explain why."
                    },
                    hoursToFix: {
                      type: "integer",
                      description: "How many estimatedhours it would take to fix this issue if done by a professional."
                    },
                  },
                  required: ["item", "issue", "recommendation", "category", "urgency", "estimate", "difficultyScore", "difficultyDescription", "hoursToFix"],
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

    if (accessCheck.reason === 'Has credits') {
      await deductCredit(userId);
    }
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
       RETURNING *, (xmax = 0) as is_new_user`,
      [email, authId, 'pending']
    );

    console.log('Database query result:', result.rows[0]); // Debug log

    // Check if new user
    if (result.rows[0].is_new_user) {
      await sendEmail(result.rows[0].email)
        .catch(e => console.log(e));
    }

    res.json({
      message: 'Auth linked successfully',
      user: result.rows[0],
      isNewUser: result.rows[0].is_new_user
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

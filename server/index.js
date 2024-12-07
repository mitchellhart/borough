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

// Add your middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://borough-ai.com', 'https://borough-ai.onrender.com']
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
  port: process.env.POSTGRES_PORT || 5432,
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
    
    // console.log('Query executed. Number of files found:', result.rows.length);
    // console.log('Files:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Move this AFTER all API routes but BEFORE the catch-all route
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../ui/build'));
  
  // Handle React routing
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

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    // Get user ID if authenticated
    let userId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('Creating checkout session for user:', userId);
      } catch (error) {
        console.log('No valid auth token provided - proceeding as guest checkout');
      }
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      metadata: {
        user_id: userId
      }
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      userId: userId,
      metadata: session.metadata
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/api/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Stripe session status error:', error);
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

// IMPORTANT: This middleware needs to be before any other route definitions
// that use express.json() middleware
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('Received webhook request');
    console.log('Stripe signature:', sig);
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Webhook event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        userId: session.metadata?.user_id
      });

      // Add this check
      if (!session.metadata?.user_id) {
        console.error('No user_id in session metadata!');
      }

      try {
        const result = await pool.query(
          `INSERT INTO subscriptions (
            user_id,
            stripe_customer_id,
            stripe_subscription_id,
            status,
            current_period_end
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            status = EXCLUDED.status,
            current_period_end = EXCLUDED.current_period_end
          RETURNING *`,
          [
            session.metadata.user_id,
            session.customer,
            session.subscription,
            'active',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ]
        );
        console.log('Subscription stored in database:', result.rows[0]);
      } catch (error) {
        console.error('Database error:', error);
      }
    }

    res.json({received: true});
  } catch (err) {
    console.error('Webhook Error:', err.message);
    if (err.message.includes('No signatures found')) {
      console.error('STRIPE_WEBHOOK_SECRET might be incorrect');
    }
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// IMPORTANT: Make sure your general JSON middleware comes AFTER the webhook route
app.use(express.json());

app.get('/api/subscription-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('Checking subscription status for user:', userId);
    
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    console.log('Subscription query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No subscription found for user:', userId);
      return res.json({ status: 'inactive' });
    }

    res.json({
      status: result.rows[0].status,
      currentPeriodEnd: result.rows[0].current_period_end
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

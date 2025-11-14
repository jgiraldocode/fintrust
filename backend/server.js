const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Database module (auto-selects Turso or SQLite based on environment)
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:3000',
  'https://fintrust-three.vercel.app', // Production frontend
  process.env.FRONTEND_URL, // Additional frontend URL from env
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match or contains vercel.app (for preview deployments)
      return origin === allowedOrigin ||
             (origin && origin.includes('.vercel.app')) ||
             process.env.NODE_ENV === 'development';
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database
// For Vercel serverless, we initialize on each cold start
let dbInitialized = false;

const initializeDb = async () => {
  if (!dbInitialized) {
    await db.initialize();
    dbInitialized = true;
    console.log('✅ Database initialized');
  }
};

if (process.env.VERCEL) {
  console.log('🚀 Running on Vercel (Serverless)');
  // Initialize once on cold start
  initializeDb().catch(err => {
    console.error('Failed to initialize database:', err);
  });
} else {
  // Local development - start server
  db.initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

module.exports = app;


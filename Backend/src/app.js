// Backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

const app = express();

// ------- Logging (dev-friendly) -------
app.use(morgan('tiny'));

// ------- Parse JSON -------
app.use(express.json());

// ------- CORS configuration -------
// ALLOWED_ORIGINS can be a comma-separated list set in Render/Vercel env:
// ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(s => s && s.trim())
  .filter(Boolean);

// If no explicit origins provided, default to allowing localhost for dev
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

// Log allowed origins so you can verify in Render logs
console.log('CORS allowedOrigins =', allowedOrigins);

// corsOptions with dynamic origin check
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // return error to browser (will be displayed as CORS error)
      return callback(new Error('CORS policy: This origin is not allowed: ' + origin), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Ensure preflight (OPTIONS) requests get proper response
app.options('*', cors(corsOptions));

// ------- Routes (prefix with /api) -------
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404 handler for API routes (catch-all under /api)
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler (last)
app.use((err, req, res, next) => {
  // If this was a CORS origin error, respond with 403 and message
  if (err && err.message && err.message.startsWith('CORS policy')) {
    console.warn('CORS rejection:', err.message);
    return res.status(403).json({ message: err.message });
  }

  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

module.exports = app;

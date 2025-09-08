// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

const app = express();

// DEBUG: log every incoming request (temporary — remove when done)
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ---- CORS configuration (flexible) ----
// Support either FRONTEND_URL (single) or FRONTEND_URLS (CSV)
const singleFrontend = (process.env.FRONTEND_URL || '').trim();
const csvFrontends = (process.env.FRONTEND_URLS || '').trim();

const allowedSet = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

if (singleFrontend) allowedSet.add(singleFrontend);
if (csvFrontends) {
  csvFrontends.split(',').map(s => s.trim()).filter(Boolean).forEach(s => allowedSet.add(s));
}

const allowedOrigins = Array.from(allowedSet);
console.log('Allowed CORS origins (app.js):', allowedOrigins);

// Use CORS middleware before other route handlers
app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman) when origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Reject by returning false (no header added). Browser will block request.
    console.warn('Blocked CORS origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','Accept']
}));

// ---- Middleware ----
app.use(express.json());

// ---- Routes (mount after CORS and body parser) ----
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404 handler for API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler (last)
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

module.exports = app;

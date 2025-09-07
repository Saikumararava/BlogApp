// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

const app = express();

// DEBUG: log every incoming request (remove later)
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ---- CORS configuration ----
const FRONTEND_URL = process.env.FRONTEND_URL;
const allowedOrigins = [
  'http://localhost:3000',
  FRONTEND_URL
].filter(Boolean);

console.log('Allowed CORS origins (app.js):', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked CORS origin:', origin);
    return callback(new Error('CORS not allowed for origin: ' + origin));
  },
  credentials: true
}));

// ---- Middleware ----
app.use(express.json());

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404 handler for API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

module.exports = app;

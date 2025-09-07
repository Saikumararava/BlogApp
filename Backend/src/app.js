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

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json()); // body parser for JSON

// Routes (prefix with /api)
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

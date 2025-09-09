// Backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('../routes/auth');
const postRoutes = require('../routes/posts');
const adminRoutes = require('../routes/admin');

const app = express();

/* ---------- Logging: only in non-production ---------- */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ---------- Security & performance (optional but recommended) ---------- */
app.use(helmet());         // basic security headers
app.use(compression());    // gzip responses

// ---- CORS configuration (flexible) ----
// FRONTEND_URL (single) or FRONTEND_URLS (CSV)
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

// If you want the backend to serve the frontend (single-service), set FRONTEND_URL to backend's public URL or set SERVE_CLIENT=true and FRONTEND_URL to that URL.
// Also allow requests from render's internal host systems if needed (you can add more origins via FRONTEND_URLS)
const allowedOrigins = Array.from(allowedSet);
console.log('Allowed CORS origins (app.js):', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman) when origin is undefined
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // You can allow same-origin when the server serves client by comparing to an env var
    if (process.env.SERVE_CLIENT === 'true' && process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

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

/* ---------- Optional: serve client build when using single-service deploy ---------- */
/* Set SERVE_CLIENT=true in Render and ensure Frontend/build exists after build step */
if (process.env.SERVE_CLIENT === 'true') {
  const clientBuildPath = path.join(__dirname, '..', 'Frontend', 'build');
  app.use(express.static(clientBuildPath));

  // serve index.html for non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

/* ---------- Generic error handler (last) ---------- */
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

module.exports = app;

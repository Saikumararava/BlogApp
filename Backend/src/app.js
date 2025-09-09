// Backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');

// ROUTES: app.js is inside src/ so routes are inside src/routes/
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

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

// If you want the backend to serve the frontend (single-service), set SERVE_CLIENT=true in env
const allowedOrigins = Array.from(allowedSet);
console.log('Allowed CORS origins (app.js):', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests (curl/postman) when origin is undefined
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow same-origin when the server serves client by comparing to env var
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
/* Set SERVE_CLIENT=true in Render (or env) and ensure Frontend/build exists after build step */
if (process.env.SERVE_CLIENT === 'true') {
  // Allow override via env if you know the exact path
  const envPath = (process.env.FRONTEND_BUILD_PATH || '').trim();
  const candidates = [];

  if (envPath) {
    candidates.push(path.resolve(envPath));
  } else {
    // Common places relative to this file (src/)
    candidates.push(path.join(__dirname, '..', 'Frontend', 'build'));      // Backend/src -> Backend/Frontend/build
    candidates.push(path.join(__dirname, '..', '..', 'Frontend', 'build'));// Backend/src -> ../Frontend/build (if Backend and Frontend are siblings under project root)
    candidates.push(path.join(__dirname, '..', '..', '..', 'Frontend', 'build'));// fallback
    // Also try a typical "client" folder name
    candidates.push(path.join(__dirname, '..', '..', 'client', 'build'));
  }

  // pick the first existing build path
  const clientBuildPath = candidates.find(p => {
    try {
      return fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch (e) {
      return false;
    }
  });

  if (!clientBuildPath) {
    console.warn('SERVE_CLIENT=true but no Frontend build found. Tried:', candidates);
    console.warn('Set FRONTEND_BUILD_PATH to the absolute path of your build directory or ensure build exists in a common location.');
  } else {
    console.log('Serving client from:', clientBuildPath);
    app.use(express.static(clientBuildPath));

    // serve index.html for non-API routes
    // Use a regex to avoid path-to-regexp issues with '*' on some environments:
    // match any path that does NOT start with /api
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }
}

/* ---------- Generic error handler (last) ---------- */
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

module.exports = app;

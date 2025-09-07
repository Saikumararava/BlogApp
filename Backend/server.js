// backend/server.js
require('dotenv').config();
const http = require('http');
const cors = require('cors');
const app = require('./src/app'); // <-- ensure this matches your project layout
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

function parseFrontendOrigins() {
  // Support either FRONTEND_URL (single) or FRONTEND_URLS (CSV)
  const single = process.env.FRONTEND_URL;
  const csv = process.env.FRONTEND_URLS; // optional: "https://a.vercel.app,https://b.vercel.app"
  const origins = new Set();

  // always allow localhost for dev
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:3000');

  if (single && single.trim()) origins.add(single.trim());
  if (csv && csv.trim()) {
    csv.split(',').map(s => s.trim()).filter(Boolean).forEach(s => origins.add(s));
  }

  return Array.from(origins);
}

async function start() {
  try {
    // 1) Connect to DB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_blog';
    await connectDB(uri);
    console.log('✅ Connected to MongoDB');

    // 2) Configure CORS on the app
    const allowedOrigins = parseFrontendOrigins();
    console.log('Allowed CORS origins:', allowedOrigins);

    app.use(cors({
      origin: function (origin, callback) {
        // allow non-browser tools (curl/postman) when origin is undefined
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn('Blocked CORS origin:', origin);
        return callback(new Error('CORS not allowed for origin: ' + origin), false);
      },
      credentials: true
    }));

    // 3) Optional: lightweight health endpoint (useful for uptime checks)
    app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'unknown' }));

    // 4) Create HTTP server and start listening
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
    });

    // 5) Graceful shutdown
    const shutdown = () => {
      console.log('Shutdown initiated');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      // force exit after 10s
      setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 6) Catch unhandled rejections and exceptions (log + exit)
    process.on('unhandledRejection', (reason) => {
      console.error('UNHANDLED REJECTION:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION:', err);
      // optional: exit after logging
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

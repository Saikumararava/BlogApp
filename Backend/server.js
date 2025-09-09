// backend/server.js
require('dotenv').config();
const http = require('http');
const cors = require('cors');
const app = require('./src/app'); // <-- ensure this matches your project layout
const connectDB = require('./src/config/db');
const util = require('util');

const PORT = process.env.PORT || 5000;

/**
 * Parse allowed frontend origins from env
 * - FRONTEND_URL  : single origin (e.g. https://my-frontend.onrender.com)
 * - FRONTEND_URLS : CSV list of origins
 */
function parseFrontendOrigins() {
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

  // If you're serving the client from the same backend (single service), allow BACKEND_URL too
  if (process.env.SERVE_CLIENT === 'true' && process.env.BACKEND_URL) {
    origins.add(process.env.BACKEND_URL.trim());
  }

  return Array.from(origins);
}

async function start() {
  let server;
  try {
    // 1) Connect to DB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_blog';
    await connectDB(uri);
    console.log('✅ Connected to MongoDB');

    // 2) Configure trust proxy (important on Render / behind proxies)
    // This lets Express correctly detect secure connections and client IPs.
    app.set('trust proxy', 1);

    // 3) Configure CORS on the app
    const allowedOrigins = parseFrontendOrigins();
    console.log('Allowed CORS origins:', allowedOrigins);

    // Use a CORS middleware that does not throw — it simply returns false and the browser will block.
    app.use(cors({
      origin: function (origin, callback) {
        // allow non-browser tools (curl/postman) when origin is undefined
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // If serving client from same backend and origin equals BACKEND_URL, allow it
        if (process.env.SERVE_CLIENT === 'true' && process.env.BACKEND_URL && origin === process.env.BACKEND_URL.trim()) {
          return callback(null, true);
        }

        console.warn('Blocked CORS origin:', origin);
        // do NOT pass an Error object here; just tell CORS to disallow so browser handles it.
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      allowedHeaders: ['Content-Type','Authorization','Accept']
    }));

    // 4) Optional: lightweight health endpoint (useful for uptime checks)
    app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'unknown' }));

    // 5) Create HTTP server and start listening
    server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (http://localhost:${PORT}) — env=${process.env.NODE_ENV || 'dev'}`);
    });

    // helpful server error logging
    server.on('error', (err) => {
      console.error('Server error:', err);
    });

    // 6) Graceful shutdown
    const shutdown = async () => {
      try {
        console.log('Shutdown initiated');
        if (server && server.listening) {
          // stop receiving new connections
          server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
          });

          // force exit after 10s
          setTimeout(() => {
            console.error('Forcing shutdown after timeout');
            process.exit(1);
          }, 10000).unref();
        } else {
          process.exit(0);
        }
      } catch (e) {
        console.error('Error during shutdown', e);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 7) Catch unhandled rejections and exceptions (log + exit)
    process.on('unhandledRejection', async (reason) => {
      console.error('UNHANDLED REJECTION:', util.inspect(reason, { depth: 3 }));
      // attempt graceful shutdown then exit
      try {
        if (server) {
          server.close(() => {
            console.log('Server closed after unhandledRejection');
            process.exit(1);
          });
        } else {
          process.exit(1);
        }
      } catch (e) {
        console.error('Error closing server after unhandledRejection', e);
        process.exit(1);
      }
    });

    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
      // prefer to exit so process manager (Render) can restart the process
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start server', err && err.stack ? err.stack : err);
    // ensure non-zero exit so Render marks the deploy failed
    process.exit(1);
  }
}

start();

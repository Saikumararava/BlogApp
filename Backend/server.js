// backend/server.js
require('dotenv').config();
const http = require('http');
const cors = require('cors');
const app = require('./src/app'); // <-- ensure this matches your project layout
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // 1) Connect to DB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_blog';
    await connectDB(uri);

    // 2) Configure CORS on the app (minimal and safe)
    // Provide FRONTEND_URL in Render environment variables (the public Vercel URL).
    // Example FRONTEND_URL = https://your-frontend.vercel.app
    const FRONTEND_URL = process.env.FRONTEND_URL; // set this on Render to your Vercel URL
    const allowedOrigins = [
      'http://localhost:3000',                // local dev
      FRONTEND_URL                            // production frontend (will be undefined if not set)
    ].filter(Boolean); // remove undefined

    app.use(cors({
      origin: function(origin, callback) {
        // allow non-browser requests (curl/postman) when origin is undefined
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS not allowed for origin: ' + origin));
      },
      credentials: true
    }));

    // 3) Optional: lightweight health endpoint to verify service is up
    // If your app already has /api/health, this will not override it because it's added here.
    app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'unknown' }));

    // 4) Create HTTP server and start listening
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    // 5) Graceful shutdown
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down');
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

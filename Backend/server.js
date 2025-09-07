// backend/server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app'); // <-- ensure path matches where you put app.js
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_blog';
    await connectDB(uri);
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    // optional: graceful shutdown
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

const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
};

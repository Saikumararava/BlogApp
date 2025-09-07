const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ['USER'] } // values: APP_ADMIN, AUTHOR, USER
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

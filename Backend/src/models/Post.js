const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  published_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);

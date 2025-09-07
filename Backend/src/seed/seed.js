require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/mern_blog');
  console.log('Seeding DB...');

  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});

  const password = await bcrypt.hash('Password123!', 10);

  const admin = new User({ name: 'Admin', email: 'admin@example.com', password, roles: ['APP_ADMIN', 'AUTHOR', 'USER'] });
  const author = new User({ name: 'Author', email: 'author@example.com', password, roles: ['AUTHOR', 'USER'] });
  const user = new User({ name: 'User', email: 'user@example.com', password, roles: ['USER'] });

  await admin.save();
  await author.save();
  await user.save();

  const publishedPost = new Post({
    title: 'Seeded Published Post',
    content: 'This is a published post created by seed.',
    status: 'PUBLISHED',
    author: author._id,
    published_at: new Date()
  });
  await publishedPost.save();

  const draftPost = new Post({
    title: 'Seeded Draft Post',
    content: 'This is a draft post.',
    status: 'DRAFT',
    author: author._id
  });
  await draftPost.save();

  const comment = new Comment({
    post: publishedPost._id,
    author: user._id,
    message: 'Nice post! (seeded comment)'
  });
  await comment.save();

  console.log('Seed complete. Admin: admin@example.com / Password123!');
  mongoose.connection.close();
}
seed().catch(err => {
  console.error(err);
  process.exit(1);
});

// postController.js
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

async function authOptionalFromHeader(req) {
  // not used here — routes should attach req.user via middleware (auth or authOptional)
}

// GET /api/posts
exports.listPosts = async (req, res, next) => {
  try {
    let { status, page = 1, limit = 10 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);
    const skip = (page - 1) * limit;

    let filter = {};
    if (!status) status = 'PUBLISHED';

    if (status === 'PUBLISHED') filter.status = 'PUBLISHED';
    else if (status === 'DRAFT') {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      if (req.user.roles.includes('APP_ADMIN')) filter.status = 'DRAFT';
      else if (req.user.roles.includes('AUTHOR')) filter = { status: 'DRAFT', author: req.user._id };
      else return res.status(403).json({ message: 'Forbidden' });
    } else if (status === 'ALL') {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      if (!req.user.roles.includes('APP_ADMIN')) return res.status(403).json({ message: 'Forbidden' });
      filter = {};
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ published_at: -1, createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('author', 'name email');

    res.json({ page, limit, total, data: posts });
  } catch (err) { next(err); }
};

// GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Not found' });

    const post = await Post.findById(id).populate('author', 'name email');
    if (!post) return res.status(404).json({ message: 'Not found' });

    if (post.status === 'DRAFT') {
      if (!req.user) return res.status(404).json({ message: 'Not found' });
      const isAuthor = req.user._id.equals(post.author._id);
      const isAdmin = req.user.roles.includes('APP_ADMIN');
      if (!isAuthor && !isAdmin) return res.status(404).json({ message: 'Not found' });
    }

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);
    const skip = (page - 1) * limit;

    const commentsCount = await Comment.countDocuments({ post: post._id });
    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .skip(skip).limit(limit)
      .populate('author', 'name email');

    res.json({
      post,
      comments: { page, limit, total: commentsCount, data: comments }
    });
  } catch (err) { next(err); }
};

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user.roles.includes('AUTHOR') && !req.user.roles.includes('APP_ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      status: 'DRAFT',
      author: req.user._id
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) { next(err); }
};

// PATCH /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Not found' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    const isOwner = post.author.equals(req.user._id);
    const isAdmin = req.user.roles.includes('APP_ADMIN');
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    const { title, content, status } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (status !== undefined) {
      if (!['DRAFT', 'PUBLISHED'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
      if (status === 'PUBLISHED' && post.status !== 'PUBLISHED') post.published_at = new Date();
      post.status = status;
    }
    await post.save();
    res.json(post);
  } catch (err) { next(err); }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    if (post.status !== 'PUBLISHED') return res.status(400).json({ message: 'Comments allowed only on published posts' });

    const comment = new Comment({
      post: post._id,
      author: req.user._id,
      message
    });
    await comment.save();
    const populated = await comment.populate('author', 'name email');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

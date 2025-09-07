const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// helper authOptional middleware (same as earlier)
async function authOptional(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(payload.id).select('-password');
    if (user) req.user = user;
  } catch (e) { /* ignore invalid token */ }
  return next();
}

router.get('/', authOptional, postController.listPosts);
router.get('/:id', authOptional, postController.getPost);
router.post('/', auth, body('title').notEmpty(), body('content').notEmpty(), postController.createPost);
router.patch('/:id', auth, postController.updatePost);
router.post('/:id/comments', auth, body('message').notEmpty(), postController.addComment);

module.exports = router;

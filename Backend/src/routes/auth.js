const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

router.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authController.signup
);

router.post('/signin',
  body('email').isEmail(),
  body('password').exists(),
  authController.signin
);

module.exports = router;

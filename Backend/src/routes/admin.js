const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const adminController = require('../controllers/adminController');

router.use(auth, requireRole('APP_ADMIN'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;

// adminController.js
const User = require('../models/User');

exports.listUsers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().skip(skip).limit(limit).select('-password').sort({ createdAt: -1 });
    res.json({ page, limit, total, data: users });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['USER', 'AUTHOR', 'APP_ADMIN'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (role === 'AUTHOR') {
      if (!user.roles.includes('AUTHOR')) user.roles.push('AUTHOR');
      if (!user.roles.includes('USER')) user.roles.push('USER');
    } else if (role === 'APP_ADMIN') {
      if (!user.roles.includes('APP_ADMIN')) user.roles.push('APP_ADMIN');
    } else if (role === 'USER') {
      user.roles = user.roles.filter(r => r === 'USER');
      if (user.roles.length === 0) user.roles = ['USER'];
    }

    await user.save();
    res.json({ id: user._id, roles: user.roles });
  } catch (err) { next(err); }
};

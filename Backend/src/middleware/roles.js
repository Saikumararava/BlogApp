// middleware to check roles
module.exports = function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.user.roles || !req.user.roles.includes(requiredRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

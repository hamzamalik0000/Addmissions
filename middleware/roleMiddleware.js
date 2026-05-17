const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ success: false, message: `Access forbidden. Requires ${requiredRole} role.` });
    }
  };
};

module.exports = roleMiddleware;

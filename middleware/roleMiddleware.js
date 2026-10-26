const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: 'Akses ditolak. Role tidak teridentifikasi.'
      });
    }

    const userRole = req.user.role.toLowerCase();
    const hasRole = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.'
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
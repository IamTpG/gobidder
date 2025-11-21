/**
 * Middleware kiểm tra quyền hạn (Role-based Authorization)
 * @param {...String} allowedRoles - Danh sách các role được phép truy cập (vd: "Admin", "Seller")
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const userRole = req.user.role;

    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase(),
    );

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        message: `Forbidden: Require role: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };

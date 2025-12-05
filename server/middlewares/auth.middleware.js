/**
 * Middleware kiểm tra quyền hạn (Role-based Authorization)
 * @param {...String} allowedRoles - Danh sách các role được phép truy cập (vd: "Admin", "Seller")
 */
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Fetch current role from database (JWT might be outdated)
    const prisma = require("../config/prisma");
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const userRole = user.role;

    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase()
    );

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        message: `Forbidden: Require role: ${allowedRoles.join(", ")}`,
      });
    }

    // Update req.user with current role
    req.user.role = userRole;

    next();
  };
};

module.exports = { authorizeRoles };

const { forbidden } = require("../utils/response");

function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return forbidden(res, "No role");
    if (roles.length && !roles.includes(role)) return forbidden(res, "Insufficient permissions");
    next();
  };
}

module.exports = { requireRole };

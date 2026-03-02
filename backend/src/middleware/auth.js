const { verify } = require("../utils/jwt");
const { unauthorized } = require("../utils/response");
const { User, Role } = require("../models");

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return unauthorized(res, "Missing token");
  try {
    const payload = verify(token);
    const user = await User.findByPk(payload.sub, { include: [{ model: Role, as: "role" }] });
    if (!user || !user.is_active) return unauthorized(res, "Invalid user");
    req.user = {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role?.name
    };
    next();
  } catch (e) {
    return unauthorized(res, "Invalid/Expired token");
  }
};

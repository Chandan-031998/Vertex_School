const { User, Role, ActivityLog } = require("../models");
const { verifyPassword } = require("../utils/password");
const { sign } = require("../utils/jwt");
const { ok, unauthorized } = require("../utils/response");

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email }, include: [{ model: Role, as: "role" }] });
  if (!user || !user.is_active) return unauthorized(res, "Invalid credentials");
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return unauthorized(res, "Invalid credentials");

  user.last_login_at = new Date();
  await user.save();

  const token = sign({ sub: user.id, role: user.role?.name });
  await ActivityLog.create({ tenant_id: user.tenant_id || 1, user_id: user.id, action: "LOGIN", entity: "AUTH", entity_id: String(user.id), details: { email }, ip: req.ip, user_agent: req.get("user-agent") });

  return ok(res, {
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role?.name }
  }, "Logged in");
}

async function me(req, res) {
  return ok(res, { user: req.user });
}

module.exports = { login, me };

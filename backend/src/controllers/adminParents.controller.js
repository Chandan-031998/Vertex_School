const { Op } = require("sequelize");
const { Role, User, ParentProfile, ParentStudent, Student, ActivityLog } = require("../models");
const { bad, ok } = require("../utils/response");
const { hashPassword } = require("../utils/password");
const { ROLES } = require("../config/constants");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function ensureParentRole() {
  const [role] = await Role.findOrCreate({
    where: { name: ROLES.PARENT },
    defaults: { name: ROLES.PARENT, description: "Parent portal user" }
  });
  return role;
}

async function validateStudentIds(tenant_id, student_ids = []) {
  if (!Array.isArray(student_ids)) return false;
  const ids = [...new Set(student_ids.map((id) => Number(id)).filter(Boolean))];
  if (!ids.length) return [];
  const rows = await Student.findAll({ where: { tenant_id, id: { [Op.in]: ids } }, attributes: ["id"] });
  if (rows.length !== ids.length) return false;
  return ids;
}

async function listParents(req, res) {
  const tenant_id = tenantIdFromReq(req);
  await ensureParentRole();
  const role = await Role.findOne({ where: { name: ROLES.PARENT } });
  const users = await User.findAll({
    where: { tenant_id, role_id: role.id },
    include: [{ model: ParentProfile, as: "parent_profile_v2" }],
    order: [["created_at", "DESC"]]
  });
  const userIds = users.map((u) => u.id);
  const mappings = userIds.length
    ? await ParentStudent.findAll({ where: { tenant_id, parent_user_id: { [Op.in]: userIds } }, attributes: ["parent_user_id"] })
    : [];
  const counts = mappings.reduce((m, r) => {
    m[r.parent_user_id] = (m[r.parent_user_id] || 0) + 1;
    return m;
  }, {});
  return ok(res, users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    is_active: u.is_active,
    phone: u.parent_profile_v2?.phone || null,
    address: u.parent_profile_v2?.address || null,
    children_count: counts[u.id] || 0
  })));
}

async function createParent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  await ensureParentRole();
  const role = await Role.findOne({ where: { name: ROLES.PARENT } });
  const { full_name, email, password, phone, address, student_ids = [] } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return bad(res, "email already exists");

  const validStudentIds = await validateStudentIds(tenant_id, student_ids);
  if (validStudentIds === false) return bad(res, "One or more student_ids are invalid");

  const user = await User.create({
    tenant_id,
    role_id: role.id,
    email,
    password_hash: await hashPassword(password),
    full_name,
    is_active: true
  });
  const profile = await ParentProfile.create({
    tenant_id,
    user_id: user.id,
    phone: phone || null,
    address: address || null
  });
  if (validStudentIds.length) {
    await ParentStudent.bulkCreate(validStudentIds.map((student_id) => ({ tenant_id, parent_user_id: user.id, student_id })));
  }

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "PARENT", entity_id: String(user.id), details: { email } });
  return ok(res, { user, profile, student_ids: validStudentIds }, "Parent created");
}

async function getParent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const user = await User.findOne({
    where: { tenant_id, id: req.params.id },
    include: [{ model: Role, as: "role" }, { model: ParentProfile, as: "parent_profile_v2" }]
  });
  if (!user || user.role?.name !== ROLES.PARENT) return bad(res, "Parent not found");
  const mappings = await ParentStudent.findAll({
    where: { tenant_id, parent_user_id: user.id },
    include: [{ model: Student, as: "student", attributes: ["id", "full_name", "class_name", "section", "admission_no"] }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    is_active: user.is_active,
    phone: user.parent_profile_v2?.phone || null,
    address: user.parent_profile_v2?.address || null,
    student_ids: mappings.map((m) => m.student_id),
    students: mappings.map((m) => m.student)
  });
}

async function updateParent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const user = await User.findOne({
    where: { tenant_id, id: req.params.id },
    include: [{ model: Role, as: "role" }]
  });
  if (!user || user.role?.name !== ROLES.PARENT) return bad(res, "Parent not found");
  const validStudentIds = await validateStudentIds(tenant_id, req.body.student_ids || []);
  if (validStudentIds === false) return bad(res, "One or more student_ids are invalid");

  const userPatch = {};
  if (req.body.full_name !== undefined) userPatch.full_name = req.body.full_name;
  if (req.body.is_active !== undefined) userPatch.is_active = !!req.body.is_active;
  await user.update(userPatch);

  const [profile] = await ParentProfile.findOrCreate({ where: { tenant_id, user_id: user.id }, defaults: { tenant_id, user_id: user.id } });
  const profilePatch = {};
  if (req.body.phone !== undefined) profilePatch.phone = req.body.phone || null;
  if (req.body.address !== undefined) profilePatch.address = req.body.address || null;
  await profile.update(profilePatch);

  if (req.body.student_ids !== undefined) {
    await ParentStudent.destroy({ where: { tenant_id, parent_user_id: user.id } });
    if (validStudentIds.length) {
      await ParentStudent.bulkCreate(validStudentIds.map((student_id) => ({ tenant_id, parent_user_id: user.id, student_id })));
    }
  }

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "PARENT", entity_id: String(user.id) });
  return ok(res, { id: user.id }, "Parent updated");
}

async function deleteParent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const user = await User.findOne({
    where: { tenant_id, id: req.params.id },
    include: [{ model: Role, as: "role" }]
  });
  if (!user || user.role?.name !== ROLES.PARENT) return bad(res, "Parent not found");
  await user.update({ is_active: false });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "PARENT", entity_id: String(user.id) });
  return ok(res, { id: user.id }, "Parent disabled");
}

async function resetParentPassword(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const user = await User.findOne({
    where: { tenant_id, id: req.params.id },
    include: [{ model: Role, as: "role" }]
  });
  if (!user || user.role?.name !== ROLES.PARENT) return bad(res, "Parent not found");
  user.password_hash = await hashPassword(req.body.new_password);
  await user.save();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "RESET_PASSWORD", entity: "PARENT", entity_id: String(user.id) });
  return ok(res, { id: user.id }, "Password reset");
}

module.exports = {
  listParents,
  createParent,
  getParent,
  updateParent,
  deleteParent,
  resetParentPassword
};

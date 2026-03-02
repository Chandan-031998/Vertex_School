const { Role, User, Staff, ActivityLog } = require("../models");
const { hashPassword } = require("../utils/password");
const { ok, created, bad, forbidden } = require("../utils/response");
const { ROLES } = require("../config/constants");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

function normalizeAssignedClasses(value) {
  if (!Array.isArray(value)) return [];
  const rows = value.map((item) => {
    if (typeof item === "string") {
      const [class_name, section] = item.split("-").map((v) => String(v || "").trim());
      if (!class_name || !section) return null;
      return { class_name, section };
    }
    if (!item || typeof item !== "object") return null;
    const class_name = String(item.class_name || "").trim();
    const section = String(item.section || "").trim();
    if (!class_name || !section) return null;
    return { class_name, section };
  }).filter(Boolean);

  const unique = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.class_name}::${row.section}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

async function listStaff(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await Staff.findAll({ where: { tenant_id }, include: [{ model: User, as: "user", include: [{ model: Role, as: "role" }] }] });
  const data = rows.map(s => ({
    id: s.id,
    user_id: s.user_id,
    full_name: s.user?.full_name,
    email: s.user?.email,
    role: s.user?.role?.name,
    employee_code: s.employee_code,
    designation: s.designation,
    phone: s.phone,
    assigned_classes: s.assigned_classes
  }));
  return ok(res, data);
}

async function createStaff(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { email, password, full_name, role, designation, phone, assigned_classes } = req.body;
  const roleRow = await Role.findOne({ where: { name: role } });
  if (!roleRow) return bad(res, "Role not found");

  const password_hash = await hashPassword(password);
  const user = await User.create({ tenant_id, email, password_hash, full_name, role_id: roleRow.id });

  const staff = await Staff.create({
    tenant_id,
    user_id: user.id,
    employee_code: "EMP-" + String(Date.now()).slice(-6),
    designation: designation || null,
    phone: phone || null,
    assigned_classes: normalizeAssignedClasses(assigned_classes || [])
  });

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "STAFF", entity_id: String(staff.id), details: { email, role } });
  return created(res, { staff, user: { id: user.id, email, full_name, role } }, "Staff created");
}

async function updateStaff(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.ADMIN) return forbidden(res, "Insufficient permissions");
  const staff = await Staff.findOne({ where: { id: req.params.id, tenant_id }, include: [{ model: User, as: "user", include: [{ model: Role, as: "role" }] }] });
  if (!staff) return bad(res, "Not found");

  const userPatch = {};
  const staffPatch = {};

  if (req.body.email) userPatch.email = req.body.email;
  if (req.body.full_name) userPatch.full_name = req.body.full_name;
  if (req.body.password) userPatch.password_hash = await hashPassword(req.body.password);
  if (req.body.role) {
    const roleRow = await Role.findOne({ where: { name: req.body.role } });
    if (!roleRow) return bad(res, "Role not found");
    userPatch.role_id = roleRow.id;
  }

  if (req.body.designation !== undefined) staffPatch.designation = req.body.designation;
  if (req.body.phone !== undefined) staffPatch.phone = req.body.phone;
  if (req.body.assigned_classes !== undefined) staffPatch.assigned_classes = normalizeAssignedClasses(req.body.assigned_classes);

  if (Object.keys(userPatch).length) await staff.user.update(userPatch);
  if (Object.keys(staffPatch).length) await staff.update(staffPatch);

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "STAFF", entity_id: String(staff.id), details: { userPatch, staffPatch } });
  return ok(res, { id: staff.id }, "Updated");
}

async function deleteStaff(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.ADMIN) return forbidden(res, "Insufficient permissions");
  const staff = await Staff.findOne({ where: { id: req.params.id, tenant_id } });
  if (!staff) return bad(res, "Not found");

  const user = await User.findByPk(staff.user_id);
  if (user) {
    user.is_active = false;
    await user.save();
  }
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "STAFF", entity_id: String(staff.id), details: { user_id: staff.user_id } });
  return ok(res, null, "Staff disabled");
}

async function listActivityLogs(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.ADMIN) return forbidden(res, "Insufficient permissions");
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const rows = await ActivityLog.findAll({ where: { tenant_id }, order: [["created_at", "DESC"]], limit });
  return ok(res, rows);
}

async function assignClasses(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.ADMIN) return forbidden(res, "Insufficient permissions");
  const staff = await Staff.findOne({ where: { id: req.params.staffId, tenant_id }, include: [{ model: User, as: "user", include: [{ model: Role, as: "role" }] }] });
  if (!staff) return bad(res, "Staff not found");
  if (staff.user?.role?.name !== ROLES.TEACHER) return bad(res, "Classes can only be assigned to a TEACHER");

  const assigned_classes = normalizeAssignedClasses(req.body.assigned_classes);
  if (assigned_classes.length !== req.body.assigned_classes.length) return bad(res, "Invalid assigned_classes data");
  const dupCheck = new Set();
  for (const item of assigned_classes) {
    const key = `${item.class_name}::${item.section}`;
    if (dupCheck.has(key)) return bad(res, "Duplicate class-section in assigned_classes");
    dupCheck.add(key);
  }

  staff.assigned_classes = assigned_classes;
  await staff.save();
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "ASSIGN_CLASSES",
    entity: "STAFF",
    entity_id: String(staff.id),
    details: { assigned_classes }
  });

  return ok(res, { staff_id: staff.id, assigned_classes }, "Classes assigned");
}

async function myAssignedClasses(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.TEACHER) return forbidden(res, "Only teacher can access");
  const staff = await Staff.findOne({ where: { user_id: req.user.id, tenant_id } });
  const assigned_classes = normalizeAssignedClasses(staff?.assigned_classes || []);
  return ok(res, { assigned_classes });
}

module.exports = { listStaff, createStaff, updateStaff, deleteStaff, listActivityLogs, assignClasses, myAssignedClasses, normalizeAssignedClasses };

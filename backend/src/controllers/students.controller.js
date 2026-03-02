const { Op } = require("sequelize");
const { Student, ActivityLog, Staff } = require("../models");
const { ok, created, bad, forbidden } = require("../utils/response");
const { ROLES } = require("../config/constants");
const { normalizeAssignedClasses } = require("./staff.controller");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function teacherAllowed(req) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.TEACHER) return null;
  const staff = await Staff.findOne({ where: { user_id: req.user.id, tenant_id } });
  return normalizeAssignedClasses(staff?.assigned_classes || []);
}

function buildClassWhere(assigned) {
  return assigned.map((v) => ({ class_name: v.class_name, section: v.section }));
}

async function listStudents(req, res) {
  const { q, class_name, section } = req.query;
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id, is_active: true };
  if (class_name) where.class_name = class_name;
  if (section) where.section = section;
  if (q) where.full_name = { [Op.like]: `%${q}%` };
  const assigned = await teacherAllowed(req);
  if (assigned) {
    if (!assigned.length) return ok(res, []);
    where[Op.or] = buildClassWhere(assigned);
  }

  const rows = await Student.findAll({ where, order: [["class_name","ASC"],["section","ASC"],["full_name","ASC"]], limit: 500 });
  return ok(res, rows);
}

async function createStudent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const documents = (req.files || []).map(f => ({ filename: f.filename, path: f.path }));
  const admission_no = req.body.admission_no || ("ADM-" + String(Date.now()));
  const student = await Student.create({ ...req.body, tenant_id, admission_no, documents });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "STUDENT", entity_id: String(student.id) });
  return created(res, student, "Student created");
}

async function getStudent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Student.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  const assigned = await teacherAllowed(req);
  if (assigned) {
    const allowed = assigned.some((a) => a.class_name === row.class_name && a.section === row.section);
    if (!allowed) return forbidden(res, "Not allowed for this class");
  }
  return ok(res, row);
}

async function listMyAssignedStudents(req, res) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.TEACHER) return forbidden(res, "Only teacher can access");
  const assigned = await teacherAllowed(req);
  if (!assigned || assigned.length === 0) return ok(res, { assigned_classes: [], students: [] });

  const where = { tenant_id, is_active: true, [Op.or]: buildClassWhere(assigned) };
  if (req.query.class_name) where.class_name = req.query.class_name;
  if (req.query.section) where.section = req.query.section;

  const rows = await Student.findAll({ where, order: [["class_name","ASC"],["section","ASC"],["full_name","ASC"]], limit: 500 });
  return ok(res, { assigned_classes: assigned, students: rows });
}

async function updateStudent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Student.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  const documents = (req.files || []).map(f => ({ filename: f.filename, path: f.path }));
  const patch = { ...req.body };
  if (documents.length) patch.documents = [...(row.documents || []), ...documents];
  await row.update(patch);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "STUDENT", entity_id: String(row.id) });
  return ok(res, row, "Updated");
}

async function deleteStudent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Student.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  row.is_active = false;
  await row.save();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "STUDENT", entity_id: String(row.id) });
  return ok(res, row, "Deactivated");
}

module.exports = { listStudents, listMyAssignedStudents, createStudent, getStudent, updateStudent, deleteStudent };

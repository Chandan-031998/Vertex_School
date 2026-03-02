const { v4: uuid } = require("uuid");
const { Op } = require("sequelize");
const { Admission, Student, ActivityLog } = require("../models");
const { ok, created, bad } = require("../utils/response");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function createAdmission(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const application_no = "APP-" + uuid().slice(0,8).toUpperCase();
  const documents = (req.files || []).map(f => ({ field: f.fieldname, filename: f.filename, path: f.path }));
  const admission = await Admission.create({ ...req.body, tenant_id, application_no, documents });
  await ActivityLog.create({ tenant_id, user_id: req.user?.id || null, action: "CREATE", entity: "ADMISSION", entity_id: String(admission.id), details: { application_no } });
  return created(res, admission, "Application submitted");
}

async function listAdmissions(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { status, q } = req.query;
  const where = { tenant_id };
  if (status) where.status = status;
  if (q) where.full_name = { [Op.like]: `%${q}%` };
  if (req.user.role !== "ADMIN") where.status = "APPROVED";
  const rows = await Admission.findAll({ where, order: [["created_at","DESC"]], limit: 200 });
  return ok(res, rows);
}


async function getAdmission(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Admission.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  if (req.user.role !== "ADMIN" && row.status !== "APPROVED") return bad(res, "Not found");
  return ok(res, row);
}

async function updateAdmission(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Admission.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");

  const documents = (req.files || []).map(f => ({ field: f.fieldname, filename: f.filename, path: f.path }));
  const patch = { ...req.body };
  if (documents.length) patch.documents = [...(row.documents || []), ...documents];

  await row.update(patch);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "ADMISSION", entity_id: String(row.id) });
  return ok(res, row, "Updated");
}

async function updateStatus(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const admission = await Admission.findOne({ where: { id: req.params.id, tenant_id } });
  if (!admission) return bad(res, "Not found");

  admission.status = req.body.status;
  admission.remarks = req.body.remarks || admission.remarks;
  admission.verified_by = req.user.id;
  admission.verified_at = new Date();
  await admission.save();

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE_STATUS", entity: "ADMISSION", entity_id: String(admission.id), details: { status: admission.status } });

  return ok(res, admission, "Updated");
}

async function convertToStudent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const admission = await Admission.findOne({ where: { id: req.params.id, tenant_id } });
  if (!admission) return bad(res, "Not found");
  if (admission.status !== "APPROVED") return bad(res, "Only APPROVED applications can be converted");

  const admission_no = "ADM-" + uuid().slice(0,8).toUpperCase();
  const student = await Student.create({
    tenant_id,
    admission_id: admission.id,
    admission_no,
    full_name: admission.full_name,
    dob: admission.dob,
    gender: admission.gender,
    class_name: admission.applying_class,
    section: admission.section || "A",
    parent_name: admission.parent_name,
    parent_phone: admission.parent_phone,
    address: admission.address,
    documents: admission.documents
  });

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CONVERT", entity: "ADMISSION", entity_id: String(admission.id), details: { student_id: student.id } });

  return created(res, student, "Converted to student");
}

async function deleteAdmission(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Admission.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");

  const converted = await Student.findOne({ where: { admission_id: row.id, tenant_id } });
  if (converted) return bad(res, "Cannot delete converted admission");

  await row.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "ADMISSION", entity_id: String(req.params.id) });
  return ok(res, null, "Deleted");
}

module.exports = { createAdmission, listAdmissions, getAdmission, updateAdmission, updateStatus, convertToStudent, deleteAdmission };

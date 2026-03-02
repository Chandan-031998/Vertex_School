const { ok, bad, forbidden } = require("../utils/response");
const { toCsv } = require("../utils/csv");
const { Student, Staff } = require("../models");
const { attendanceMonthly, feeCollection } = require("../services/report.service");
const { ROLES } = require("../config/constants");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function classStrength(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name } = req.query;
  if (!class_name) return bad(res, "class_name required");
  const rows = await Student.findAll({ where: { tenant_id, class_name, is_active: true }, attributes: ["section"] });
  const map = new Map();
  for (const r of rows) map.set(r.section, (map.get(r.section)||0)+1);
  const data = Array.from(map.entries()).map(([section,count]) => ({ class_name, section, count }));
  return ok(res, data);
}

async function exportStudentList(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name, section } = req.query;
  const where = { tenant_id, is_active: true };
  if (class_name) where.class_name = class_name;
  if (section) where.section = section;
  const rows = await Student.findAll({ where, order: [["class_name","ASC"],["section","ASC"],["full_name","ASC"]] });
  const data = rows.map(s => ({
    admission_no: s.admission_no,
    full_name: s.full_name,
    class_name: s.class_name,
    section: s.section,
    roll_no: s.roll_no || "",
    parent_name: s.parent_name || "",
    parent_phone: s.parent_phone || ""
  }));
  const csv = toCsv(data, ["admission_no","full_name","class_name","section","roll_no","parent_name","parent_phone"]);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="students_${class_name || "all"}_${section || "all"}.csv"`);
  return res.send(csv);
}

async function attendanceReport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name, section, month } = req.query;
  if (!class_name || !section || !month) return bad(res, "class_name, section, month required");
  if (req.user.role === ROLES.TEACHER) {
    const staff = await Staff.findOne({ where: { user_id: req.user.id, tenant_id } });
    const assigned = Array.isArray(staff?.assigned_classes) ? staff.assigned_classes : [];
    const allowed = assigned.some((a) => String(a.class_name) === String(class_name) && String(a.section) === String(section));
    if (!allowed) return forbidden(res, "Not allowed for this class");
  }
  const data = await attendanceMonthly(class_name, section, month, tenant_id);
  return ok(res, data);
}

async function feeReport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { month } = req.query;
  const data = await feeCollection(month, tenant_id);
  return ok(res, data);
}

module.exports = { classStrength, exportStudentList, attendanceReport, feeReport };

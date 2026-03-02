const { Op } = require("sequelize");
const { Attendance, Student, ActivityLog, Staff, AttendanceSetting } = require("../models");
const { ok, bad, forbidden } = require("../utils/response");
const { toCsv } = require("../utils/csv");
const { attendanceMonthly } = require("../services/report.service");
const { ROLES } = require("../config/constants");
const { normalizeAssignedClasses } = require("./staff.controller");

async function teacherCanAccessClass(req, class_name, section) {
  const tenant_id = tenantIdFromReq(req);
  if (req.user.role !== ROLES.TEACHER) return true;
  const staff = await Staff.findOne({ where: { user_id: req.user.id, tenant_id } });
  const assigned = normalizeAssignedClasses(staff?.assigned_classes || []);
  return assigned.some((a) => a.class_name === class_name && a.section === section);
}

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function getAttendancePolicy(req) {
  try {
    const tenant_id = tenantIdFromReq(req);
    const [row] = await AttendanceSetting.findOrCreate({
      where: { tenant_id },
      defaults: {
        tenant_id,
        mode: "DAILY",
        cutoff_time: null,
        allow_edit_days: 1,
        auto_absent_after_cutoff: false,
        leave_types_json: ["SICK", "CASUAL", "OFFICIAL"]
      }
    });
    return row;
  } catch (err) {
    return { cutoff_time: null, allow_edit_days: 1 };
  }
}

function isOlderThanWindow(dateStr, allowEditDays) {
  const d = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const today = new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`);
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff > Number(allowEditDays || 0);
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function isAfterCutoff(cutoff) {
  if (!cutoff) return false;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}` > String(cutoff);
}

async function enforceTeacherAttendancePolicy(req, res, targetDate) {
  if (req.user.role !== ROLES.TEACHER) return true;
  const policy = await getAttendancePolicy(req);
  if (isOlderThanWindow(targetDate, policy.allow_edit_days)) {
    forbidden(res, `Teacher can edit attendance only within ${policy.allow_edit_days} day(s)`);
    return false;
  }

  if (targetDate === todayYmd() && policy.cutoff_time && isAfterCutoff(policy.cutoff_time)) {
    forbidden(res, `Attendance cutoff time (${policy.cutoff_time}) has passed for today`);
    return false;
  }
  return true;
}

async function markAttendance(req, res) {
  const { class_name, section, date, records } = req.body;
  const tenant_id = tenantIdFromReq(req);
  if (!(await teacherCanAccessClass(req, class_name, section))) return forbidden(res, "Not allowed for this class");
  if (!(await enforceTeacherAttendancePolicy(req, res, date))) return;

  const studentIds = records.map(e => e.student_id);
  const students = await Student.findAll({ where: { tenant_id, id: { [Op.in]: studentIds }, class_name, section } });
  const validIds = new Set(students.map(s => s.id));
  if (students.length !== studentIds.length) return bad(res, "One or more students are not in the provided class/section");

  const upserts = [];
  for (const e of records) {
    if (!validIds.has(e.student_id)) return bad(res, "Invalid student in records");
    upserts.push({
      student_id: e.student_id,
      tenant_id,
      class_name,
      section,
      date,
      status: e.status,
      marked_by: req.user.id
    });
  }

  for (const row of upserts) {
    await Attendance.upsert(row);
  }

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "MARK", entity: "ATTENDANCE", entity_id: `${class_name}-${section}-${date}`, details: { count: upserts.length } });
  return ok(res, { count: upserts.length }, "Attendance saved");
}

async function monthlyReport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name, section, month } = req.query;
  if (!class_name || !section || !month) return bad(res, "class_name, section, month required");
  if (!(await teacherCanAccessClass(req, class_name, section))) return forbidden(res, "Not allowed for this class");
  const rows = await attendanceMonthly(class_name, section, month, tenant_id);
  return ok(res, rows);
}

async function dailyReport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name, section, date } = req.query;
  if (!class_name || !section || !date) return bad(res, "class_name, section, date required");
  if (!(await teacherCanAccessClass(req, class_name, section))) return forbidden(res, "Not allowed for this class");
  const rows = await Attendance.findAll({
    where: { tenant_id, class_name, section, date },
    include: [{ model: Student, as: "student" }],
    order: [["student_id", "ASC"]]
  });
  return ok(res, rows.map((r) => ({
    id: r.id,
    student_id: r.student_id,
    student: r.student?.full_name,
    class_name: r.class_name,
    section: r.section,
    date: r.date,
    status: r.status
  })));
}

async function updateAttendance(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Attendance.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  if (!(await teacherCanAccessClass(req, row.class_name, row.section))) return forbidden(res, "Not allowed for this class");

  const isTeacher = req.user.role === ROLES.TEACHER;
  if (isTeacher && !(await enforceTeacherAttendancePolicy(req, res, row.date))) return;

  const patch = {};
  if (req.body.status) patch.status = req.body.status;
  if (!isTeacher) {
    if (req.body.class_name) patch.class_name = req.body.class_name;
    if (req.body.section) patch.section = req.body.section;
    if (req.body.date) patch.date = req.body.date;
  }

  await row.update({ ...patch, marked_by: req.user.id });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "ATTENDANCE", entity_id: String(row.id), details: patch });
  return ok(res, row, "Updated");
}

async function deleteAttendance(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Attendance.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  await row.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "ATTENDANCE", entity_id: String(req.params.id) });
  return ok(res, null, "Deleted");
}

async function exportMonthlyCsv(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { class_name, section, month } = req.query;
  if (!class_name || !section || !month) return bad(res, "class_name, section, month required");
  if (!(await teacherCanAccessClass(req, class_name, section))) return forbidden(res, "Not allowed for this class");
  const rows = await attendanceMonthly(class_name, section, month, tenant_id);
  const csv = toCsv(rows, ["student_id","name","present","absent","total","percentage"]);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendance_${class_name}_${section}_${month}.csv"`);
  return res.send(csv);
}

module.exports = { markAttendance, monthlyReport, dailyReport, updateAttendance, deleteAttendance, exportMonthlyCsv };

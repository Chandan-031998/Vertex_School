const { Op } = require("sequelize");
const {
  Student,
  Staff,
  Attendance,
  AttendanceSetting,
  ActivityLog,
  Homework,
  Subject,
  Exam,
  Mark,
  TimetableEntry,
  Timetable,
  MessageLog,
  User
} = require("../models");
const { ok, bad, forbidden } = require("../utils/response");
const { normalizeAssignedClasses } = require("./staff.controller");
const { attendanceMonthly } = require("../services/report.service");
const { toCsv } = require("../utils/csv");
const { hashPassword, verifyPassword } = require("../utils/password");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function buildAssignedWhere(assigned) {
  return assigned.map((a) => ({ class_name: a.class_name, section: a.section }));
}

async function getTeacherStaff(req) {
  const tenant_id = tenantIdFromReq(req);
  return Staff.findOne({ where: { tenant_id, user_id: req.user.id } });
}

async function getAssignedClasses(req) {
  const staff = await getTeacherStaff(req);
  return normalizeAssignedClasses(staff?.assigned_classes || []);
}

function isAssigned(assigned, class_name, section) {
  return assigned.some((a) => a.class_name === String(class_name) && a.section === String(section));
}

async function ensureAttendancePolicy(tenant_id) {
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
}

function isOlderThanWindow(dateStr, allowEditDays) {
  const d = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const today = new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`);
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff > Number(allowEditDays || 0);
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
  const tenant_id = tenantIdFromReq(req);
  const policy = await ensureAttendancePolicy(tenant_id);
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

async function teacherDashboard(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned_classes = await getAssignedClasses(req);
  if (!assigned_classes.length) {
    return ok(res, {
      assigned_classes: [],
      total_students_assigned: 0,
      attendance_today: { present: 0, absent: 0, unmarked: 0 },
      pending_attendance_classes: [],
      quick_links: [
        { key: "attendance", label: "Mark Attendance", to: "/teacher/attendance" },
        { key: "students", label: "View Students", to: "/teacher/students" },
        { key: "reports", label: "Reports", to: "/teacher/reports" }
      ]
    });
  }

  const classWhere = buildAssignedWhere(assigned_classes);
  const students = await Student.findAll({
    where: { tenant_id, is_active: true, [Op.or]: classWhere },
    attributes: ["id", "class_name", "section"]
  });
  const total_students_assigned = students.length;
  const studentIds = students.map((s) => s.id);
  const today = todayYmd();
  const attendanceTodayRows = studentIds.length
    ? await Attendance.findAll({
      where: { tenant_id, date: today, student_id: { [Op.in]: studentIds } },
      attributes: ["student_id", "status", "class_name", "section"]
    })
    : [];

  const present = attendanceTodayRows.filter((a) => a.status === "P").length;
  const absent = attendanceTodayRows.filter((a) => a.status === "A").length;
  const markedStudentIds = new Set(attendanceTodayRows.map((a) => Number(a.student_id)));
  const unmarked = Math.max(total_students_assigned - markedStudentIds.size, 0);

  const classMarkedSet = new Set(attendanceTodayRows.map((a) => `${a.class_name}::${a.section}`));
  const pending_attendance_classes = assigned_classes.filter((c) => !classMarkedSet.has(`${c.class_name}::${c.section}`));

  return ok(res, {
    assigned_classes,
    total_students_assigned,
    attendance_today: { present, absent, unmarked },
    pending_attendance_classes,
    quick_links: [
      { key: "attendance", label: "Mark Attendance", to: "/teacher/attendance" },
      { key: "students", label: "View Students", to: "/teacher/students" },
      { key: "reports", label: "Reports", to: "/teacher/reports" }
    ]
  });
}

async function teacherClasses(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  if (!assigned.length) return ok(res, []);
  const result = await Promise.all(assigned.map(async (a) => {
    const student_count = await Student.count({
      where: { tenant_id, is_active: true, class_name: a.class_name, section: a.section }
    });
    return { ...a, student_count };
  }));
  return ok(res, result);
}

async function teacherStudents(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  if (!assigned.length) return ok(res, []);

  const where = { tenant_id, is_active: true, [Op.or]: buildAssignedWhere(assigned) };
  if (req.query.class_name) where.class_name = String(req.query.class_name);
  if (req.query.section) where.section = String(req.query.section);
  if (req.query.q) {
    const q = `%${String(req.query.q).trim()}%`;
    where[Op.and] = [{
      [Op.or]: [
        { full_name: { [Op.like]: q } },
        { admission_no: { [Op.like]: q } },
        { parent_phone: { [Op.like]: q } },
        { roll_no: { [Op.like]: q.replace(/%/g, "") } }
      ]
    }];
  }
  const rows = await Student.findAll({
    where,
    order: [["class_name", "ASC"], ["section", "ASC"], ["full_name", "ASC"]],
    limit: 500
  });
  return ok(res, rows);
}

async function teacherStudentById(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Student.findOne({ where: { id: req.params.id, tenant_id, is_active: true } });
  if (!row) return bad(res, "Student not found");
  if (!isAssigned(assigned, row.class_name, row.section)) return forbidden(res, "Student is outside your assigned classes");
  return ok(res, row);
}

async function teacherStudentRemarks(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Student.findOne({ where: { id: req.params.id, tenant_id, is_active: true } });
  if (!row) return bad(res, "Student not found");
  if (!isAssigned(assigned, row.class_name, row.section)) return forbidden(res, "Student is outside your assigned classes");
  row.teacher_remarks = req.body.teacher_remarks || null;
  await row.save();
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "UPDATE_REMARKS",
    entity: "STUDENT",
    entity_id: String(row.id)
  });
  return ok(res, row, "Remarks updated");
}

async function teacherAttendanceClassDate(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const class_name = String(req.query.class_name || "");
  const section = String(req.query.section || "");
  const date = String(req.query.date || todayYmd());
  if (!class_name || !section) return bad(res, "class_name and section are required");
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");

  const students = await Student.findAll({
    where: { tenant_id, is_active: true, class_name, section },
    attributes: ["id", "admission_no", "full_name", "roll_no", "parent_phone"],
    order: [["roll_no", "ASC"], ["full_name", "ASC"]]
  });
  const attendanceRows = await Attendance.findAll({
    where: { tenant_id, class_name, section, date, student_id: { [Op.in]: students.map((s) => s.id) } },
    attributes: ["student_id", "status"]
  });
  const statusMap = new Map(attendanceRows.map((a) => [Number(a.student_id), a.status]));
  return ok(res, {
    class_name,
    section,
    date,
    students: students.map((s) => ({ ...s.toJSON(), status: statusMap.get(Number(s.id)) || null }))
  });
}

async function teacherAttendanceMark(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { class_name, section, date, records = [] } = req.body;
  if (!class_name || !section || !date || !Array.isArray(records) || !records.length) return bad(res, "date, class_name, section and records are required");
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
  if (!(await enforceTeacherAttendancePolicy(req, res, String(date)))) return;

  const studentIds = [...new Set(records.map((r) => Number(r.student_id)).filter(Boolean))];
  const students = await Student.findAll({
    where: { tenant_id, is_active: true, class_name, section, id: { [Op.in]: studentIds } },
    attributes: ["id"]
  });
  if (students.length !== studentIds.length) return forbidden(res, "One or more students are outside class/section scope");

  for (const rec of records) {
    await Attendance.upsert({
      tenant_id,
      student_id: Number(rec.student_id),
      class_name,
      section,
      date,
      status: rec.status,
      marked_by: req.user.id
    });
  }
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "MARK",
    entity: "ATTENDANCE",
    entity_id: `${class_name}-${section}-${date}`,
    details: { count: records.length }
  });
  return ok(res, { count: records.length });
}

async function teacherAttendanceReport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { class_name, section, month } = req.query;
  if (!class_name || !section || !month) return bad(res, "class_name, section and month are required");
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
  const rows = await attendanceMonthly(class_name, section, month, tenant_id);
  return ok(res, rows);
}

async function teacherAttendanceExport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { class_name, section, month } = req.query;
  if (!class_name || !section || !month) return bad(res, "class_name, section and month are required");
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
  const rows = await attendanceMonthly(class_name, section, month, tenant_id);
  const csv = toCsv(rows, ["student_id", "name", "present", "absent", "total", "percentage"]);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="teacher_attendance_${class_name}_${section}_${month}.csv"`);
  return res.send(csv);
}

async function listHomework(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  if (!assigned.length) return ok(res, []);
  const where = { tenant_id, created_by: req.user.id, [Op.or]: buildAssignedWhere(assigned) };
  if (req.query.class_name) where.class_name = String(req.query.class_name);
  if (req.query.section) where.section = String(req.query.section);
  const rows = await Homework.findAll({
    where,
    include: [{ model: Subject, as: "subject", attributes: ["id", "subject_name"] }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}

async function createHomework(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { class_name, section, subject_id, title, description, due_date } = req.body;
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
  const attachments_json = (req.files || []).map((f) => ({
    filename: f.filename,
    url: `/uploads/homework/${f.filename}`
  }));
  const row = await Homework.create({
    tenant_id,
    class_name,
    section,
    subject_id: subject_id || null,
    title,
    description: description || null,
    due_date: due_date || null,
    attachments_json,
    created_by: req.user.id
  });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "HOMEWORK", entity_id: String(row.id) });
  return ok(res, row, "Homework created");
}

async function updateHomework(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Homework.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!row) return bad(res, "Homework not found");

  const class_name = req.body.class_name || row.class_name;
  const section = req.body.section || row.section;
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");

  const attachments_json = (req.files || []).map((f) => ({
    filename: f.filename,
    url: `/uploads/homework/${f.filename}`
  }));

  await row.update({
    class_name,
    section,
    subject_id: req.body.subject_id !== undefined ? (req.body.subject_id || null) : row.subject_id,
    title: req.body.title !== undefined ? req.body.title : row.title,
    description: req.body.description !== undefined ? req.body.description : row.description,
    due_date: req.body.due_date !== undefined ? req.body.due_date : row.due_date,
    attachments_json: attachments_json.length ? [...(row.attachments_json || []), ...attachments_json] : row.attachments_json
  });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "HOMEWORK", entity_id: String(row.id) });
  return ok(res, row, "Homework updated");
}

async function deleteHomework(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Homework.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!row) return bad(res, "Homework not found");
  if (!isAssigned(assigned, row.class_name, row.section)) return forbidden(res, "Not allowed for this class");
  await row.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "HOMEWORK", entity_id: String(req.params.id) });
  return ok(res, { deleted: true });
}

async function listExams(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  if (!assigned.length) return ok(res, []);
  const where = { tenant_id, created_by: req.user.id, [Op.or]: buildAssignedWhere(assigned) };
  if (req.query.class_name) where.class_name = String(req.query.class_name);
  if (req.query.section) where.section = String(req.query.section);
  const rows = await Exam.findAll({
    where,
    include: [{ model: Subject, as: "subject", attributes: ["id", "subject_name"] }],
    order: [["exam_date", "DESC"], ["created_at", "DESC"]]
  });
  return ok(res, rows);
}

async function createExam(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { class_name, section, subject_id, exam_name, exam_date, max_marks } = req.body;
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
  const row = await Exam.create({
    tenant_id,
    class_name,
    section,
    subject_id,
    exam_name,
    exam_date,
    max_marks,
    created_by: req.user.id
  });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "EXAM", entity_id: String(row.id) });
  return ok(res, row, "Exam created");
}

async function updateExam(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Exam.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!row) return bad(res, "Exam not found");
  const class_name = req.body.class_name || row.class_name;
  const section = req.body.section || row.section;
  if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");

  await row.update({
    class_name,
    section,
    subject_id: req.body.subject_id !== undefined ? req.body.subject_id : row.subject_id,
    exam_name: req.body.exam_name !== undefined ? req.body.exam_name : row.exam_name,
    exam_date: req.body.exam_date !== undefined ? req.body.exam_date : row.exam_date,
    max_marks: req.body.max_marks !== undefined ? req.body.max_marks : row.max_marks
  });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "EXAM", entity_id: String(row.id) });
  return ok(res, row, "Exam updated");
}

async function deleteExam(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const row = await Exam.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!row) return bad(res, "Exam not found");
  if (!isAssigned(assigned, row.class_name, row.section)) return forbidden(res, "Not allowed for this class");
  await row.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "EXAM", entity_id: String(req.params.id) });
  return ok(res, { deleted: true });
}

async function getExamMarks(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const exam = await Exam.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!exam) return bad(res, "Exam not found");
  if (!isAssigned(assigned, exam.class_name, exam.section)) return forbidden(res, "Not allowed for this class");

  const students = await Student.findAll({
    where: { tenant_id, is_active: true, class_name: exam.class_name, section: exam.section },
    attributes: ["id", "admission_no", "full_name", "roll_no"],
    order: [["roll_no", "ASC"], ["full_name", "ASC"]]
  });
  const marks = await Mark.findAll({
    where: { tenant_id, exam_id: exam.id, student_id: { [Op.in]: students.map((s) => s.id) } },
    attributes: ["student_id", "marks_obtained", "remarks"]
  });
  const markMap = new Map(marks.map((m) => [Number(m.student_id), m]));
  return ok(res, {
    exam,
    students: students.map((s) => ({
      ...s.toJSON(),
      marks_obtained: markMap.get(Number(s.id))?.marks_obtained ?? null,
      remarks: markMap.get(Number(s.id))?.remarks ?? null
    }))
  });
}

async function upsertExamMarks(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const exam = await Exam.findOne({ where: { id: req.params.id, tenant_id, created_by: req.user.id } });
  if (!exam) return bad(res, "Exam not found");
  if (!isAssigned(assigned, exam.class_name, exam.section)) return forbidden(res, "Not allowed for this class");
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  if (!records.length) return bad(res, "records is required");

  const studentIds = [...new Set(records.map((r) => Number(r.student_id)).filter(Boolean))];
  const students = await Student.findAll({
    where: {
      tenant_id,
      is_active: true,
      class_name: exam.class_name,
      section: exam.section,
      id: { [Op.in]: studentIds }
    },
    attributes: ["id"]
  });
  if (students.length !== studentIds.length) return forbidden(res, "One or more students are outside class scope");

  for (const rec of records) {
    const marks_obtained = Number(rec.marks_obtained);
    if (Number.isNaN(marks_obtained) || marks_obtained < 0) return bad(res, "Invalid marks_obtained");
    if (marks_obtained > Number(exam.max_marks)) return bad(res, "marks_obtained cannot exceed max_marks");
    await Mark.upsert({
      tenant_id,
      exam_id: exam.id,
      student_id: Number(rec.student_id),
      marks_obtained,
      remarks: rec.remarks || null
    });
  }
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "UPSERT",
    entity: "MARKS",
    entity_id: String(exam.id),
    details: { count: records.length }
  });
  return ok(res, { count: records.length });
}

async function teacherTimetable(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned_classes = await getAssignedClasses(req);
  if (!assigned_classes.length) return ok(res, { assigned_classes: [], timetable_entries: [], timetables: [] });

  const classPairs = buildAssignedWhere(assigned_classes);
  const timetable_entries = await TimetableEntry.findAll({
    where: { tenant_id, [Op.or]: classPairs },
    order: [["class_id", "ASC"], ["section_id", "ASC"], ["day_of_week", "ASC"], ["period_no", "ASC"]]
  });

  const timetablesRaw = await Timetable.findAll({ where: { tenant_id }, order: [["updated_at", "DESC"]], limit: 50 });
  const timetables = timetablesRaw.filter((t) => {
    const data = t.timetable_json || {};
    if (!data.class_name || !data.section) return false;
    return isAssigned(assigned_classes, data.class_name, data.section);
  });

  return ok(res, { assigned_classes, timetable_entries, timetables });
}

async function sendTeacherMessage(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const { student_id, class_name, section, channel, message } = req.body;

  if (!channel || !message) return bad(res, "channel and message are required");

  const targets = [];
  if (student_id) {
    const student = await Student.findOne({ where: { id: student_id, tenant_id, is_active: true } });
    if (!student) return bad(res, "Student not found");
    if (!isAssigned(assigned, student.class_name, student.section)) return forbidden(res, "Student is outside your assigned classes");
    targets.push(student);
  } else {
    if (!class_name || !section) return bad(res, "Provide student_id OR class_name + section");
    if (!isAssigned(assigned, class_name, section)) return forbidden(res, "Not allowed for this class");
    const rows = await Student.findAll({ where: { tenant_id, is_active: true, class_name, section } });
    targets.push(...rows);
  }

  for (const student of targets) {
    await MessageLog.create({
      tenant_id,
      student_id: student.id,
      class_name: student.class_name,
      section: student.section,
      channel,
      message,
      sent_by: req.user.id
    });
  }
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "SEND",
    entity: "MESSAGE",
    entity_id: student_id ? String(student_id) : `${class_name}-${section}`,
    details: { channel, count: targets.length }
  });
  return ok(res, { count: targets.length }, "Message queued");
}

async function teacherMessageHistory(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const assigned = await getAssignedClasses(req);
  const where = { tenant_id, sent_by: req.user.id };
  if (req.query.student_id) where.student_id = Number(req.query.student_id);
  if (req.query.class_name && req.query.section) {
    if (!isAssigned(assigned, req.query.class_name, req.query.section)) return forbidden(res, "Not allowed for this class");
    where.class_name = req.query.class_name;
    where.section = req.query.section;
  }
  const rows = await MessageLog.findAll({
    where,
    include: [{ model: Student, as: "student", attributes: ["id", "full_name", "parent_phone"] }],
    order: [["created_at", "DESC"]],
    limit: 200
  });
  return ok(res, rows);
}

async function teacherProfile(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const staff = await Staff.findOne({ where: { tenant_id, user_id: req.user.id } });
  const user = await User.findOne({ where: { tenant_id, id: req.user.id }, attributes: ["id", "email", "full_name"] });
  return ok(res, {
    user,
    staff: {
      phone: staff?.phone || null,
      address: staff?.address || null,
      photo_url: staff?.photo_url || null,
      designation: staff?.designation || null
    }
  });
}

async function updateTeacherProfile(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const [staff] = await Staff.findOrCreate({
    where: { tenant_id, user_id: req.user.id },
    defaults: { tenant_id, user_id: req.user.id, employee_code: `EMP-${Date.now()}` }
  });
  const patch = {};
  if (req.body.phone !== undefined) patch.phone = req.body.phone || null;
  if (req.body.address !== undefined) patch.address = req.body.address || null;
  if (req.body.photo_url !== undefined) patch.photo_url = req.body.photo_url || null;
  await staff.update(patch);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "TEACHER_PROFILE", entity_id: String(staff.id), details: patch });
  return ok(res, staff, "Profile updated");
}

async function changeTeacherPassword(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return bad(res, "current_password and new_password are required");
  const user = await User.findOne({ where: { tenant_id, id: req.user.id } });
  if (!user) return bad(res, "User not found");
  const valid = await verifyPassword(current_password, user.password_hash);
  if (!valid) return forbidden(res, "Current password is incorrect");
  user.password_hash = await hashPassword(new_password);
  await user.save();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CHANGE_PASSWORD", entity: "USER", entity_id: String(user.id) });
  return ok(res, { changed: true }, "Password changed");
}

module.exports = {
  teacherDashboard,
  teacherClasses,
  teacherStudents,
  teacherStudentById,
  teacherStudentRemarks,
  teacherAttendanceClassDate,
  teacherAttendanceMark,
  teacherAttendanceReport,
  teacherAttendanceExport,
  listHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  listExams,
  createExam,
  updateExam,
  deleteExam,
  getExamMarks,
  upsertExamMarks,
  teacherTimetable,
  sendTeacherMessage,
  teacherMessageHistory,
  teacherProfile,
  updateTeacherProfile,
  changeTeacherPassword
};

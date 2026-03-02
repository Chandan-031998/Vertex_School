const { Op } = require("sequelize");
const {
  sequelize,
  AcademicYear,
  SchoolClass,
  Section,
  Subject,
  Holiday,
  FeeSetting,
  AttendanceSetting,
  SecuritySetting,
  RolePermission,
  NotificationTemplate,
  Integration,
  Subscription,
  ActivityLog,
  TimetableEntry,
  Role
} = require("../models");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, message, status = 400, details) {
  return res.status(status).json({ ok: false, message, details });
}

function sanitizeString(v) {
  return String(v || "").trim();
}

function parseMonthRange(month) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const toYmd = (d) => d.toISOString().slice(0, 10);
  return { start: toYmd(start), end: toYmd(end) };
}

function isCutoffPassed(cutoff) {
  if (!cutoff) return false;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}` > String(cutoff);
}

function daysOld(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const t = new Date();
  const today = new Date(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}T00:00:00`);
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

async function ensureFeeSetting(tenant_id) {
  const [row] = await FeeSetting.findOrCreate({
    where: { tenant_id },
    defaults: {
      tenant_id,
      currency: "INR",
      receipt_prefix: "VSM-REC",
      invoice_prefix: "VSM-INV",
      late_fee_enabled: false,
      late_fee_type: "FIXED",
      late_fee_value: 0,
      grace_days: 0,
      payment_methods_json: ["CASH", "ONLINE", "UPI"]
    }
  });
  return row;
}

async function ensureAttendanceSetting(tenant_id) {
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

async function ensureSecuritySetting(tenant_id) {
  const [row] = await SecuritySetting.findOrCreate({
    where: { tenant_id },
    defaults: {
      tenant_id,
      password_min_length: 8,
      password_require_upper: true,
      password_require_number: true,
      password_require_symbol: false,
      session_timeout_minutes: 120,
      enable_2fa: false
    }
  });
  return row;
}

async function listAcademicYears(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await AcademicYear.findAll({ where: { tenant_id }, order: [["start_date", "DESC"]] });
  return ok(res, rows);
}

async function createAcademicYear(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const payload = {
    tenant_id,
    name: sanitizeString(req.body.name),
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    is_active: !!req.body.is_active
  };

  if (!payload.name) return fail(res, "name is required");
  if (payload.end_date < payload.start_date) return fail(res, "end_date must be >= start_date");

  const tx = await sequelize.transaction();
  try {
    if (payload.is_active) {
      await AcademicYear.update({ is_active: false }, { where: { tenant_id, is_active: true }, transaction: tx });
    }
    const row = await AcademicYear.create(payload, { transaction: tx });
    await tx.commit();
    return ok(res, row);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to create academic year", 400, err.message);
  }
}

async function updateAcademicYear(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await AcademicYear.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Academic year not found", 404);

  const patch = {};
  if (req.body.name !== undefined) patch.name = sanitizeString(req.body.name);
  if (req.body.start_date !== undefined) patch.start_date = req.body.start_date;
  if (req.body.end_date !== undefined) patch.end_date = req.body.end_date;
  if (req.body.is_active !== undefined) patch.is_active = !!req.body.is_active;

  const nextStart = patch.start_date || row.start_date;
  const nextEnd = patch.end_date || row.end_date;
  if (nextEnd < nextStart) return fail(res, "end_date must be >= start_date");

  const tx = await sequelize.transaction();
  try {
    if (patch.is_active) {
      await AcademicYear.update({ is_active: false }, { where: { tenant_id, is_active: true }, transaction: tx });
    }
    await row.update(patch, { transaction: tx });
    await tx.commit();
    return ok(res, row);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to update academic year", 400, err.message);
  }
}

async function deleteAcademicYear(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await AcademicYear.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Academic year not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function activateAcademicYear(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await AcademicYear.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Academic year not found", 404);

  const tx = await sequelize.transaction();
  try {
    await AcademicYear.update({ is_active: false }, { where: { tenant_id, is_active: true }, transaction: tx });
    await row.update({ is_active: true }, { transaction: tx });
    await tx.commit();
    return ok(res, row);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to activate academic year", 400, err.message);
  }
}

async function listClasses(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await SchoolClass.findAll({
    where: { tenant_id },
    include: [{ model: Section, as: "sections" }],
    order: [["class_name", "ASC"], [{ model: Section, as: "sections" }, "section_name", "ASC"]]
  });
  return ok(res, rows);
}

async function createClass(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const class_name = sanitizeString(req.body.class_name);
  const sections = Array.isArray(req.body.sections) ? req.body.sections : [];
  if (!class_name) return fail(res, "class_name is required");

  const tx = await sequelize.transaction();
  try {
    const row = await SchoolClass.create({ tenant_id, class_name }, { transaction: tx });
    const cleanSections = [...new Set(sections.map(sanitizeString).filter(Boolean))];
    if (cleanSections.length) {
      await Section.bulkCreate(cleanSections.map((section_name) => ({ tenant_id, class_id: row.id, section_name })), { transaction: tx });
    }
    await tx.commit();
    const out = await SchoolClass.findByPk(row.id, { include: [{ model: Section, as: "sections" }] });
    return ok(res, out);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to create class", 400, err.message);
  }
}

async function updateClass(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await SchoolClass.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Class not found", 404);

  const tx = await sequelize.transaction();
  try {
    if (req.body.class_name !== undefined) {
      const class_name = sanitizeString(req.body.class_name);
      if (!class_name) return fail(res, "class_name cannot be empty");
      await row.update({ class_name }, { transaction: tx });
    }

    if (req.body.sections !== undefined) {
      if (!Array.isArray(req.body.sections)) return fail(res, "sections must be an array");
      const cleanSections = [...new Set(req.body.sections.map(sanitizeString).filter(Boolean))];
      await Section.destroy({ where: { tenant_id, class_id: row.id }, transaction: tx });
      if (cleanSections.length) {
        await Section.bulkCreate(cleanSections.map((section_name) => ({ tenant_id, class_id: row.id, section_name })), { transaction: tx });
      }
    }

    await tx.commit();
    const out = await SchoolClass.findByPk(row.id, { include: [{ model: Section, as: "sections" }] });
    return ok(res, out);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to update class", 400, err.message);
  }
}

async function deleteClass(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await SchoolClass.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Class not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function addSection(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const classRow = await SchoolClass.findOne({ where: { id: req.params.id, tenant_id } });
  if (!classRow) return fail(res, "Class not found", 404);
  const section_name = sanitizeString(req.body.section_name);
  if (!section_name) return fail(res, "section_name is required");

  try {
    const row = await Section.create({ tenant_id, class_id: classRow.id, section_name });
    return ok(res, row);
  } catch (err) {
    return fail(res, "Failed to add section", 400, err.message);
  }
}

async function deleteSection(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Section.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Section not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function listSubjects(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id };
  if (req.query.class_id) where.class_id = Number(req.query.class_id);
  const rows = await Subject.findAll({ where, include: [{ model: SchoolClass, as: "class" }], order: [["subject_name", "ASC"]] });
  return ok(res, rows);
}

async function createSubject(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const class_id = Number(req.body.class_id);
  const subject_name = sanitizeString(req.body.subject_name);
  if (!class_id) return fail(res, "class_id is required");
  if (!subject_name) return fail(res, "subject_name is required");

  const classRow = await SchoolClass.findOne({ where: { id: class_id, tenant_id } });
  if (!classRow) return fail(res, "Invalid class_id", 400);

  const row = await Subject.create({ tenant_id, class_id, subject_name });
  return ok(res, row);
}

async function updateSubject(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Subject.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Subject not found", 404);

  const patch = {};
  if (req.body.class_id !== undefined) {
    const class_id = Number(req.body.class_id);
    if (!class_id) return fail(res, "class_id must be a number");
    const classRow = await SchoolClass.findOne({ where: { id: class_id, tenant_id } });
    if (!classRow) return fail(res, "Invalid class_id", 400);
    patch.class_id = class_id;
  }
  if (req.body.subject_name !== undefined) {
    const subject_name = sanitizeString(req.body.subject_name);
    if (!subject_name) return fail(res, "subject_name cannot be empty");
    patch.subject_name = subject_name;
  }

  await row.update(patch);
  return ok(res, row);
}

async function deleteSubject(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Subject.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Subject not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function listHolidays(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id };
  if (req.query.month) {
    const month = String(req.query.month || "");
    if (!/^\d{4}-\d{2}$/.test(month)) return fail(res, "month must be YYYY-MM");
    const { start, end } = parseMonthRange(month);
    where.date = { [Op.between]: [start, end] };
  }
  const rows = await Holiday.findAll({ where, order: [["date", "ASC"], ["title", "ASC"]] });
  return ok(res, rows);
}

async function createHoliday(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Holiday.create({
    tenant_id,
    title: sanitizeString(req.body.title),
    date: req.body.date,
    type: req.body.type
  });
  return ok(res, row);
}

async function updateHoliday(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Holiday.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Holiday not found", 404);

  const patch = {};
  if (req.body.title !== undefined) patch.title = sanitizeString(req.body.title);
  if (req.body.date !== undefined) patch.date = req.body.date;
  if (req.body.type !== undefined) patch.type = req.body.type;
  await row.update(patch);
  return ok(res, row);
}

async function deleteHoliday(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Holiday.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Holiday not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function getFeeSettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureFeeSetting(tenant_id);
  return ok(res, row);
}

async function updateFeeSettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureFeeSetting(tenant_id);

  const patch = {};
  const body = req.body || {};
  if (body.currency !== undefined) patch.currency = sanitizeString(body.currency) || "INR";
  if (body.receipt_prefix !== undefined) patch.receipt_prefix = sanitizeString(body.receipt_prefix);
  if (body.invoice_prefix !== undefined) patch.invoice_prefix = sanitizeString(body.invoice_prefix);
  if (body.late_fee_enabled !== undefined) patch.late_fee_enabled = !!body.late_fee_enabled;
  if (body.late_fee_type !== undefined) patch.late_fee_type = body.late_fee_type;
  if (body.late_fee_value !== undefined) patch.late_fee_value = Number(body.late_fee_value);
  if (body.grace_days !== undefined) patch.grace_days = Number(body.grace_days);
  if (body.payment_methods_json !== undefined) patch.payment_methods_json = body.payment_methods_json;

  await row.update(patch);
  return ok(res, row);
}

async function getAttendanceSettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureAttendanceSetting(tenant_id);
  return ok(res, row);
}

async function updateAttendanceSettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureAttendanceSetting(tenant_id);

  const patch = {};
  const body = req.body || {};
  if (body.mode !== undefined) patch.mode = body.mode;
  if (body.cutoff_time !== undefined) patch.cutoff_time = body.cutoff_time;
  if (body.allow_edit_days !== undefined) patch.allow_edit_days = Number(body.allow_edit_days);
  if (body.auto_absent_after_cutoff !== undefined) patch.auto_absent_after_cutoff = !!body.auto_absent_after_cutoff;
  if (body.leave_types_json !== undefined) patch.leave_types_json = body.leave_types_json;

  await row.update(patch);
  return ok(res, row);
}

async function getSecuritySettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureSecuritySetting(tenant_id);
  return ok(res, row);
}

async function updateSecuritySettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureSecuritySetting(tenant_id);

  const patch = {};
  const body = req.body || {};
  if (body.password_min_length !== undefined) patch.password_min_length = Number(body.password_min_length);
  if (body.password_require_upper !== undefined) patch.password_require_upper = !!body.password_require_upper;
  if (body.password_require_number !== undefined) patch.password_require_number = !!body.password_require_number;
  if (body.password_require_symbol !== undefined) patch.password_require_symbol = !!body.password_require_symbol;
  if (body.session_timeout_minutes !== undefined) patch.session_timeout_minutes = Number(body.session_timeout_minutes);
  if (body.enable_2fa !== undefined) patch.enable_2fa = !!body.enable_2fa;

  await row.update(patch);
  return ok(res, row);
}

async function listRolePermissions(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await RolePermission.findAll({ where: { tenant_id }, order: [["role_name", "ASC"], ["resource", "ASC"]] });
  return ok(res, rows);
}

async function listRolesCatalog(req, res) {
  const rows = await Role.findAll({ attributes: ["name"], order: [["name", "ASC"]] });
  return ok(res, rows.map((r) => r.name));
}

async function upsertRolePermissions(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const role = String(req.params.role || "").trim().toUpperCase();
  if (!role) return fail(res, "role is required");

  const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions : [];
  if (!permissions.length) return fail(res, "permissions array is required");

  const tx = await sequelize.transaction();
  try {
    await RolePermission.destroy({ where: { tenant_id, role_name: role }, transaction: tx });
    await RolePermission.bulkCreate(permissions.map((p) => ({
      tenant_id,
      role_name: role,
      resource: sanitizeString(p.resource),
      can_create: !!p.can_create,
      can_read: p.can_read === undefined ? true : !!p.can_read,
      can_update: !!p.can_update,
      can_delete: !!p.can_delete
    })), { transaction: tx });
    await tx.commit();
    const rows = await RolePermission.findAll({ where: { tenant_id, role_name: role }, order: [["resource", "ASC"]] });
    return ok(res, rows);
  } catch (err) {
    await tx.rollback();
    return fail(res, "Failed to update role permissions", 400, err.message);
  }
}

async function listNotificationTemplates(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await NotificationTemplate.findAll({ where: { tenant_id }, order: [["key", "ASC"], ["channel", "ASC"]] });
  return ok(res, rows);
}

async function createNotificationTemplate(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await NotificationTemplate.create({
    tenant_id,
    key: sanitizeString(req.body.key).toUpperCase(),
    subject: req.body.subject || null,
    body: req.body.body,
    channel: req.body.channel,
    language: sanitizeString(req.body.language || "en")
  });
  return ok(res, row);
}

async function updateNotificationTemplate(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await NotificationTemplate.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Notification template not found", 404);
  const patch = {};
  if (req.body.key !== undefined) patch.key = sanitizeString(req.body.key).toUpperCase();
  if (req.body.subject !== undefined) patch.subject = req.body.subject || null;
  if (req.body.body !== undefined) patch.body = req.body.body;
  if (req.body.channel !== undefined) patch.channel = req.body.channel;
  if (req.body.language !== undefined) patch.language = sanitizeString(req.body.language || "en");
  await row.update(patch);
  return ok(res, row);
}

async function deleteNotificationTemplate(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await NotificationTemplate.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Notification template not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function listIntegrations(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await Integration.findAll({ where: { tenant_id }, order: [["type", "ASC"]] });
  return ok(res, rows);
}

async function createIntegration(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Integration.create({
    tenant_id,
    type: String(req.body.type || "").toLowerCase(),
    config_json: req.body.config_json || {}
  });
  return ok(res, row);
}

async function updateIntegration(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Integration.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Integration not found", 404);
  const patch = {};
  if (req.body.type !== undefined) patch.type = String(req.body.type || "").toLowerCase();
  if (req.body.config_json !== undefined) patch.config_json = req.body.config_json || {};
  await row.update(patch);
  return ok(res, row);
}

async function deleteIntegration(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Integration.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Integration not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

async function getAuditLogs(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const limit = Math.min(Number(req.query.limit || 200), 500);
  const rows = await ActivityLog.findAll({ where: { tenant_id }, order: [["created_at", "DESC"]], limit });
  return ok(res, rows);
}

async function ensureSubscription(tenant_id) {
  const [row] = await Subscription.findOrCreate({
    where: { tenant_id },
    defaults: {
      tenant_id,
      plan: "BASIC",
      status: "ACTIVE",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      limits_json: {}
    }
  });
  return row;
}

async function getSubscription(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureSubscription(tenant_id);
  return ok(res, row);
}

async function updateSubscription(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await ensureSubscription(tenant_id);
  const patch = {};
  if (req.body.plan !== undefined) patch.plan = req.body.plan;
  if (req.body.status !== undefined) patch.status = req.body.status;
  if (req.body.start_date !== undefined) patch.start_date = req.body.start_date;
  if (req.body.end_date !== undefined) patch.end_date = req.body.end_date;
  if (req.body.limits_json !== undefined) patch.limits_json = req.body.limits_json || {};
  await row.update(patch);
  return ok(res, row);
}

async function listTimetables(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id };
  if (req.query.class_id) where.class_id = Number(req.query.class_id);
  if (req.query.section_id) where.section_id = Number(req.query.section_id);
  const rows = await TimetableEntry.findAll({
    where,
    include: [{ model: SchoolClass, as: "class" }, { model: Section, as: "section" }],
    order: [["class_id", "ASC"], ["section_id", "ASC"], ["day_of_week", "ASC"], ["period_no", "ASC"]]
  });
  return ok(res, rows);
}

async function createTimetable(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const class_id = Number(req.body.class_id);
  const section_id = Number(req.body.section_id);
  const classRow = await SchoolClass.findOne({ where: { id: class_id, tenant_id } });
  if (!classRow) return fail(res, "Invalid class_id", 400);
  const sectionRow = await Section.findOne({ where: { id: section_id, class_id, tenant_id } });
  if (!sectionRow) return fail(res, "Invalid section_id for class", 400);
  const row = await TimetableEntry.create({
    tenant_id,
    class_id,
    section_id,
    day_of_week: req.body.day_of_week,
    period_no: Number(req.body.period_no),
    subject_name: sanitizeString(req.body.subject_name),
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    teacher_name: req.body.teacher_name || null,
    room_no: req.body.room_no || null
  });
  return ok(res, row);
}

async function updateTimetable(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TimetableEntry.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Timetable entry not found", 404);

  const nextClassId = req.body.class_id !== undefined ? Number(req.body.class_id) : row.class_id;
  const nextSectionId = req.body.section_id !== undefined ? Number(req.body.section_id) : row.section_id;
  const classRow = await SchoolClass.findOne({ where: { id: nextClassId, tenant_id } });
  if (!classRow) return fail(res, "Invalid class_id", 400);
  const sectionRow = await Section.findOne({ where: { id: nextSectionId, class_id: nextClassId, tenant_id } });
  if (!sectionRow) return fail(res, "Invalid section_id for class", 400);

  const patch = {};
  if (req.body.class_id !== undefined) patch.class_id = nextClassId;
  if (req.body.section_id !== undefined) patch.section_id = nextSectionId;
  if (req.body.day_of_week !== undefined) patch.day_of_week = req.body.day_of_week;
  if (req.body.period_no !== undefined) patch.period_no = Number(req.body.period_no);
  if (req.body.subject_name !== undefined) patch.subject_name = sanitizeString(req.body.subject_name);
  if (req.body.start_time !== undefined) patch.start_time = req.body.start_time;
  if (req.body.end_time !== undefined) patch.end_time = req.body.end_time;
  if (req.body.teacher_name !== undefined) patch.teacher_name = req.body.teacher_name || null;
  if (req.body.room_no !== undefined) patch.room_no = req.body.room_no || null;
  await row.update(patch);
  return ok(res, row);
}

async function deleteTimetable(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TimetableEntry.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return fail(res, "Timetable entry not found", 404);
  await row.destroy();
  return ok(res, { deleted: true });
}

module.exports = {
  listAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  activateAcademicYear,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  addSection,
  deleteSection,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  listHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getFeeSettings,
  updateFeeSettings,
  getAttendanceSettings,
  updateAttendanceSettings,
  getSecuritySettings,
  updateSecuritySettings,
  listRolePermissions,
  listRolesCatalog,
  upsertRolePermissions,
  listNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  listIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  getAuditLogs,
  getSubscription,
  updateSubscription,
  listTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  tenantIdFromReq,
  ensureFeeSetting,
  ensureAttendanceSetting,
  ensureSecuritySetting,
  isCutoffPassed,
  daysOld
};

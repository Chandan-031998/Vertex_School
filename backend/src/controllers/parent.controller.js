const { Op } = require("sequelize");
const {
  ParentProfile,
  ParentStudent,
  Student,
  Attendance,
  FeeInvoice,
  Payment,
  StudentTransport,
  TransportRoute,
  RouteStop,
  Vehicle,
  VehicleAssignment,
  Driver,
  Notification,
  TransportRequest,
  ActivityLog
} = require("../models");
const { ok, bad, forbidden } = require("../utils/response");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function getMappedStudentIds(tenant_id, parent_user_id) {
  const rows = await ParentStudent.findAll({ where: { tenant_id, parent_user_id }, attributes: ["student_id"] });
  return rows.map((r) => Number(r.student_id));
}

async function parentMe(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const [profile] = await ParentProfile.findOrCreate({
    where: { tenant_id, user_id: req.user.id },
    defaults: { tenant_id, user_id: req.user.id }
  });
  return ok(res, {
    user: { id: req.user.id, email: req.user.email, full_name: req.user.full_name, role: req.user.role },
    profile
  });
}

async function parentChildren(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  if (!ids.length) return ok(res, []);
  const rows = await Student.findAll({ where: { tenant_id, id: { [Op.in]: ids } }, order: [["full_name", "ASC"]] });
  return ok(res, rows);
}

async function parentDashboard(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  if (!ids.length) {
    return ok(res, {
      children_count: 0,
      attendance_today: { present: 0, absent: 0, unmarked: 0 },
      fees_dues: { pending_total: 0 },
      transport: { enabled: false, active_allocations: 0 },
      latest_notifications: []
    });
  }
  const today = new Date().toISOString().slice(0, 10);
  const attendanceRows = await Attendance.findAll({
    where: { tenant_id, student_id: { [Op.in]: ids }, date: today },
    attributes: ["student_id", "status"]
  });
  const present = attendanceRows.filter((r) => r.status === "P").length;
  const absent = attendanceRows.filter((r) => r.status === "A").length;
  const marked = new Set(attendanceRows.map((r) => Number(r.student_id)));
  const unmarked = Math.max(ids.length - marked.size, 0);

  const invoices = await FeeInvoice.findAll({
    where: { tenant_id, student_id: { [Op.in]: ids } },
    include: [{ model: Payment, as: "payments" }]
  });
  let pending_total = 0;
  for (const inv of invoices) {
    const paid = (inv.payments || []).reduce((s, p) => s + Number(p.amount_paid || 0), 0);
    const due = Number(inv.total_amount || 0) - paid;
    if (due > 0) pending_total += due;
  }

  const allocations = await StudentTransport.findAll({ where: { tenant_id, student_id: { [Op.in]: ids }, status: "ACTIVE" } });
  const latest_notifications = await Notification.findAll({
    where: { tenant_id, student_id: { [Op.in]: ids } },
    order: [["created_at", "DESC"]],
    limit: 10
  });

  return ok(res, {
    children_count: ids.length,
    attendance_today: { present, absent, unmarked },
    fees_dues: { pending_total },
    transport: { enabled: true, active_allocations: allocations.length },
    latest_notifications
  });
}

async function parentAttendance(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  const student_id = Number(req.query.student_id);
  if (!ids.includes(student_id)) return forbidden(res, "Not allowed for this student");
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  if (!month || !year) return bad(res, "month and year are required");
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = `${year}-${String(month).padStart(2, "0")}-31`;
  const rows = await Attendance.findAll({
    where: { tenant_id, student_id, date: { [Op.between]: [from, to] } },
    order: [["date", "ASC"]]
  });
  const present = rows.filter((r) => r.status === "P").length;
  const absent = rows.filter((r) => r.status === "A").length;
  const total = rows.length;
  const percentage = total ? (present / total) * 100 : 0;
  return ok(res, { present, absent, total, percentage, rows });
}

async function parentFees(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  const student_id = Number(req.query.student_id);
  if (!ids.includes(student_id)) return forbidden(res, "Not allowed for this student");
  const where = { tenant_id, student_id };
  if (req.query.month && req.query.year) {
    where.billing_month = `${req.query.year}-${String(req.query.month).padStart(2, "0")}`;
  }
  const rows = await FeeInvoice.findAll({
    where,
    include: [{ model: Payment, as: "payments" }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows.map((r) => {
    const paid = (r.payments || []).reduce((s, p) => s + Number(p.amount_paid || 0), 0);
    return { ...r.toJSON(), paid_amount: paid, due_amount: Number(r.total_amount) - paid };
  }));
}

async function parentTransport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const studentId = Number(req.query.student_id);
  if (!studentId) return bad(res, "student_id is required");
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  if (!ids.includes(studentId)) return forbidden(res, "Not allowed for this student");

  const alloc = await StudentTransport.findOne({
    where: { tenant_id, student_id: studentId, status: { [Op.ne]: "CANCELLED" } },
    include: [
      { model: TransportRoute, as: "route" },
      { model: RouteStop, as: "stop" },
      { model: Vehicle, as: "vehicle" }
    ]
  });
  if (!alloc) return ok(res, { enabled: false });

  const assignment = await VehicleAssignment.findOne({
    where: { tenant_id, vehicle_id: alloc.vehicle_id, route_id: alloc.route_id, active: true },
    include: [{ model: Driver, as: "driver" }, { model: Driver, as: "attendant" }]
  });

  return ok(res, { enabled: true, allocation: alloc, assignment });
}

async function parentNotifications(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  if (!ids.length) return ok(res, []);
  const rows = await Notification.findAll({
    where: { tenant_id, student_id: { [Op.in]: ids } },
    order: [["created_at", "DESC"]],
    limit: 200
  });
  return ok(res, rows);
}

async function createParentRequest(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const ids = await getMappedStudentIds(tenant_id, req.user.id);
  const student_id = Number(req.body.student_id);
  if (!ids.includes(student_id)) return forbidden(res, "Not allowed for this student");

  const row = await TransportRequest.create({
    tenant_id,
    parent_user_id: req.user.id,
    student_id,
    request_type: req.body.request_type,
    payload_json: req.body.payload_json || {},
    status: "PENDING"
  });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "TRANSPORT_REQUEST", entity_id: String(row.id) });
  return ok(res, row);
}

async function parentRequests(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await TransportRequest.findAll({
    where: { tenant_id, parent_user_id: req.user.id },
    include: [{ model: Student, as: "student", attributes: ["id", "full_name", "class_name", "section"] }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}

async function updateParentSettings(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const [profile] = await ParentProfile.findOrCreate({
    where: { tenant_id, user_id: req.user.id },
    defaults: { tenant_id, user_id: req.user.id }
  });
  const patch = {};
  if (req.body.phone !== undefined) patch.phone = req.body.phone || null;
  if (req.body.address !== undefined) patch.address = req.body.address || null;
  if (req.body.preferred_language !== undefined) patch.preferred_language = req.body.preferred_language || "en";
  if (req.body.notification_preferences_json !== undefined) patch.notification_preferences_json = req.body.notification_preferences_json || {};
  await profile.update(patch);
  await ActivityLog.create({
    tenant_id,
    user_id: req.user.id,
    action: "UPDATE",
    entity: "PARENT_SETTINGS",
    entity_id: String(profile.id),
    details: patch
  });
  return ok(res, profile, "Settings updated");
}

module.exports = {
  parentMe,
  parentChildren,
  parentDashboard,
  parentAttendance,
  parentFees,
  parentTransport,
  parentNotifications,
  createParentRequest,
  parentRequests,
  updateParentSettings
};

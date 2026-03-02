const { Op, fn, col, literal } = require("sequelize");
const { Student, Staff, FeeInvoice, Payment, Attendance, User } = require("../models");
const { ok } = require("../utils/response");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function adminDashboard(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const totalStudents = await Student.count({ where: { tenant_id, is_active: true } });
  const totalStaff = await Staff.count({ where: { tenant_id } });
  const month = new Date().toISOString().slice(0,7); // YYYY-MM

  const invoices = await FeeInvoice.findAll({ where: { tenant_id, billing_month: month }, include: [{ model: Payment, as: "payments" }] });
  let collected = 0, billed = 0, pending = 0;
  for (const inv of invoices) {
    billed += Number(inv.total_amount);
    const paid = inv.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
    collected += paid;
    const due = Number(inv.total_amount) - paid;
    pending += due > 0 ? due : 0;
  }

  // Attendance overview last 7 days
  const since = new Date(Date.now() - 7*24*3600*1000);
  const att = await Attendance.findAll({
    attributes: ["date", [fn("SUM", literal("status='P'")), "present"], [fn("COUNT", col("id")), "total"]],
    where: { tenant_id, date: { [Op.gte]: since } },
    group: ["date"],
    order: [["date","ASC"]]
  });

  const today = new Date().toISOString().slice(0, 10);
  const byClassTeacherRaw = await Attendance.findAll({
    attributes: [
      "class_name",
      "section",
      "marked_by",
      [fn("COUNT", col("id")), "taken_count"]
    ],
    where: { tenant_id, date: today },
    group: ["class_name", "section", "marked_by"],
    order: [["class_name", "ASC"], ["section", "ASC"]]
  });

  const markerIds = Array.from(new Set(byClassTeacherRaw.map((r) => Number(r.marked_by)).filter(Boolean)));
  const users = markerIds.length
    ? await User.findAll({ where: { tenant_id, id: { [Op.in]: markerIds } }, attributes: ["id", "full_name"] })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.full_name]));

  const attendanceByClassTeacher = byClassTeacherRaw.map((r) => ({
    class_name: r.class_name,
    section: r.section,
    teacher_id: r.marked_by,
    teacher_name: userMap.get(Number(r.marked_by)) || "Unknown",
    taken_count: Number(r.get("taken_count") || 0),
    date: today
  }));

  return ok(res, {
    totals: { totalStudents, totalStaff },
    fees: { month, billed, collected, pending },
    attendance: att.map(a => ({ date: a.date, present: Number(a.get("present")||0), total: Number(a.get("total")||0) })),
    attendanceByClassTeacher
  });
}

async function staffDashboard(req, res) {
  // Teacher: classes in staff profile
  // Accountant: fee pending summary
  // Return generic info; frontend can render based on role
  return ok(res, { user: req.user });
}

module.exports = { adminDashboard, staffDashboard };

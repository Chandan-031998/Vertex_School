const { Op } = require("sequelize");
const { Attendance, Student, FeeInvoice, Payment } = require("../models");

async function attendanceMonthly(class_name, section, monthYYYYMM, tenant_id = 1) {
  const [y,m] = monthYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(y, m-1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const students = await Student.findAll({ where: { tenant_id, class_name, section, is_active: true } });
  const records = await Attendance.findAll({
    where: { tenant_id, class_name, section, date: { [Op.gte]: start, [Op.lt]: end } }
  });

  const byStudent = new Map();
  for (const s of students) byStudent.set(s.id, { student_id: s.id, name: s.full_name, present: 0, absent: 0, total: 0, percentage: 0 });
  for (const r of records) {
    const row = byStudent.get(r.student_id);
    if (!row) continue;
    row.total += 1;
    if (r.status === "P") row.present += 1;
    else row.absent += 1;
  }
  for (const row of byStudent.values()) {
    row.percentage = row.total ? Math.round((row.present / row.total) * 100) : 0;
  }
  return Array.from(byStudent.values());
}

async function feeCollection(monthYYYYMM, tenant_id = 1) {
  const where = { tenant_id };
  if (monthYYYYMM) where.billing_month = monthYYYYMM;
  const invoices = await FeeInvoice.findAll({ where, include: [{ model: Payment, as: "payments" }, { model: Student, as: "student" }] });
  return invoices.map(inv => {
    const paid = inv.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
    const due = Number(inv.total_amount) - paid;
    return {
      invoice_no: inv.invoice_no,
      billing_month: inv.billing_month,
      student: inv.student?.full_name,
      class_name: inv.class_name,
      section: inv.section,
      total_amount: Number(inv.total_amount),
      paid_amount: paid,
      due_amount: due,
      status: inv.status
    };
  });
}

module.exports = { attendanceMonthly, feeCollection };

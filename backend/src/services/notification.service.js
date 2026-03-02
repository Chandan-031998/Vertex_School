const { Notification, Student, FeeInvoice, Payment } = require("../models");
const { sendMail, enabled } = require("./email.service");

async function createFeeReminder(studentId, invoice, dueAmount, tenant_id = 1) {
  const title = "Fee Reminder";
  const message = `Pending due: ₹${dueAmount} for ${invoice.billing_month} (Invoice: ${invoice.invoice_no}).`;
  return Notification.create({
    tenant_id,
    student_id: studentId,
    type: "FEE_REMINDER",
    title,
    message,
    channel: enabled() ? "EMAIL" : "IN_APP",
    status: "PENDING",
    meta: { invoice_id: invoice.id, due_amount: Number(dueAmount) }
  });
}

async function sendPendingNotifications(tenant_id = 1) {
  const pending = await Notification.findAll({ where: { tenant_id, status: "PENDING" }, limit: 50 });
  for (const n of pending) {
    try {
      if (n.channel === "EMAIL") {
        const student = n.student_id ? await Student.findOne({ where: { id: n.student_id, tenant_id } }) : null;
        const to = student?.contact_email;
        if (to) {
          await sendMail({ to, subject: n.title, html: `<p>${n.message}</p>` });
        }
      }
      n.status = "SENT";
      n.sent_at = new Date();
      await n.save();
    } catch (e) {
      n.status = "FAILED";
      await n.save();
    }
  }
  return { count: pending.length };
}

module.exports = { createFeeReminder, sendPendingNotifications };

const { Op } = require("sequelize");
const { v4: uuid } = require("uuid");
const { FeeStructure, FeeInvoice, Payment, Student, ActivityLog, FeeSetting } = require("../models");
const { ok, created, bad } = require("../utils/response");
const { toCsv } = require("../utils/csv");
const { createFeeReminder } = require("../services/notification.service");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function getFeePolicy(req) {
  try {
    const tenant_id = tenantIdFromReq(req);
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
  } catch (err) {
    return {
      currency: "INR",
      receipt_prefix: "VSM-REC",
      invoice_prefix: "VSM-INV"
    };
  }
}

async function listFeeStructures(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const policy = await getFeePolicy(req);
  const rows = await FeeStructure.findAll({ where: { tenant_id, is_active: true }, order: [["class_name","ASC"]] });
  return ok(res, rows.map((r) => ({ ...r.toJSON(), currency: policy.currency })));
}

async function createFeeStructure(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await FeeStructure.create({ ...req.body, tenant_id });
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "FEE_STRUCTURE", entity_id: String(row.id) });
  return created(res, row, "Fee structure created");
}

async function updateFeeStructure(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await FeeStructure.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  await row.update(req.body);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "FEE_STRUCTURE", entity_id: String(row.id), details: req.body });
  return ok(res, row, "Updated");
}

async function deleteFeeStructure(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await FeeStructure.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  await row.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "FEE_STRUCTURE", entity_id: String(req.params.id) });
  return ok(res, null, "Deleted");
}

async function generateInvoice(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { student_id, billing_month } = req.body;
  const student = await Student.findOne({ where: { id: student_id, tenant_id } });
  if (!student) return bad(res, "Student not found");
  const policy = await getFeePolicy(req);

  const structures = await FeeStructure.findAll({ where: { tenant_id, class_name: student.class_name, is_active: true } });
  const total = structures.reduce((s,f)=>s+Number(f.amount),0);

  const invoice_no = `${policy.invoice_prefix || "VSM-INV"}-${uuid().slice(0,8).toUpperCase()}`;
  const invoice = await FeeInvoice.create({
    invoice_no,
    tenant_id,
    student_id,
    class_name: student.class_name,
    section: student.section,
    billing_month,
    total_amount: total,
    status: "UNPAID",
    created_by: req.user.id
  });

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "CREATE", entity: "INVOICE", entity_id: String(invoice.id), details: { invoice_no } });
  return created(res, { ...invoice.toJSON(), currency: policy.currency, invoice_prefix: policy.invoice_prefix }, "Invoice generated");
}

async function listInvoices(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const policy = await getFeePolicy(req);
  const { month, status } = req.query;
  const where = { tenant_id };
  if (month) where.billing_month = month;
  if (status) where.status = status;

  const rows = await FeeInvoice.findAll({
    where,
    include: [{ model: Student, as: "student" }, { model: Payment, as: "payments" }],
    order: [["created_at","DESC"]],
    limit: 300
  });

  const data = rows.map(inv => {
    const paid = inv.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
    const due = Number(inv.total_amount) - paid;
    return {
      id: inv.id,
      invoice_no: inv.invoice_no,
      currency: policy.currency,
      billing_month: inv.billing_month,
      student_id: inv.student_id,
      student: inv.student?.full_name,
      class_name: inv.class_name,
      section: inv.section,
      total_amount: Number(inv.total_amount),
      paid_amount: paid,
      due_amount: due,
      status: inv.status
    };
  });

  return ok(res, data);
}

async function getInvoice(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const policy = await getFeePolicy(req);
  const inv = await FeeInvoice.findOne({ where: { id: req.params.id, tenant_id }, include: [{ model: Student, as: "student" }, { model: Payment, as: "payments" }] });
  if (!inv) return bad(res, "Not found");
  const paid = inv.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
  const due = Number(inv.total_amount) - paid;
  return ok(res, {
    id: inv.id,
    invoice_no: inv.invoice_no,
    currency: policy.currency,
    billing_month: inv.billing_month,
    student_id: inv.student_id,
    student: inv.student?.full_name,
    class_name: inv.class_name,
    section: inv.section,
    total_amount: Number(inv.total_amount),
    paid_amount: paid,
    due_amount: due,
    status: inv.status,
    payments: inv.payments.map((p) => ({
      id: p.id,
      receipt_no: p.receipt_no,
      amount_paid: Number(p.amount_paid),
      payment_mode: p.payment_mode,
      transaction_ref: p.transaction_ref,
      paid_at: p.paid_at
    }))
  });
}

async function recalcInvoice(invoiceId) {
  const inv = await FeeInvoice.findByPk(invoiceId, { include: [{ model: Payment, as: "payments" }] });
  if (!inv) return null;
  const total = Number(inv.total_amount);
  const paid = inv.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
  const due = total - paid;
  if (due <= 0) inv.status = "PAID";
  else if (paid > 0) inv.status = "PARTIAL";
  else inv.status = "UNPAID";
  await inv.save();
  return inv;
}

async function recordPayment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const policy = await getFeePolicy(req);
  const invoice = await FeeInvoice.findOne({ where: { id: req.params.invoiceId, tenant_id }, include: [{ model: Payment, as: "payments" }] });
  if (!invoice) return bad(res, "Invoice not found");

  const receipt_no = `${policy.receipt_prefix || "VSM-REC"}-${uuid().slice(0,8).toUpperCase()}`;
  const payment = await Payment.create({
    invoice_id: invoice.id,
    tenant_id,
    receipt_no,
    amount_paid: req.body.amount_paid,
    payment_mode: req.body.payment_mode,
    transaction_ref: req.body.transaction_ref || null,
    paid_at: new Date(),
    recorded_by: req.user.id
  });

  const updated = await recalcInvoice(invoice.id);
  const paid = updated.payments.reduce((s,p)=>s+Number(p.amount_paid),0);
  const due = Number(updated.total_amount) - paid;

  if (due > 0) {
    await createFeeReminder(invoice.student_id, updated, due, tenant_id);
  }

  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "PAYMENT", entity: "INVOICE", entity_id: String(invoice.id), details: { receipt_no, amount_paid: req.body.amount_paid } });
  return created(res, { payment, invoice: updated, currency: policy.currency, receipt_prefix: policy.receipt_prefix }, "Payment recorded");
}

async function updateInvoice(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const inv = await FeeInvoice.findOne({ where: { id: req.params.id, tenant_id } });
  if (!inv) return bad(res, "Not found");

  const patch = {};
  if (req.body.billing_month) patch.billing_month = req.body.billing_month;
  if (req.body.total_amount !== undefined) patch.total_amount = req.body.total_amount;
  if (req.body.status) patch.status = req.body.status;

  await inv.update(patch);
  await recalcInvoice(inv.id);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "INVOICE", entity_id: String(inv.id), details: patch });
  return ok(res, inv, "Updated");
}

async function deleteInvoice(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const inv = await FeeInvoice.findOne({ where: { id: req.params.id, tenant_id } });
  if (!inv) return bad(res, "Not found");
  await Payment.destroy({ where: { tenant_id, invoice_id: inv.id } });
  await inv.destroy();
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "INVOICE", entity_id: String(req.params.id) });
  return ok(res, null, "Deleted");
}

async function updatePayment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const payment = await Payment.findOne({ where: { id: req.params.paymentId, tenant_id } });
  if (!payment) return bad(res, "Not found");

  const patch = {};
  if (req.body.amount_paid !== undefined) patch.amount_paid = req.body.amount_paid;
  if (req.body.payment_mode) patch.payment_mode = req.body.payment_mode;
  if (req.body.transaction_ref !== undefined) patch.transaction_ref = req.body.transaction_ref || null;
  if (req.body.paid_at) patch.paid_at = req.body.paid_at;

  await payment.update(patch);
  const invoice = await recalcInvoice(payment.invoice_id);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "UPDATE", entity: "PAYMENT", entity_id: String(payment.id), details: patch });
  return ok(res, { payment, invoice }, "Updated");
}

async function deletePayment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const payment = await Payment.findOne({ where: { id: req.params.paymentId, tenant_id } });
  if (!payment) return bad(res, "Not found");
  const invoiceId = payment.invoice_id;
  await payment.destroy();
  const invoice = await recalcInvoice(invoiceId);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action: "DELETE", entity: "PAYMENT", entity_id: String(req.params.paymentId) });
  return ok(res, { invoice }, "Deleted");
}

async function exportFeeReportCsv(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const month = req.query.month;
  const where = { tenant_id };
  if (month) where.billing_month = month;
  const rows = await FeeInvoice.findAll({ where, include: [{ model: Student, as: "student" }, { model: Payment, as: "payments" }] });

  const data = rows.map(inv => {
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

  const csv = toCsv(data, ["invoice_no","billing_month","student","class_name","section","total_amount","paid_amount","due_amount","status"]);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="fee_report_${month || "all"}.csv"`);
  return res.send(csv);
}

module.exports = {
  listFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  generateInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  updatePayment,
  deletePayment,
  exportFeeReportCsv
};

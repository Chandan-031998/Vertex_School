const { body, param, query } = require("express-validator");

const createFeeStructureRules = [
  body("class_name").isString().notEmpty(),
  body("fee_name").optional().isString(),
  body("amount").isFloat({ gt: 0 }),
  body("frequency").optional().isIn(["MONTHLY","QUARTERLY","YEARLY"])
];

const createInvoiceRules = [
  body("student_id").isInt(),
  body("billing_month").matches(/^\d{4}-\d{2}$/).withMessage("billing_month YYYY-MM")
];

const recordPaymentRules = [
  param("invoiceId").isInt(),
  body("amount_paid").isFloat({ gt: 0 }),
  body("payment_mode").isIn(["CASH","ONLINE"]),
  body("transaction_ref").optional().isString()
];

const updateStructureRules = [
  param("id").isInt(),
  body("class_name").optional().isString().notEmpty(),
  body("fee_name").optional().isString().notEmpty(),
  body("amount").optional().isFloat({ gt: 0 }),
  body("frequency").optional().isIn(["MONTHLY","QUARTERLY","YEARLY"]),
  body("is_active").optional().isBoolean()
];

const updateInvoiceRules = [
  param("id").isInt(),
  body("billing_month").optional().matches(/^\d{4}-\d{2}$/).withMessage("billing_month YYYY-MM"),
  body("total_amount").optional().isFloat({ gt: 0 }),
  body("status").optional().isIn(["UNPAID","PARTIAL","PAID"])
];

const updatePaymentRules = [
  param("paymentId").isInt(),
  body("amount_paid").optional().isFloat({ gt: 0 }),
  body("payment_mode").optional().isIn(["CASH","ONLINE"]),
  body("transaction_ref").optional().isString(),
  body("paid_at").optional().isISO8601()
];

const idParamRule = [param("id").isInt()];
const paymentIdParamRule = [param("paymentId").isInt()];

const revenueReportRules = [
  query("month").optional().matches(/^\d{4}-\d{2}$/)
];

module.exports = {
  createFeeStructureRules,
  createInvoiceRules,
  recordPaymentRules,
  updateStructureRules,
  updateInvoiceRules,
  updatePaymentRules,
  idParamRule,
  paymentIdParamRule,
  revenueReportRules
};

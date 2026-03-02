const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const {
  createFeeStructureRules,
  createInvoiceRules,
  recordPaymentRules,
  updateStructureRules,
  updateInvoiceRules,
  updatePaymentRules,
  idParamRule,
  paymentIdParamRule
} = require("../validators/fee.validators");
const {
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
} = require("../controllers/fees.controller");

const router = express.Router();

router.get("/structures", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), listFeeStructures);
router.post("/structures", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), createFeeStructureRules, validate, createFeeStructure);
router.put("/structures/:id", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), updateStructureRules, validate, updateFeeStructure);
router.delete("/structures/:id", requireRole([ROLES.ADMIN]), idParamRule, validate, deleteFeeStructure);

router.post("/invoices", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), createInvoiceRules, validate, generateInvoice);
router.get("/invoices", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), listInvoices);
router.get("/invoices/:id", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), idParamRule, validate, getInvoice);
router.put("/invoices/:id", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), updateInvoiceRules, validate, updateInvoice);
router.delete("/invoices/:id", requireRole([ROLES.ADMIN]), idParamRule, validate, deleteInvoice);
router.post("/invoices/:invoiceId/pay", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), recordPaymentRules, validate, recordPayment);
router.put("/payments/:paymentId", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), updatePaymentRules, validate, updatePayment);
router.delete("/payments/:paymentId", requireRole([ROLES.ADMIN]), paymentIdParamRule, validate, deletePayment);

router.get("/reports/export", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), exportFeeReportCsv);

module.exports = router;

const express = require("express");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const { makeUploader } = require("../middleware/upload");
const upload = makeUploader("admissions");

const { createAdmissionRules, updateStatusRules, updateAdmissionRules, idParamRule } = require("../validators/admission.validators");
const { createAdmission, listAdmissions, getAdmission, updateAdmission, updateStatus, convertToStudent, deleteAdmission } = require("../controllers/admissions.controller");

const router = express.Router();

// Public online application form submit
router.post("/", upload.array("documents", 6), createAdmissionRules, validate, createAdmission);

// Admin/Staff review
router.get("/", auth, requireRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT]), listAdmissions);
router.get("/:id", auth, requireRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT]), getAdmission);
router.put("/:id", auth, requireRole([ROLES.ADMIN]), upload.array("documents", 6), updateAdmissionRules, validate, updateAdmission);
router.patch("/:id/status", auth, requireRole([ROLES.ADMIN]), updateStatusRules, validate, updateStatus);
router.post("/:id/convert", auth, requireRole([ROLES.ADMIN]), convertToStudent);
router.delete("/:id", auth, requireRole([ROLES.ADMIN]), idParamRule, validate, deleteAdmission);

module.exports = router;

const express = require("express");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const { classStrength, exportStudentList, attendanceReport, feeReport } = require("../controllers/reports.controller");

const router = express.Router();

router.get("/class-strength", requireRole([ROLES.ADMIN]), classStrength);
router.get("/students/export", requireRole([ROLES.ADMIN]), exportStudentList);
router.get("/attendance", requireRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT]), attendanceReport);
router.get("/fees", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), feeReport);

module.exports = router;

const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const { markAttendanceRules, attendanceQueryRules, idParamRule, updateAttendanceRules } = require("../validators/attendance.validators");
const { markAttendance, monthlyReport, dailyReport, updateAttendance, deleteAttendance, exportMonthlyCsv } = require("../controllers/attendance.controller");

const router = express.Router();

router.post("/mark", requireRole([ROLES.TEACHER, ROLES.ADMIN]), markAttendanceRules, validate, markAttendance);
router.post("/mark-assigned", requireRole([ROLES.TEACHER]), markAttendanceRules, validate, markAttendance);
router.get("/monthly", requireRole([ROLES.TEACHER, ROLES.ADMIN]), attendanceQueryRules, validate, monthlyReport);
router.get("/daily", requireRole([ROLES.TEACHER, ROLES.ADMIN]), attendanceQueryRules, validate, dailyReport);
router.put("/:id", requireRole([ROLES.TEACHER, ROLES.ADMIN]), updateAttendanceRules, validate, updateAttendance);
router.delete("/:id", requireRole([ROLES.ADMIN]), idParamRule, validate, deleteAttendance);
router.get("/monthly/export", requireRole([ROLES.TEACHER, ROLES.ADMIN]), exportMonthlyCsv);

module.exports = router;

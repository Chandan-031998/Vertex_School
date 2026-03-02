const express = require("express");
const { adminDashboard, staffDashboard } = require("../controllers/dashboard.controller");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/admin", requireRole([ROLES.ADMIN]), adminDashboard);
router.get("/staff", requireRole([ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.ADMIN]), staffDashboard);

module.exports = router;

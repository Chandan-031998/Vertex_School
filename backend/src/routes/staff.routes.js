const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const { createStaffRules, updateStaffRules, assignClassesRules, idParamRule } = require("../validators/staff.validators");
const { listStaff, createStaff, updateStaff, deleteStaff, listActivityLogs, assignClasses, myAssignedClasses } = require("../controllers/staff.controller");

const router = express.Router();

router.get("/me/assigned-classes", requireRole([ROLES.TEACHER]), myAssignedClasses);

router.get("/", requireRole([ROLES.ADMIN]), listStaff);
router.get("/activity", requireRole([ROLES.ADMIN]), listActivityLogs);
router.post("/", requireRole([ROLES.ADMIN]), createStaffRules, validate, createStaff);
router.put("/:id", requireRole([ROLES.ADMIN]), updateStaffRules, validate, updateStaff);
router.delete("/:id", requireRole([ROLES.ADMIN]), idParamRule, validate, deleteStaff);
router.put("/:staffId/assign-classes", requireRole([ROLES.ADMIN]), assignClassesRules, validate, assignClasses);

module.exports = router;

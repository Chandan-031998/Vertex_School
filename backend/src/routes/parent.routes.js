const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const {
  parentMe,
  parentChildren,
  parentDashboard,
  parentAttendance,
  parentFees,
  parentTransport,
  parentNotifications,
  createParentRequest,
  parentRequests,
  updateParentSettings
} = require("../controllers/parent.controller");
const { studentIdParamRule, parentRequestRules } = require("../validators/parent.validators");

const router = express.Router();
router.use(requireRole([ROLES.PARENT]));

router.get("/me", parentMe);
router.get("/children", parentChildren);
router.get("/dashboard", parentDashboard);
router.get("/attendance", parentAttendance);
router.get("/fees", parentFees);
router.get("/transport", parentTransport);
router.get("/notifications", parentNotifications);
router.post("/requests", parentRequestRules, validate, createParentRequest);
router.get("/requests", parentRequests);
router.put("/settings", updateParentSettings);

// Backward compatibility aliases
router.get("/students", parentChildren);
router.get("/transport/:studentId", studentIdParamRule, validate, (req, res, next) => {
  req.query.student_id = req.params.studentId;
  return parentTransport(req, res, next);
});

module.exports = router;

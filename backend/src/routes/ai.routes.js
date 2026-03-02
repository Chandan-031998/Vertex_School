const express = require("express");
const { requireRole } = require("../middleware/rbac");
const { requireFeature } = require("../middleware/feature");
const { ROLES, FEATURE_FLAGS } = require("../config/constants");

const router = express.Router();

router.get("/assistant", requireRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT]), requireFeature(FEATURE_FLAGS.AI_ASSISTANT), (req, res) => {
  return res.json({ success: true, message: "AI assistant enabled", data: { tenant_id: req.tenant?.id } });
});

router.get("/insights", requireRole([ROLES.ADMIN]), requireFeature(FEATURE_FLAGS.AI_INSIGHTS), (req, res) => {
  return res.json({ success: true, message: "AI insights enabled", data: { tenant_id: req.tenant?.id } });
});

router.get("/reports", requireRole([ROLES.ADMIN]), requireFeature(FEATURE_FLAGS.AI_REPORTS), (req, res) => {
  return res.json({ success: true, message: "AI reports enabled", data: { tenant_id: req.tenant?.id } });
});

module.exports = router;

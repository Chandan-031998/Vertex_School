const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES, FEATURE_FLAGS } = require("../config/constants");
const { requireFeature } = require("../middleware/feature");
const { listNotifications, createNotification, runDispatcher, updateNotification, deleteNotification } = require("../controllers/notifications.controller");

const router = express.Router();

router.use(requireFeature(FEATURE_FLAGS.NOTIFICATIONS));

router.get("/", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), listNotifications);
router.post("/", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), createNotification);
router.post("/dispatch", requireRole([ROLES.ADMIN]), runDispatcher);
router.put("/:id", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), [
  param("id").isInt(),
  body("type").optional().isIn(["FEE_REMINDER","GENERAL"]),
  body("channel").optional().isIn(["IN_APP","EMAIL"]),
  body("status").optional().isIn(["PENDING","SENT","FAILED"]),
  body("title").optional().isString(),
  body("message").optional().isString()
], validate, updateNotification);
router.delete("/:id", requireRole([ROLES.ADMIN, ROLES.ACCOUNTANT]), [param("id").isInt()], validate, deleteNotification);

module.exports = router;

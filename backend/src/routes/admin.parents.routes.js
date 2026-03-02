const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const {
  listParents,
  createParent,
  getParent,
  updateParent,
  deleteParent,
  resetParentPassword
} = require("../controllers/adminParents.controller");
const { idParamRule, createParentRules, updateParentRules, resetPasswordRules } = require("../validators/adminParents.validators");

const router = express.Router();
router.use(requireRole([ROLES.ADMIN]));

router.get("/", listParents);
router.post("/", createParentRules, validate, createParent);
router.get("/:id", idParamRule, validate, getParent);
router.put("/:id", updateParentRules, validate, updateParent);
router.delete("/:id", idParamRule, validate, deleteParent);
router.post("/:id/reset-password", resetPasswordRules, validate, resetParentPassword);

module.exports = router;

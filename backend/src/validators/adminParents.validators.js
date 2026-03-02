const { body, param } = require("express-validator");

const idParamRule = [param("id").isInt()];

const createParentRules = [
  body("full_name").isString().notEmpty(),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  body("phone").optional({ nullable: true }).isString(),
  body("address").optional({ nullable: true }).isString(),
  body("student_ids").optional().isArray(),
  body("student_ids.*").optional().isInt()
];

const updateParentRules = [
  ...idParamRule,
  body("full_name").optional().isString().notEmpty(),
  body("phone").optional({ nullable: true }).isString(),
  body("address").optional({ nullable: true }).isString(),
  body("is_active").optional().isBoolean(),
  body("student_ids").optional().isArray(),
  body("student_ids.*").optional().isInt()
];

const resetPasswordRules = [
  ...idParamRule,
  body("new_password").isString().isLength({ min: 6 })
];

module.exports = { idParamRule, createParentRules, updateParentRules, resetPasswordRules };

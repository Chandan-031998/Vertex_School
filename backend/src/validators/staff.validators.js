const { body, param } = require("express-validator");

const createStaffRules = [
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }),
  body("full_name").isString().notEmpty(),
  body("role").isIn(["ADMIN","TEACHER","ACCOUNTANT","PARENT","TRANSPORT_MANAGER"]),
  body("designation").optional().isString(),
  body("phone").optional().isString(),
  body("assigned_classes").optional().isArray()
];

const updateStaffRules = [
  param("id").isInt(),
  body("email").optional().isEmail(),
  body("password").optional().isString().isLength({ min: 6 }),
  body("full_name").optional().isString().notEmpty(),
  body("role").optional().isIn(["ADMIN","TEACHER","ACCOUNTANT","PARENT","TRANSPORT_MANAGER"]),
  body("designation").optional().isString(),
  body("phone").optional().isString(),
  body("assigned_classes").optional().isArray()
];

const assignClassesRules = [
  param("staffId").isInt(),
  body("assigned_classes").isArray(),
  body("assigned_classes.*.class_name").isString().notEmpty(),
  body("assigned_classes.*.section").isString().notEmpty()
];

const idParamRule = [param("id").isInt()];

module.exports = { createStaffRules, updateStaffRules, assignClassesRules, idParamRule };

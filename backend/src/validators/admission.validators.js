const { body, param } = require("express-validator");

const createAdmissionRules = [
  body("full_name").isString().notEmpty(),
  body("applying_class").isString().notEmpty(),
  body("parent_phone").optional().isString(),
  body("section").optional().isString(),
  body("dob").optional().isISO8601()
];

const updateStatusRules = [
  param("id").isInt(),
  body("status").isIn(["PENDING","APPROVED","REJECTED"]),
  body("remarks").optional().isString()
];

const updateAdmissionRules = [
  param("id").isInt(),
  body("full_name").optional().isString().notEmpty(),
  body("applying_class").optional().isString().notEmpty(),
  body("parent_phone").optional().isString(),
  body("parent_name").optional().isString(),
  body("section").optional().isString(),
  body("address").optional().isString(),
  body("dob").optional().isISO8601(),
  body("gender").optional().isIn(["Male","Female","Other"])
];

const idParamRule = [param("id").isInt()];

module.exports = { createAdmissionRules, updateStatusRules, updateAdmissionRules, idParamRule };

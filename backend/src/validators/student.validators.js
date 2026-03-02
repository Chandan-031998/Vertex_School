const { body, param, query } = require("express-validator");

const createStudentRules = [
  body("full_name").isString().notEmpty(),
  body("class_name").isString().notEmpty(),
  body("section").isString().notEmpty()
];

const idParam = [param("id").isInt()];
const listRules = [
  query("q").optional().isString(),
  query("class_name").optional().isString(),
  query("section").optional().isString()
];

module.exports = { createStudentRules, idParam, listRules };

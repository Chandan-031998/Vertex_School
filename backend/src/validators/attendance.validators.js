const { body, param, query } = require("express-validator");

const markAttendanceRules = [
  body("class_name").isString().notEmpty(),
  body("section").isString().notEmpty(),
  body("date").isISO8601().withMessage("date should be YYYY-MM-DD"),
  body("records").isArray({ min: 1 }),
  body("records.*.student_id").isInt(),
  body("records.*.status").isIn(["P","A"])
];

const attendanceQueryRules = [
  query("class_name").optional().isString(),
  query("section").optional().isString(),
  query("month").optional().matches(/^\d{4}-\d{2}$/),
  query("date").optional().isISO8601()
];

const idParamRule = [param("id").isInt()];

const updateAttendanceRules = [
  ...idParamRule,
  body("status").optional().isIn(["P","A"]),
  body("class_name").optional().isString(),
  body("section").optional().isString(),
  body("date").optional().isISO8601()
];

module.exports = { markAttendanceRules, attendanceQueryRules, idParamRule, updateAttendanceRules };

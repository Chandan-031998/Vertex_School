const { body, param } = require("express-validator");

const studentIdParamRule = [param("studentId").isInt()];

const parentRequestRules = [
  body("student_id").isInt(),
  body("request_type").isIn(["STOP_CHANGE", "PICKUP_CHANGE", "DROP_CHANGE", "PAUSE_TRANSPORT", "RESUME_TRANSPORT"]),
  body("payload_json").optional().isObject()
];

module.exports = { studentIdParamRule, parentRequestRules };

const { body, query, param } = require("express-validator");

const teacherStudentsQueryRules = [
  query("class_name").optional().isString().notEmpty(),
  query("section").optional().isString().notEmpty(),
  query("q").optional().isString()
];

const idParamRule = [param("id").isInt()];

const teacherRemarksRules = [
  ...idParamRule,
  body("teacher_remarks").optional({ nullable: true }).isString()
];

const teacherAttendanceClassDateRules = [
  query("class_name").isString().notEmpty(),
  query("section").isString().notEmpty(),
  query("date").optional().isISO8601()
];

const teacherAttendanceMarkRules = [
  body("date").isISO8601(),
  body("class_name").isString().notEmpty(),
  body("section").isString().notEmpty(),
  body("records").isArray({ min: 1 }),
  body("records.*.student_id").isInt(),
  body("records.*.status").isIn(["P", "A"])
];

const teacherAttendanceReportRules = [
  query("class_name").isString().notEmpty(),
  query("section").isString().notEmpty(),
  query("month").matches(/^\d{4}-\d{2}$/)
];

const teacherHomeworkCreateRules = [
  body("class_name").isString().notEmpty(),
  body("section").isString().notEmpty(),
  body("subject_id").optional({ nullable: true }).isInt(),
  body("title").isString().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
  body("due_date").optional({ nullable: true }).isISO8601()
];

const teacherHomeworkUpdateRules = [
  ...idParamRule,
  body("class_name").optional().isString().notEmpty(),
  body("section").optional().isString().notEmpty(),
  body("subject_id").optional({ nullable: true }).isInt(),
  body("title").optional().isString().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
  body("due_date").optional({ nullable: true }).isISO8601()
];

const teacherExamsCreateRules = [
  body("class_name").isString().notEmpty(),
  body("section").isString().notEmpty(),
  body("subject_id").isInt(),
  body("exam_name").isString().notEmpty(),
  body("exam_date").isISO8601(),
  body("max_marks").isFloat({ min: 0 })
];

const teacherExamsUpdateRules = [
  ...idParamRule,
  body("class_name").optional().isString().notEmpty(),
  body("section").optional().isString().notEmpty(),
  body("subject_id").optional().isInt(),
  body("exam_name").optional().isString().notEmpty(),
  body("exam_date").optional().isISO8601(),
  body("max_marks").optional().isFloat({ min: 0 })
];

const teacherMarksUpsertRules = [
  ...idParamRule,
  body("records").isArray({ min: 1 }),
  body("records.*.student_id").isInt(),
  body("records.*.marks_obtained").isFloat({ min: 0 }),
  body("records.*.remarks").optional({ nullable: true }).isString()
];

const teacherSendMessageRules = [
  body("student_id").optional().isInt(),
  body("class_name").optional().isString().notEmpty(),
  body("section").optional().isString().notEmpty(),
  body("channel").isIn(["SMS", "WHATSAPP", "EMAIL"]),
  body("message").isString().notEmpty()
];

const teacherUpdateProfileRules = [
  body("phone").optional({ nullable: true }).isString(),
  body("address").optional({ nullable: true }).isString(),
  body("photo_url").optional({ nullable: true }).isString()
];

const teacherChangePasswordRules = [
  body("current_password").isString().isLength({ min: 6 }),
  body("new_password").isString().isLength({ min: 6 })
];

module.exports = {
  idParamRule,
  teacherStudentsQueryRules,
  teacherRemarksRules,
  teacherAttendanceClassDateRules,
  teacherAttendanceMarkRules,
  teacherAttendanceReportRules,
  teacherHomeworkCreateRules,
  teacherHomeworkUpdateRules,
  teacherExamsCreateRules,
  teacherExamsUpdateRules,
  teacherMarksUpsertRules,
  teacherSendMessageRules,
  teacherUpdateProfileRules,
  teacherChangePasswordRules
};

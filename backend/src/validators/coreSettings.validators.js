const { body, param, query } = require("express-validator");

const idParamRule = [param("id").isInt()];
const sectionIdParamRule = [param("sectionId").isInt()];

const createAcademicYearRules = [
  body("name").isString().notEmpty(),
  body("start_date").isISO8601().withMessage("start_date should be YYYY-MM-DD"),
  body("end_date").isISO8601().withMessage("end_date should be YYYY-MM-DD"),
  body("is_active").optional().isBoolean()
];

const updateAcademicYearRules = [
  ...idParamRule,
  body("name").optional().isString().notEmpty(),
  body("start_date").optional().isISO8601(),
  body("end_date").optional().isISO8601(),
  body("is_active").optional().isBoolean()
];

const activateAcademicYearRules = [...idParamRule];

const createClassRules = [
  body("class_name").isString().notEmpty(),
  body("sections").optional().isArray(),
  body("sections.*").optional().isString().notEmpty()
];

const updateClassRules = [
  ...idParamRule,
  body("class_name").optional().isString().notEmpty(),
  body("sections").optional().isArray(),
  body("sections.*").optional().isString().notEmpty()
];

const addSectionRules = [
  ...idParamRule,
  body("section_name").isString().notEmpty()
];

const listSubjectsRules = [query("class_id").optional().isInt()];

const createSubjectRules = [
  body("class_id").isInt(),
  body("subject_name").isString().notEmpty()
];

const updateSubjectRules = [
  ...idParamRule,
  body("class_id").optional().isInt(),
  body("subject_name").optional().isString().notEmpty()
];

const listHolidayRules = [query("month").optional().matches(/^\d{4}-\d{2}$/)];

const createHolidayRules = [
  body("title").isString().notEmpty(),
  body("date").isISO8601(),
  body("type").isIn(["HOLIDAY", "EVENT"])
];

const updateHolidayRules = [
  ...idParamRule,
  body("title").optional().isString().notEmpty(),
  body("date").optional().isISO8601(),
  body("type").optional().isIn(["HOLIDAY", "EVENT"])
];

const updateFeeSettingsRules = [
  body("currency").optional().isString().notEmpty(),
  body("receipt_prefix").optional().isString().notEmpty(),
  body("invoice_prefix").optional().isString().notEmpty(),
  body("late_fee_enabled").optional().isBoolean(),
  body("late_fee_type").optional().isIn(["FIXED", "PERCENT"]),
  body("late_fee_value").optional().isFloat({ min: 0 }),
  body("grace_days").optional().isInt({ min: 0 }),
  body("payment_methods_json").optional().isArray(),
  body("payment_methods_json.*").optional().isIn(["CASH", "ONLINE", "UPI", "CARD", "BANK"])
];

const updateAttendanceSettingsRules = [
  body("mode").optional().isIn(["DAILY", "PERIOD"]),
  body("cutoff_time").optional({ nullable: true }).matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("allow_edit_days").optional().isInt({ min: 0 }),
  body("auto_absent_after_cutoff").optional().isBoolean(),
  body("leave_types_json").optional().isArray(),
  body("leave_types_json.*").optional().isString().notEmpty()
];

const updateSecuritySettingsRules = [
  body("password_min_length").optional().isInt({ min: 6 }),
  body("password_require_upper").optional().isBoolean(),
  body("password_require_number").optional().isBoolean(),
  body("password_require_symbol").optional().isBoolean(),
  body("session_timeout_minutes").optional().isInt({ min: 15 }),
  body("enable_2fa").optional().isBoolean()
];

const roleParamRule = [param("role").isString().notEmpty()];
const upsertRolePermissionsRules = [
  ...roleParamRule,
  body("permissions").isArray({ min: 1 }),
  body("permissions.*.resource").isString().notEmpty(),
  body("permissions.*.can_create").optional().isBoolean(),
  body("permissions.*.can_read").optional().isBoolean(),
  body("permissions.*.can_update").optional().isBoolean(),
  body("permissions.*.can_delete").optional().isBoolean()
];

const createNotificationTemplateRules = [
  body("key").isString().notEmpty(),
  body("subject").optional({ nullable: true }).isString(),
  body("body").isString().notEmpty(),
  body("channel").isIn(["SMS", "EMAIL", "WHATSAPP"]),
  body("language").optional().isString().notEmpty()
];

const updateNotificationTemplateRules = [
  ...idParamRule,
  body("key").optional().isString().notEmpty(),
  body("subject").optional({ nullable: true }).isString(),
  body("body").optional().isString().notEmpty(),
  body("channel").optional().isIn(["SMS", "EMAIL", "WHATSAPP"]),
  body("language").optional().isString().notEmpty()
];

const createIntegrationRules = [
  body("type").isIn(["SMTP", "SMS", "PAYMENT", "WHATSAPP", "smtp", "sms", "payment", "whatsapp"]),
  body("config_json").isObject()
];

const updateIntegrationRules = [
  ...idParamRule,
  body("type").optional().isIn(["SMTP", "SMS", "PAYMENT", "WHATSAPP", "smtp", "sms", "payment", "whatsapp"]),
  body("config_json").optional().isObject()
];

const updateSubscriptionRules = [
  body("plan").optional().isIn(["BASIC", "PRO", "ENTERPRISE"]),
  body("status").optional().isIn(["ACTIVE", "EXPIRED"]),
  body("start_date").optional({ nullable: true }).isISO8601(),
  body("end_date").optional({ nullable: true }).isISO8601(),
  body("limits_json").optional().isObject()
];

const timetableDayValues = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const createTimetableRules = [
  body("class_id").isInt(),
  body("section_id").isInt(),
  body("day_of_week").isIn(timetableDayValues),
  body("period_no").isInt({ min: 1 }),
  body("subject_name").isString().notEmpty(),
  body("start_time").matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("end_time").matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("teacher_name").optional({ nullable: true }).isString(),
  body("room_no").optional({ nullable: true }).isString()
];

const updateTimetableRules = [
  ...idParamRule,
  body("class_id").optional().isInt(),
  body("section_id").optional().isInt(),
  body("day_of_week").optional().isIn(timetableDayValues),
  body("period_no").optional().isInt({ min: 1 }),
  body("subject_name").optional().isString().notEmpty(),
  body("start_time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("end_time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("teacher_name").optional({ nullable: true }).isString(),
  body("room_no").optional({ nullable: true }).isString()
];

module.exports = {
  idParamRule,
  sectionIdParamRule,
  createAcademicYearRules,
  updateAcademicYearRules,
  activateAcademicYearRules,
  createClassRules,
  updateClassRules,
  addSectionRules,
  listSubjectsRules,
  createSubjectRules,
  updateSubjectRules,
  listHolidayRules,
  createHolidayRules,
  updateHolidayRules,
  updateFeeSettingsRules,
  updateAttendanceSettingsRules,
  updateSecuritySettingsRules,
  roleParamRule,
  upsertRolePermissionsRules,
  createNotificationTemplateRules,
  updateNotificationTemplateRules,
  createIntegrationRules,
  updateIntegrationRules,
  updateSubscriptionRules,
  createTimetableRules,
  updateTimetableRules
};

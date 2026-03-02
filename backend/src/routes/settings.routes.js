const express = require("express");
const validate = require("../middleware/validate");
const { makeUploader } = require("../middleware/upload");
const { requireRole } = require("../middleware/rbac");
const { ROLES, FEATURE_FLAGS } = require("../config/constants");
const { requireFeature } = require("../middleware/feature");
const { getBranding, putBranding, getSchool, putSchool, getFeatures, putFeatures, getAi, putAi, uploadBrandingLogo } = require("../controllers/settings.controller");
const { putBrandingRules, putSchoolRules, putFeaturesRules, putAiRules } = require("../validators/settings.validators");
const {
  listAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  activateAcademicYear,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  addSection,
  deleteSection,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  listHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getFeeSettings,
  updateFeeSettings,
  getAttendanceSettings,
  updateAttendanceSettings,
  getSecuritySettings,
  updateSecuritySettings,
  listRolePermissions,
  listRolesCatalog,
  upsertRolePermissions,
  listNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  listIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  getAuditLogs,
  getSubscription,
  updateSubscription,
  listTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable
} = require("../controllers/coreSettings.controller");
const {
  idParamRule,
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
  upsertRolePermissionsRules,
  createNotificationTemplateRules,
  updateNotificationTemplateRules,
  createIntegrationRules,
  updateIntegrationRules,
  updateSubscriptionRules,
  createTimetableRules,
  updateTimetableRules
} = require("../validators/coreSettings.validators");

const router = express.Router();
const brandingUpload = makeUploader("branding");

router.use(requireRole([ROLES.ADMIN]));

router.get("/branding", getBranding);
router.put("/branding", putBrandingRules, validate, putBranding);
router.post("/branding/logo", brandingUpload.single("logo"), uploadBrandingLogo);
router.get("/school", getSchool);
router.put("/school", putSchoolRules, validate, putSchool);

router.get("/features", getFeatures);
router.put("/features", putFeaturesRules, validate, putFeatures);

router.get("/ai", getAi);
router.put("/ai", putAiRules, validate, putAi);

// Example feature-gated endpoint for AI module.
router.get("/ai/ping", requireFeature(FEATURE_FLAGS.AI_ASSISTANT), (req, res) => {
  return res.json({ success: true, message: "AI assistant feature is enabled", data: { tenant_id: req.tenant?.id } });
});

router.get("/academic-years", listAcademicYears);
router.post("/academic-years", createAcademicYearRules, validate, createAcademicYear);
router.put("/academic-years/:id", updateAcademicYearRules, validate, updateAcademicYear);
router.delete("/academic-years/:id", idParamRule, validate, deleteAcademicYear);
router.post("/academic-years/:id/activate", activateAcademicYearRules, validate, activateAcademicYear);

router.get("/classes", listClasses);
router.post("/classes", createClassRules, validate, createClass);
router.put("/classes/:id", updateClassRules, validate, updateClass);
router.delete("/classes/:id", idParamRule, validate, deleteClass);
router.post("/classes/:id/sections", addSectionRules, validate, addSection);
router.delete("/sections/:id", idParamRule, validate, deleteSection);

router.get("/subjects", listSubjectsRules, validate, listSubjects);
router.post("/subjects", createSubjectRules, validate, createSubject);
router.put("/subjects/:id", updateSubjectRules, validate, updateSubject);
router.delete("/subjects/:id", idParamRule, validate, deleteSubject);

router.get("/holidays", listHolidayRules, validate, listHolidays);
router.post("/holidays", createHolidayRules, validate, createHoliday);
router.put("/holidays/:id", updateHolidayRules, validate, updateHoliday);
router.delete("/holidays/:id", idParamRule, validate, deleteHoliday);

router.get("/fees", getFeeSettings);
router.put("/fees", updateFeeSettingsRules, validate, updateFeeSettings);

router.get("/attendance", getAttendanceSettings);
router.put("/attendance", updateAttendanceSettingsRules, validate, updateAttendanceSettings);

router.get("/security", getSecuritySettings);
router.put("/security", updateSecuritySettingsRules, validate, updateSecuritySettings);

router.get("/roles", listRolePermissions);
router.get("/roles/catalog", listRolesCatalog);
router.put("/roles/:role/permissions", upsertRolePermissionsRules, validate, upsertRolePermissions);

router.get("/notification-templates", listNotificationTemplates);
router.post("/notification-templates", createNotificationTemplateRules, validate, createNotificationTemplate);
router.put("/notification-templates/:id", updateNotificationTemplateRules, validate, updateNotificationTemplate);
router.delete("/notification-templates/:id", idParamRule, validate, deleteNotificationTemplate);

router.get("/integrations", listIntegrations);
router.post("/integrations", createIntegrationRules, validate, createIntegration);
router.put("/integrations/:id", updateIntegrationRules, validate, updateIntegration);
router.delete("/integrations/:id", idParamRule, validate, deleteIntegration);

router.get("/audit-logs", getAuditLogs);

router.get("/subscription", getSubscription);
router.put("/subscription", updateSubscriptionRules, validate, updateSubscription);

router.get("/timetables", listTimetables);
router.post("/timetables", createTimetableRules, validate, createTimetable);
router.put("/timetables/:id", updateTimetableRules, validate, updateTimetable);
router.delete("/timetables/:id", idParamRule, validate, deleteTimetable);

module.exports = router;

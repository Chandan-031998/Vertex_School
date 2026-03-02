const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES, FEATURE_FLAGS } = require("../config/constants");
const { requireFeature } = require("../middleware/feature");
const { makeUploader } = require("../middleware/upload");
const {
  teacherDashboard,
  teacherClasses,
  teacherStudents,
  teacherStudentById,
  teacherStudentRemarks,
  teacherAttendanceClassDate,
  teacherAttendanceMark,
  teacherAttendanceReport,
  teacherAttendanceExport,
  listHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  listExams,
  createExam,
  updateExam,
  deleteExam,
  getExamMarks,
  upsertExamMarks,
  teacherTimetable,
  sendTeacherMessage,
  teacherMessageHistory,
  teacherProfile,
  updateTeacherProfile,
  changeTeacherPassword
} = require("../controllers/teacher.controller");
const {
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
} = require("../validators/teacher.validators");

const router = express.Router();
const homeworkUpload = makeUploader("homework");

router.use(requireRole([ROLES.TEACHER]));

router.get("/dashboard", teacherDashboard);

router.get("/classes", teacherClasses);
router.get("/students", teacherStudentsQueryRules, validate, teacherStudents);
router.get("/students/:id", idParamRule, validate, teacherStudentById);
router.put("/students/:id/remarks", teacherRemarksRules, validate, teacherStudentRemarks);

router.get("/attendance/class-date", teacherAttendanceClassDateRules, validate, teacherAttendanceClassDate);
router.post("/attendance/mark", teacherAttendanceMarkRules, validate, teacherAttendanceMark);
router.get("/attendance/report", teacherAttendanceReportRules, validate, teacherAttendanceReport);
router.get("/attendance/report/export", teacherAttendanceReportRules, validate, teacherAttendanceExport);

router.get("/homework", listHomework);
router.post("/homework", homeworkUpload.array("attachments", 5), teacherHomeworkCreateRules, validate, createHomework);
router.put("/homework/:id", homeworkUpload.array("attachments", 5), teacherHomeworkUpdateRules, validate, updateHomework);
router.delete("/homework/:id", idParamRule, validate, deleteHomework);

router.get("/exams", listExams);
router.post("/exams", teacherExamsCreateRules, validate, createExam);
router.put("/exams/:id", teacherExamsUpdateRules, validate, updateExam);
router.delete("/exams/:id", idParamRule, validate, deleteExam);
router.get("/exams/:id/marks", idParamRule, validate, getExamMarks);
router.post("/exams/:id/marks", teacherMarksUpsertRules, validate, upsertExamMarks);

router.get("/timetable", teacherTimetable);

router.post("/messages/send", requireFeature(FEATURE_FLAGS.NOTIFICATIONS), teacherSendMessageRules, validate, sendTeacherMessage);
router.get("/messages/history", requireFeature(FEATURE_FLAGS.NOTIFICATIONS), teacherMessageHistory);

router.get("/profile", teacherProfile);
router.put("/profile", teacherUpdateProfileRules, validate, updateTeacherProfile);
router.put("/change-password", teacherChangePasswordRules, validate, changeTeacherPassword);

module.exports = router;

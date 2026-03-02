const express = require("express");
const auth = require("../middleware/auth");

const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const admissionsRoutes = require("./admissions.routes");
const studentsRoutes = require("./students.routes");
const attendanceRoutes = require("./attendance.routes");
const feesRoutes = require("./fees.routes");
const staffRoutes = require("./staff.routes");
const reportsRoutes = require("./reports.routes");
const notificationsRoutes = require("./notifications.routes");
const settingsRoutes = require("./settings.routes");
const aiRoutes = require("./ai.routes");
const teacherRoutes = require("./teacher.routes");
const transportRoutes = require("./transport.routes");
const parentRoutes = require("./parent.routes");
const adminParentsRoutes = require("./admin.parents.routes");

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/dashboard", auth, dashboardRoutes);
router.use("/admissions", admissionsRoutes); // public create
router.use("/students", auth, studentsRoutes);
router.use("/attendance", auth, attendanceRoutes);
router.use("/fees", auth, feesRoutes);
router.use("/staff", auth, staffRoutes);
router.use("/reports", auth, reportsRoutes);
router.use("/notifications", auth, notificationsRoutes);
router.use("/settings", auth, settingsRoutes);
router.use("/ai", auth, aiRoutes);
router.use("/teacher", auth, teacherRoutes);
router.use("/transport", auth, transportRoutes);
router.use("/parent", auth, parentRoutes);
router.use("/admin/parents", auth, adminParentsRoutes);

module.exports = router;

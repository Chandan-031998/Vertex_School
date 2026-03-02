const express = require("express");
const validate = require("../middleware/validate");
const { makeUploader } = require("../middleware/upload");
const upload = makeUploader("students");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

const { listRules, createStudentRules, idParam } = require("../validators/student.validators");
const { listStudents, listMyAssignedStudents, createStudent, getStudent, updateStudent, deleteStudent } = require("../controllers/students.controller");

const router = express.Router();

router.get("/", listRules, validate, listStudents);
router.get("/my/assigned", requireRole([ROLES.TEACHER]), listMyAssignedStudents);
router.post("/", requireRole([ROLES.ADMIN]), upload.array("documents", 6), createStudentRules, validate, createStudent);
router.get("/:id", idParam, validate, getStudent);
router.put("/:id", requireRole([ROLES.ADMIN]), upload.array("documents", 6), idParam, validate, updateStudent);
router.delete("/:id", requireRole([ROLES.ADMIN]), idParam, validate, deleteStudent);

module.exports = router;

import api from "./http";

export async function teacherDashboard() {
  const { data } = await api.get("/teacher/dashboard");
  return data;
}

export async function teacherClasses() {
  const { data } = await api.get("/teacher/classes");
  return data;
}

export async function teacherStudents(params = {}) {
  const { data } = await api.get("/teacher/students", { params });
  return data;
}

export async function teacherStudentById(id) {
  const { data } = await api.get(`/teacher/students/${id}`);
  return data;
}

export async function teacherUpdateStudentRemarks(id, payload) {
  const { data } = await api.put(`/teacher/students/${id}/remarks`, payload);
  return data;
}

export async function teacherAttendanceClassDate(params) {
  const { data } = await api.get("/teacher/attendance/class-date", { params });
  return data;
}

export async function teacherAttendanceMark(payload) {
  const { data } = await api.post("/teacher/attendance/mark", payload);
  return data;
}

export async function teacherAttendanceReport(params) {
  const { data } = await api.get("/teacher/attendance/report", { params });
  return data;
}

export function teacherAttendanceExportCsv(params) {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL}/teacher/attendance/report/export?${q}`;
}

export async function listTeacherHomework(params = {}) {
  const { data } = await api.get("/teacher/homework", { params });
  return data;
}

export async function createTeacherHomework(payload) {
  const { data } = await api.post("/teacher/homework", payload, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateTeacherHomework(id, payload) {
  const { data } = await api.put(`/teacher/homework/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function deleteTeacherHomework(id) {
  const { data } = await api.delete(`/teacher/homework/${id}`);
  return data;
}

export async function listTeacherExams(params = {}) {
  const { data } = await api.get("/teacher/exams", { params });
  return data;
}

export async function createTeacherExam(payload) {
  const { data } = await api.post("/teacher/exams", payload);
  return data;
}

export async function updateTeacherExam(id, payload) {
  const { data } = await api.put(`/teacher/exams/${id}`, payload);
  return data;
}

export async function deleteTeacherExam(id) {
  const { data } = await api.delete(`/teacher/exams/${id}`);
  return data;
}

export async function getTeacherExamMarks(id) {
  const { data } = await api.get(`/teacher/exams/${id}/marks`);
  return data;
}

export async function upsertTeacherExamMarks(id, payload) {
  const { data } = await api.post(`/teacher/exams/${id}/marks`, payload);
  return data;
}

export async function getTeacherTimetable() {
  const { data } = await api.get("/teacher/timetable");
  return data;
}

export async function sendTeacherMessage(payload) {
  const { data } = await api.post("/teacher/messages/send", payload);
  return data;
}

export async function getTeacherMessageHistory(params = {}) {
  const { data } = await api.get("/teacher/messages/history", { params });
  return data;
}

export async function getTeacherProfile() {
  const { data } = await api.get("/teacher/profile");
  return data;
}

export async function updateTeacherProfile(payload) {
  const { data } = await api.put("/teacher/profile", payload);
  return data;
}

export async function changeTeacherPassword(payload) {
  const { data } = await api.put("/teacher/change-password", payload);
  return data;
}

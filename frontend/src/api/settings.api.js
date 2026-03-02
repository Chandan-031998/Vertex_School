import api from "./http";

export async function getBranding() {
  const { data } = await api.get("/settings/branding");
  return data;
}
export async function putBranding(payload) {
  const { data } = await api.put("/settings/branding", payload);
  return data;
}
export async function uploadBrandingLogo(file) {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.post("/settings/branding/logo", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
export async function getSchool() {
  const { data } = await api.get("/settings/school");
  return data;
}
export async function putSchool(payload) {
  const { data } = await api.put("/settings/school", payload);
  return data;
}

export async function listAcademicYears() {
  const { data } = await api.get("/settings/academic-years");
  return data;
}
export async function createAcademicYear(payload) {
  const { data } = await api.post("/settings/academic-years", payload);
  return data;
}
export async function updateAcademicYear(id, payload) {
  const { data } = await api.put(`/settings/academic-years/${id}`, payload);
  return data;
}
export async function deleteAcademicYear(id) {
  const { data } = await api.delete(`/settings/academic-years/${id}`);
  return data;
}
export async function activateAcademicYear(id) {
  const { data } = await api.post(`/settings/academic-years/${id}/activate`);
  return data;
}

export async function listClasses() {
  const { data } = await api.get("/settings/classes");
  return data;
}
export async function createClass(payload) {
  const { data } = await api.post("/settings/classes", payload);
  return data;
}
export async function updateClass(id, payload) {
  const { data } = await api.put(`/settings/classes/${id}`, payload);
  return data;
}
export async function deleteClass(id) {
  const { data } = await api.delete(`/settings/classes/${id}`);
  return data;
}
export async function addSection(classId, payload) {
  const { data } = await api.post(`/settings/classes/${classId}/sections`, payload);
  return data;
}
export async function deleteSection(sectionId) {
  const { data } = await api.delete(`/settings/sections/${sectionId}`);
  return data;
}

export async function listSubjects(params = {}) {
  const { data } = await api.get("/settings/subjects", { params });
  return data;
}
export async function createSubject(payload) {
  const { data } = await api.post("/settings/subjects", payload);
  return data;
}
export async function updateSubject(id, payload) {
  const { data } = await api.put(`/settings/subjects/${id}`, payload);
  return data;
}
export async function deleteSubject(id) {
  const { data } = await api.delete(`/settings/subjects/${id}`);
  return data;
}

export async function listHolidays(params = {}) {
  const { data } = await api.get("/settings/holidays", { params });
  return data;
}
export async function createHoliday(payload) {
  const { data } = await api.post("/settings/holidays", payload);
  return data;
}
export async function updateHoliday(id, payload) {
  const { data } = await api.put(`/settings/holidays/${id}`, payload);
  return data;
}
export async function deleteHoliday(id) {
  const { data } = await api.delete(`/settings/holidays/${id}`);
  return data;
}

export async function getFeeSettings() {
  const { data } = await api.get("/settings/fees");
  return data;
}
export async function updateFeeSettings(payload) {
  const { data } = await api.put("/settings/fees", payload);
  return data;
}

export async function getAttendanceSettings() {
  const { data } = await api.get("/settings/attendance");
  return data;
}
export async function updateAttendanceSettings(payload) {
  const { data } = await api.put("/settings/attendance", payload);
  return data;
}

export async function getSecuritySettings() {
  const { data } = await api.get("/settings/security");
  return data;
}
export async function updateSecuritySettings(payload) {
  const { data } = await api.put("/settings/security", payload);
  return data;
}

export async function listRolePermissions() {
  const { data } = await api.get("/settings/roles");
  return data;
}
export async function listRolesCatalog() {
  const { data } = await api.get("/settings/roles/catalog");
  return data;
}
export async function updateRolePermissions(role, payload) {
  const { data } = await api.put(`/settings/roles/${role}/permissions`, payload);
  return data;
}

export async function listNotificationTemplates() {
  const { data } = await api.get("/settings/notification-templates");
  return data;
}
export async function createNotificationTemplate(payload) {
  const { data } = await api.post("/settings/notification-templates", payload);
  return data;
}
export async function updateNotificationTemplate(id, payload) {
  const { data } = await api.put(`/settings/notification-templates/${id}`, payload);
  return data;
}
export async function deleteNotificationTemplate(id) {
  const { data } = await api.delete(`/settings/notification-templates/${id}`);
  return data;
}

export async function listIntegrations() {
  const { data } = await api.get("/settings/integrations");
  return data;
}
export async function createIntegration(payload) {
  const { data } = await api.post("/settings/integrations", payload);
  return data;
}
export async function updateIntegration(id, payload) {
  const { data } = await api.put(`/settings/integrations/${id}`, payload);
  return data;
}
export async function deleteIntegration(id) {
  const { data } = await api.delete(`/settings/integrations/${id}`);
  return data;
}

export async function getAuditLogs(limit = 200) {
  const { data } = await api.get("/settings/audit-logs", { params: { limit } });
  return data;
}

export async function getSubscription() {
  const { data } = await api.get("/settings/subscription");
  return data;
}
export async function updateSubscription(payload) {
  const { data } = await api.put("/settings/subscription", payload);
  return data;
}

export async function getAiSettings() {
  const { data } = await api.get("/settings/ai");
  return data;
}
export async function updateAiSettings(payload) {
  const { data } = await api.put("/settings/ai", payload);
  return data;
}

export async function getFeatures() {
  const { data } = await api.get("/settings/features");
  return data;
}
export async function updateFeatures(payload) {
  const { data } = await api.put("/settings/features", payload);
  return data;
}

export async function listTimetables(params = {}) {
  const { data } = await api.get("/settings/timetables", { params });
  return data;
}
export async function createTimetable(payload) {
  const { data } = await api.post("/settings/timetables", payload);
  return data;
}
export async function updateTimetable(id, payload) {
  const { data } = await api.put(`/settings/timetables/${id}`, payload);
  return data;
}
export async function deleteTimetable(id) {
  const { data } = await api.delete(`/settings/timetables/${id}`);
  return data;
}

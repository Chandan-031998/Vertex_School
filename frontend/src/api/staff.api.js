import api from "./http";
export async function listStaff() {
  const { data } = await api.get("/staff");
  return data;
}
export async function createStaff(payload) {
  const { data } = await api.post("/staff", payload);
  return data;
}
export async function updateStaff(id, payload) {
  const { data } = await api.put(`/staff/${id}`, payload);
  return data;
}
export async function deleteStaff(id) {
  const { data } = await api.delete(`/staff/${id}`);
  return data;
}
export async function listActivityLogs(limit = 100) {
  const { data } = await api.get("/staff/activity", { params: { limit } });
  return data;
}
export async function assignTeacherClasses(staffId, assigned_classes) {
  const { data } = await api.put(`/staff/${staffId}/assign-classes`, { assigned_classes });
  return data;
}
export async function myAssignedClasses() {
  const { data } = await api.get("/staff/me/assigned-classes");
  return data;
}

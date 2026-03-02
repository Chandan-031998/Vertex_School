import api from "./http";
export async function markAttendance(payload) {
  const { data } = await api.post("/attendance/mark", payload);
  return data;
}
export async function monthlyAttendance(params) {
  const { data } = await api.get("/attendance/monthly", { params });
  return data;
}
export async function dailyAttendance(params) {
  const { data } = await api.get("/attendance/daily", { params });
  return data;
}
export async function updateAttendance(id, payload) {
  const { data } = await api.put(`/attendance/${id}`, payload);
  return data;
}
export async function deleteAttendance(id) {
  const { data } = await api.delete(`/attendance/${id}`);
  return data;
}
export function exportAttendanceCsv(params) {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL}/attendance/monthly/export?${q}`;
}

import api from "./http";
export async function classStrength(params) {
  const { data } = await api.get("/reports/class-strength", { params });
  return data;
}
export function exportStudentsCsv(params) {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL}/reports/students/export?${q}`;
}
export async function feeReport(params) {
  const { data } = await api.get("/reports/fees", { params });
  return data;
}
export async function attendanceReport(params) {
  const { data } = await api.get("/reports/attendance", { params });
  return data;
}

import api from "./http";
export async function adminDashboard() {
  const { data } = await api.get("/dashboard/admin");
  return data;
}
export async function staffDashboard() {
  const { data } = await api.get("/dashboard/staff");
  return data;
}

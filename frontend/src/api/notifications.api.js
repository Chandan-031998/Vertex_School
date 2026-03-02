import api from "./http";
export async function listNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}
export async function createNotification(payload) {
  const { data } = await api.post("/notifications", payload);
  return data;
}
export async function dispatchNotifications() {
  const { data } = await api.post("/notifications/dispatch");
  return data;
}
export async function updateNotification(id, payload) {
  const { data } = await api.put(`/notifications/${id}`, payload);
  return data;
}
export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
}

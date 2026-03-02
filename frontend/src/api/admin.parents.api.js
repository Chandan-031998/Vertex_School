import api from "./http";

export const listAdminParents = () => api.get("/admin/parents").then((r) => r.data);
export const createAdminParent = (payload) => api.post("/admin/parents", payload).then((r) => r.data);
export const getAdminParent = (id) => api.get(`/admin/parents/${id}`).then((r) => r.data);
export const updateAdminParent = (id, payload) => api.put(`/admin/parents/${id}`, payload).then((r) => r.data);
export const deleteAdminParent = (id) => api.delete(`/admin/parents/${id}`).then((r) => r.data);
export const resetAdminParentPassword = (id, payload) => api.post(`/admin/parents/${id}/reset-password`, payload).then((r) => r.data);

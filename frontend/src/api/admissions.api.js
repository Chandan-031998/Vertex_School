import api from "./http";

export async function submitAdmission(formData) {
  const { data } = await api.post("/admissions", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}
export async function listAdmissions(params={}) {
  const { data } = await api.get("/admissions", { params });
  return data;
}
export async function updateAdmissionStatus(id, status, remarks) {
  const { data } = await api.patch(`/admissions/${id}/status`, { status, remarks });
  return data;
}
export async function convertAdmission(id) {
  const { data } = await api.post(`/admissions/${id}/convert`);
  return data;
}

export async function createAdmissionAdmin(formData) {
  const { data } = await api.post("/admissions", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateAdmission(id, formData) {
  const { data } = await api.put(`/admissions/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function deleteAdmission(id) {
  const { data } = await api.delete(`/admissions/${id}`);
  return data;
}

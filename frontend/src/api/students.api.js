import api from "./http";

export async function listStudents(params={}) {
  const { data } = await api.get("/students", { params });
  return data;
}
export async function createStudent(payload) {
  const { data } = await api.post("/students", payload, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}
export async function updateStudent(id, payload) {
  const { data } = await api.put(`/students/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}
export async function deleteStudent(id) {
  const { data } = await api.delete(`/students/${id}`);
  return data;
}
export async function listMyAssignedStudents(params={}) {
  const { data } = await api.get("/students/my/assigned", { params });
  return data;
}

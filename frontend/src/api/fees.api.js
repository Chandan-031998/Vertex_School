import api from "./http";
export async function listFeeStructures() {
  const { data } = await api.get("/fees/structures");
  return data;
}
export async function createFeeStructure(payload) {
  const { data } = await api.post("/fees/structures", payload);
  return data;
}
export async function updateFeeStructure(id, payload) {
  const { data } = await api.put(`/fees/structures/${id}`, payload);
  return data;
}
export async function deleteFeeStructure(id) {
  const { data } = await api.delete(`/fees/structures/${id}`);
  return data;
}
export async function generateInvoice(payload) {
  const { data } = await api.post("/fees/invoices", payload);
  return data;
}
export async function listInvoices(params={}) {
  const { data } = await api.get("/fees/invoices", { params });
  return data;
}
export async function getInvoice(id) {
  const { data } = await api.get(`/fees/invoices/${id}`);
  return data;
}
export async function updateInvoice(id, payload) {
  const { data } = await api.put(`/fees/invoices/${id}`, payload);
  return data;
}
export async function deleteInvoice(id) {
  const { data } = await api.delete(`/fees/invoices/${id}`);
  return data;
}
export async function recordPayment(invoiceId, payload) {
  const { data } = await api.post(`/fees/invoices/${invoiceId}/pay`, payload);
  return data;
}
export async function updatePayment(paymentId, payload) {
  const { data } = await api.put(`/fees/payments/${paymentId}`, payload);
  return data;
}
export async function deletePayment(paymentId) {
  const { data } = await api.delete(`/fees/payments/${paymentId}`);
  return data;
}
export function exportFeeCsv(params) {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL}/fees/reports/export?${q}`;
}

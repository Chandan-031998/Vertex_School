import api from "./http";

export async function aiAssistantStatus() {
  const { data } = await api.get("/ai/assistant");
  return data;
}

export async function aiInsightsStatus() {
  const { data } = await api.get("/ai/insights");
  return data;
}

export async function aiReportsStatus() {
  const { data } = await api.get("/ai/reports");
  return data;
}

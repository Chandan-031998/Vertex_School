import axios from "axios";

const FALLBACK_API_URL = "https://vertex-school-oleu.vercel.app/api";

export function normalizeBaseUrl(raw) {
  const value = String(raw || FALLBACK_API_URL)
    .trim()
    .replace(/\/+$/, "");

  return /\/api$/i.test(value) ? value : `${value}/api`;
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("vsm_token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from "axios";

// Read VITE_API_URL and normalize to always end with /api
function normalizeBaseUrl(raw) {
  const fallback = "https://vertex-school.onrender.com/api";
  const v = (raw || fallback).trim().replace(/\/+$/, ""); // remove trailing /
  return v.endsWith("/api") ? v : `${v}/api`;
}

const baseURL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("vsm_token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
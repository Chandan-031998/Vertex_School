import axios from "axios";

// ✅ Use env in production, fallback to Render if env missing
const baseURL =
  import.meta.env.VITE_API_URL || "https://vertex-school.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("vsm_token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: handle auth expiry
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clear token on unauthorized
      localStorage.removeItem("vsm_token");
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default api;
const KEY = "vsm_token";
const USER = "vsm_user";

export function setAuth(token, user) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(USER, JSON.stringify(user));
}
export function getToken() {
  return localStorage.getItem(KEY);
}
export function getUser() {
  const v = localStorage.getItem(USER);
  try { return v ? JSON.parse(v) : null; } catch { return null; }
}
export function clearToken() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER);
}

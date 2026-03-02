const BRANDING_STORAGE_KEY = "vsm_branding";

export function getStoredBranding() {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredBranding(branding) {
  try {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding || {}));
  } catch {
    // no-op
  }
}

function hexToRgba(hex, alpha = 0.12) {
  const clean = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(48,48,200,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function applyBrandingTheme(branding = {}) {
  if (typeof document === "undefined") return;
  const primary = branding.primary_color || "#3030C8";
  const secondary = branding.secondary_color || "#2626B6";
  const fontFamily = branding.font_family || "system-ui";
  const soft = hexToRgba(primary, 0.12);
  document.documentElement.style.setProperty("--brand-primary", primary);
  document.documentElement.style.setProperty("--brand-secondary", secondary);
  document.documentElement.style.setProperty("--brand-soft", soft);
  document.documentElement.style.setProperty("--brand-font-family", fontFamily);
  document.body.style.fontFamily = fontFamily;
}

export function resolveBrandingAssetUrl(assetUrl) {
  const raw = String(assetUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const apiBase = String(import.meta.env.VITE_API_URL || "").trim();
  if (!apiBase) return raw;

  const withoutApiSuffix = apiBase.replace(/\/api\/?$/i, "");
  return `${withoutApiSuffix}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export { BRANDING_STORAGE_KEY };

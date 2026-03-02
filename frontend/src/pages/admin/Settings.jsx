import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getBranding, putBranding, uploadBrandingLogo } from "../../api/settings.api";
import { applyBrandingTheme, resolveBrandingAssetUrl, setStoredBranding } from "../../utils/branding";

const links = [
  { to: "/admin/settings/school-profile", label: "School Profile" },
  { to: "/admin/settings/academic-years", label: "Academic Years" },
  { to: "/admin/settings/classes", label: "Classes & Sections" },
  { to: "/admin/settings/subjects", label: "Subjects" },
  { to: "/admin/settings/timetable", label: "Timetable" },
  { to: "/admin/settings/holidays", label: "Holidays" },
  { to: "/admin/settings/policies", label: "Fee & Attendance Rules" },
  { to: "/admin/settings/roles-permissions", label: "Roles & Permissions" },
  { to: "/admin/settings/notification-templates", label: "Notification Templates" },
  { to: "/admin/settings/integrations", label: "Integrations" },
  { to: "/admin/settings/ai", label: "AI Settings" },
  { to: "/admin/settings/feature-flags", label: "Feature Flags" },
  { to: "/admin/settings/ai-capabilities", label: "AI Capabilities" },
  { to: "/admin/settings/audit-logs", label: "Audit Logs" },
  { to: "/admin/settings/subscription", label: "Subscription / Plan" }
];

export default function Settings() {
  const [branding, setBranding] = useState({
    product_name: "Vertex School Manager",
    logo_url: "",
    favicon_url: "",
    primary_color: "#3030C8",
    secondary_color: "#2626B6",
    font_family: "system-ui"
  });
  const [msg, setMsg] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getBranding();
        const data = res.data || {};
        setBranding((p) => ({ ...p, ...data, logo_url: data.logo_url || "" }));
        applyBrandingTheme(data);
        setStoredBranding(data);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const previewStyle = useMemo(() => ({
    borderColor: branding.primary_color || "#3030C8"
  }), [branding.primary_color]);

  function onChange(key, value) {
    const next = { ...branding, [key]: value };
    setBranding(next);
    if (key === "primary_color" || key === "secondary_color") {
      applyBrandingTheme(next);
      setStoredBranding(next);
    }
  }

  async function onSave() {
    try {
      const payload = {
        product_name: branding.product_name,
        logo_url: branding.logo_url || null,
        favicon_url: branding.favicon_url || null,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        font_family: branding.font_family || "system-ui"
      };
      await putBranding(payload);
      applyBrandingTheme(payload);
      setStoredBranding(payload);
      setMsg("Branding/theme updated");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save settings");
    }
  }

  async function onUploadLogo() {
    if (!logoFile) return;
    try {
      setUploading(true);
      const res = await uploadBrandingLogo(logoFile);
      const data = res.data || {};
      setBranding((prev) => ({ ...prev, ...data }));
      applyBrandingTheme(data);
      setStoredBranding(data);
      setMsg("Logo uploaded");
      setLogoFile(null);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}

      <Card title="Branding & Theme" className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={branding.product_name || ""} onChange={(e) => onChange("product_name", e.target.value)} placeholder="Product name" />
          <Input value={branding.logo_url || ""} onChange={(e) => onChange("logo_url", e.target.value)} placeholder="Logo URL" />
          <Input value={branding.favicon_url || ""} onChange={(e) => onChange("favicon_url", e.target.value)} placeholder="Favicon URL" />

          <div className="space-y-1">
            <label className="text-xs text-slate-600">Primary color</label>
            <Input type="color" value={branding.primary_color || "#3030C8"} onChange={(e) => onChange("primary_color", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Secondary color</label>
            <Input type="color" value={branding.secondary_color || "#2626B6"} onChange={(e) => onChange("secondary_color", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Font family</label>
            <Input value={branding.font_family || ""} onChange={(e) => onChange("font_family", e.target.value)} placeholder="system-ui" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
          <Button type="button" onClick={onUploadLogo} disabled={!logoFile || uploading}>
            {uploading ? "Uploading..." : "Upload Logo"}
          </Button>
        </div>

        <div className="mt-4">
          <Button onClick={onSave}>Save Branding</Button>
        </div>

        <div className="mt-6 rounded-xl border p-4" style={previewStyle}>
          <div className="text-xs text-slate-500 mb-2">Preview</div>
          <div className="flex items-center gap-3">
            {branding.logo_url ? <img src={resolveBrandingAssetUrl(branding.logo_url)} alt="logo" className="h-10 w-10 rounded object-cover border border-slate-200" /> : null}
            <div>
              <div className="font-bold" style={{ color: branding.primary_color }}>{branding.product_name || "Product Name"}</div>
              <div className="text-sm" style={{ color: branding.secondary_color }}>{branding.font_family || "Font Family"}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="System Settings">
        <div className="grid gap-3 md:grid-cols-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}

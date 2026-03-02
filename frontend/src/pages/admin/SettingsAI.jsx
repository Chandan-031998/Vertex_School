import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { getAiSettings, updateAiSettings } from "../../api/settings.api";

export default function SettingsAI() {
  const [form, setForm] = useState({ enabled: false, provider: "mock", model: "", quota_json: "{}" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getAiSettings().then((r) => {
      const d = r.data || {};
      setForm({ enabled: !!d.enabled, provider: d.provider || "mock", model: d.model || "", quota_json: JSON.stringify(d.quota_json || {}) });
    }).catch(() => null);
  }, []);

  async function onSave() {
    await updateAiSettings({
      enabled: !!form.enabled,
      provider: form.provider,
      model: form.model,
      quota_json: JSON.parse(form.quota_json || "{}")
    });
    setMsg("AI settings updated");
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="AI Settings">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />Enabled</label>
          <Select value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}><option>mock</option><option>openai</option><option>azure</option><option>local</option></Select>
          <Input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="Model" />
          <Input value={form.quota_json} onChange={(e) => setForm((p) => ({ ...p, quota_json: e.target.value }))} placeholder='{"monthly_tokens":100000}' />
        </div>
        <Button className="mt-4" onClick={onSave}>Save AI Settings</Button>
      </Card>
    </DashboardLayout>
  );
}

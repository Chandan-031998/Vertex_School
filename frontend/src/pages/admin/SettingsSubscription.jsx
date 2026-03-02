import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { getSubscription, updateSubscription } from "../../api/settings.api";

export default function SettingsSubscription() {
  const [form, setForm] = useState({ plan: "BASIC", status: "ACTIVE", start_date: "", end_date: "", limits_json: "{}" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSubscription().then((r) => {
      const d = r.data || {};
      setForm({
        plan: d.plan || "BASIC",
        status: d.status || "ACTIVE",
        start_date: d.start_date || "",
        end_date: d.end_date || "",
        limits_json: JSON.stringify(d.limits_json || {})
      });
    }).catch(() => null);
  }, []);

  async function onSave() {
    await updateSubscription({
      plan: form.plan,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      limits_json: JSON.parse(form.limits_json || "{}")
    });
    setMsg("Subscription updated");
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="Subscription / Plan">
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={form.plan} onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}><option>BASIC</option><option>PRO</option><option>ENTERPRISE</option></Select>
          <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><option>ACTIVE</option><option>EXPIRED</option></Select>
          <Input type="date" value={form.start_date || ""} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
          <Input type="date" value={form.end_date || ""} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
          <Input value={form.limits_json} onChange={(e) => setForm((p) => ({ ...p, limits_json: e.target.value }))} placeholder='{"users":50}' />
        </div>
        <Button className="mt-4" onClick={onSave}>Save Subscription</Button>
      </Card>
    </DashboardLayout>
  );
}

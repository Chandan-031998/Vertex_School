import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getSchool, putSchool } from "../../api/settings.api";

export default function SettingsSchoolProfile() {
  const [form, setForm] = useState({ school_name: "", address: "", phone: "", email: "", website: "", principal_name: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSchool().then((r) => setForm((p) => ({ ...p, ...(r.data || {}) }))).catch(() => null);
  }, []);

  async function onSave() {
    await putSchool(form);
    setMsg("School profile updated");
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="School Profile">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={form.school_name || ""} onChange={(e) => setForm((p) => ({ ...p, school_name: e.target.value }))} placeholder="School name" />
          <Input value={form.principal_name || ""} onChange={(e) => setForm((p) => ({ ...p, principal_name: e.target.value }))} placeholder="Principal name" />
          <Input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <Input value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
          <Input value={form.website || ""} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="Website" />
          <Input value={form.address || ""} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
        </div>
        <Button className="mt-4" onClick={onSave}>Save School Profile</Button>
      </Card>
    </DashboardLayout>
  );
}

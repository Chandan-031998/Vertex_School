import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { parentMe, updateParentSettings } from "../../api/parent.api";

export default function ParentSettings() {
  const [form, setForm] = useState({
    phone: "",
    address: "",
    preferred_language: "en",
    notification_preferences_json: { email: true, sms: true, whatsapp: false }
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    parentMe().then((res) => {
      const p = res.data?.profile || {};
      setForm({
        phone: p.phone || "",
        address: p.address || "",
        preferred_language: p.preferred_language || "en",
        notification_preferences_json: p.notification_preferences_json || { email: true, sms: true, whatsapp: false }
      });
    });
  }, []);

  async function onSave() {
    try {
      await updateParentSettings(form);
      setMsg("Settings updated");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed");
    }
  }

  return (
    <ParentLayout>
      {msg ? <div className="mb-4 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div> : null}
      <Card title="Settings">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
          <Select value={form.preferred_language} onChange={(e) => setForm((p) => ({ ...p, preferred_language: e.target.value }))}>
            <option value="en">English</option>
            <option value="kn">Kannada</option>
          </Select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notification_preferences_json.email} onChange={(e) => setForm((p) => ({ ...p, notification_preferences_json: { ...p.notification_preferences_json, email: e.target.checked } }))} />Email notifications</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notification_preferences_json.sms} onChange={(e) => setForm((p) => ({ ...p, notification_preferences_json: { ...p.notification_preferences_json, sms: e.target.checked } }))} />SMS notifications</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notification_preferences_json.whatsapp} onChange={(e) => setForm((p) => ({ ...p, notification_preferences_json: { ...p.notification_preferences_json, whatsapp: e.target.checked } }))} />WhatsApp notifications</label>
        </div>
        <Button className="mt-3" onClick={onSave}>Save</Button>
      </Card>
    </ParentLayout>
  );
}

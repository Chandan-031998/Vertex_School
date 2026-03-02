import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { createNotificationTemplate, deleteNotificationTemplate, listNotificationTemplates, updateNotificationTemplate } from "../../api/settings.api";

export default function SettingsNotificationTemplates() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ key: "", subject: "", body: "", channel: "EMAIL", language: "en" });
  const [editing, setEditing] = useState(null);

  async function load() {
    const res = await listNotificationTemplates();
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    await createNotificationTemplate(form);
    setForm({ key: "", subject: "", body: "", channel: "EMAIL", language: "en" });
    await load();
  }

  async function onUpdate() {
    await updateNotificationTemplate(editing.id, editing);
    setEditing(null);
    await load();
  }

  async function onDelete(id) {
    await deleteNotificationTemplate(id);
    await load();
  }

  const cols = useMemo(() => ([
    { key: "key", label: "Key", render: (r) => (editing?.id === r.id ? <Input value={editing.key} onChange={(e) => setEditing((p) => ({ ...p, key: e.target.value }))} /> : r.key) },
    { key: "channel", label: "Channel", render: (r) => (editing?.id === r.id ? <Select value={editing.channel} onChange={(e) => setEditing((p) => ({ ...p, channel: e.target.value }))}><option>EMAIL</option><option>SMS</option><option>WHATSAPP</option></Select> : r.channel) },
    { key: "language", label: "Lang", render: (r) => (editing?.id === r.id ? <Input value={editing.language} onChange={(e) => setEditing((p) => ({ ...p, language: e.target.value }))} /> : r.language) },
    { key: "subject", label: "Subject", render: (r) => (editing?.id === r.id ? <Input value={editing.subject || ""} onChange={(e) => setEditing((p) => ({ ...p, subject: e.target.value }))} /> : (r.subject || "-")) },
    { key: "body", label: "Body", render: (r) => (editing?.id === r.id ? <Input value={editing.body} onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))} /> : r.body) },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        {editing?.id === r.id ? <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={onUpdate}>Update</Button> : <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditing({ ...r })}>Edit</Button>}
        {editing?.id === r.id ? <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditing(null)}>Cancel</Button> : null}
        <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
      </div>
    ) }
  ]), [editing]);

  return (
    <DashboardLayout>
      <Card title="Create Notification Template" className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onCreate}>
          <Input value={form.key} onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))} placeholder="FEE_REMINDER" />
          <Select value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}><option>EMAIL</option><option>SMS</option><option>WHATSAPP</option></Select>
          <Input value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))} placeholder="en" />
          <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" />
          <Input value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Body" />
          <Button type="submit">Create</Button>
        </form>
      </Card>
      <Card title="Notification Templates"><Table columns={cols} rows={rows} /></Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { createNotification, deleteNotification, listNotifications, updateNotification } from "../../api/notifications.api";

const initialForm = {
  student_id: "",
  type: "FEE_REMINDER",
  title: "",
  message: "",
  channel: "IN_APP",
  scheduled_at: ""
};

function statusTone(status) {
  if (status === "SENT") return "green";
  if (status === "FAILED") return "red";
  return "yellow";
}

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await listNotifications();
    setRows(res.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        student_id: form.student_id ? Number(form.student_id) : undefined,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined
      };
      if (editingId) await updateNotification(editingId, payload);
      else await createNotification(payload);
      setForm(initialForm);
      setEditingId(null);
      await load();
    } finally {
      setCreating(false);
    }
  }

  function onEdit(row) {
    setEditingId(row.id);
    setForm({
      student_id: row.student_id || "",
      type: row.type || "FEE_REMINDER",
      title: row.title || "",
      message: row.message || "",
      channel: row.channel || "IN_APP",
      scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString().slice(0, 16) : ""
    });
  }

  async function onDelete(id) {
    await deleteNotification(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await load();
  }

  const columns = useMemo(() => ([
    { key: "id", label: "ID" },
    { key: "type", label: "Type" },
    { key: "title", label: "Title" },
    { key: "channel", label: "Channel" },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={editingId ? "Update Reminder" : "Create Reminder"}>
          <form className="space-y-3" onSubmit={onCreate}>
            <Input value={form.student_id} onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))} placeholder="Student ID (optional)" />
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="FEE_REMINDER">FEE_REMINDER</option>
              <option value="GENERAL">GENERAL</option>
            </Select>
            <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" />
            <Input required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Message" />
            <Select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>
              <option value="IN_APP">IN_APP</option>
              <option value="EMAIL">EMAIL</option>
            </Select>
            <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} />
            <div className="flex gap-2">
              <Button className="flex-1" disabled={creating}>{creating ? "Saving..." : editingId ? "Update" : "Create"}</Button>
              {editingId ? (
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setEditingId(null); setForm(initialForm); }}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Notification Queue" className="lg:col-span-2">
          <Table columns={columns} rows={rows} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

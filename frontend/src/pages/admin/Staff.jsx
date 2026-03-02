import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { createStaff, deleteStaff, listActivityLogs, listStaff, updateStaff } from "../../api/staff.api";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  role: "TEACHER",
  designation: "",
  phone: "",
  assigned_classes: ""
};

export default function Staff() {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [staffRes, logsRes] = await Promise.all([listStaff(), listActivityLogs(80)]);
      setRows(staffRes.data || []);
      setLogs(logsRes.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function onCreateOrUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_classes: form.assigned_classes
          ? form.assigned_classes.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
            const [class_name, section] = s.split("-").map((v) => v.trim());
            return { class_name, section };
          })
          : []
      };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await updateStaff(editingId, payload);
      } else {
        await createStaff(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  function onEdit(row) {
    setEditingId(row.id);
    setForm({
      full_name: row.full_name || "",
      email: row.email || "",
      password: "",
      role: row.role || "TEACHER",
      designation: row.designation || "",
      phone: row.phone || "",
      assigned_classes: Array.isArray(row.assigned_classes)
        ? row.assigned_classes.map((c) => `${c.class_name}-${c.section}`).join(", ")
        : ""
    });
  }

  async function onDelete(id) {
    await deleteStaff(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(() => ([
    { key: "employee_code", label: "Code" },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "designation", label: "Designation" },
    { key: "phone", label: "Phone" },
    {
      key: "assigned_classes",
      label: "Assigned Classes",
      render: (r) => Array.isArray(r.assigned_classes) ? r.assigned_classes.map((c) => `${c.class_name}-${c.section}`).join(", ") : ""
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Disable</Button>
        </div>
      )
    }
  ]), []);

  const logColumns = useMemo(() => ([
    { key: "created_at", label: "When", render: (r) => new Date(r.created_at).toLocaleString() },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
    { key: "entity_id", label: "Entity ID" }
  ]), []);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={editingId ? "Update Staff" : "Create Staff"} className="lg:col-span-1">
          <form className="space-y-3" onSubmit={onCreateOrUpdate}>
            <Input required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
            <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" />
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editingId ? "New password (optional)" : "Password (min 6)"} required={!editingId} />
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="ADMIN">ADMIN</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
            </Select>
            <Input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} placeholder="Designation" />
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
            <Input value={form.assigned_classes} onChange={(e) => setForm((f) => ({ ...f, assigned_classes: e.target.value }))} placeholder="Assigned classes (e.g., 10-A, 10-B)" />
            <div className="flex gap-2">
              <Button disabled={saving} className="flex-1">{saving ? "Saving..." : editingId ? "Update" : "Create"}</Button>
              {editingId ? <Button type="button" variant="secondary" className="flex-1" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</Button> : null}
            </div>
          </form>
        </Card>

        <Card title="Staff Directory" className="lg:col-span-2">
          <div className="mb-3 text-xs text-slate-500">{loading ? "Loading staff..." : `${rows.length} staff records`}</div>
          <Table columns={columns} rows={rows} />
        </Card>
      </div>

      <Card title="Activity Logs" className="mt-4">
        <Table columns={logColumns} rows={logs} />
      </Card>
    </DashboardLayout>
  );
}

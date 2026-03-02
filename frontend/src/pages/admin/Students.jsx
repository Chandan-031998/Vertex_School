import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { createStudent, deleteStudent, listStudents, updateStudent } from "../../api/students.api";

const initialForm = {
  full_name: "",
  class_name: "",
  section: "",
  roll_no: "",
  parent_name: "",
  parent_phone: "",
  dob: "",
  gender: "",
  address: ""
};

function toFormData(values) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") fd.append(k, v);
  });
  return fd;
}

export default function Students() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await listStudents({ q, class_name: cls || undefined, section: sec || undefined });
    setRows(res.data || []);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toFormData(form);
      if (editingId) await updateStudent(editingId, payload);
      else await createStudent(payload);
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
      class_name: row.class_name || "",
      section: row.section || "",
      roll_no: row.roll_no || "",
      parent_name: row.parent_name || "",
      parent_phone: row.parent_phone || "",
      dob: row.dob || "",
      gender: row.gender || "",
      address: row.address || ""
    });
  }

  async function onRemove(id) {
    await deleteStudent(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await load();
  }

  useEffect(() => { load(); }, []); // initial

  const columns = useMemo(() => ([
    { key: "admission_no", label: "Admission No" },
    { key: "full_name", label: "Name" },
    { key: "class_name", label: "Class" },
    { key: "section", label: "Section" },
    { key: "parent_phone", label: "Parent Phone" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onRemove(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={editingId ? "Update Student" : "Add Student"} className="lg:col-span-1">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
            <Input required value={form.class_name} onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))} placeholder="Class" />
            <Input required value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} placeholder="Section" />
            <Input value={form.roll_no} onChange={(e) => setForm((f) => ({ ...f, roll_no: e.target.value }))} placeholder="Roll no" />
            <Input value={form.parent_name} onChange={(e) => setForm((f) => ({ ...f, parent_name: e.target.value }))} placeholder="Parent name" />
            <Input value={form.parent_phone} onChange={(e) => setForm((f) => ({ ...f, parent_phone: e.target.value }))} placeholder="Parent phone" />
            <Input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
            <Select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
              <option value="">Gender (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Address" />
            <div className="flex gap-2">
              <Button className="flex-1" disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Add"}</Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => { setEditingId(null); setForm(initialForm); }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Students" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name..." />
            <Input value={cls} onChange={(e)=>setCls(e.target.value)} placeholder="Class (e.g., 10)" />
            <Input value={sec} onChange={(e)=>setSec(e.target.value)} placeholder="Section (e.g., A)" />
            <Button onClick={load}>Search</Button>
          </div>

          <Table columns={columns} rows={rows} />
          <div className="mt-3 text-xs text-slate-500">Delete action deactivates the student record.</div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

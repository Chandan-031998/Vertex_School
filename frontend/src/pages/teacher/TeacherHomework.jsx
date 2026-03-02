import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { createTeacherHomework, deleteTeacherHomework, listTeacherHomework, teacherClasses, updateTeacherHomework } from "../../api/teacher.api";

function toFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    fd.append(k, v);
  });
  if (payload.attachments?.length) {
    payload.attachments.forEach((f) => fd.append("attachments", f));
  }
  return fd;
}

export default function TeacherHomework() {
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", description: "", due_date: "", attachments: [] });

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    }).catch(() => setClasses([]));
  }, []);

  async function load() {
    const [class_name, section] = (classSection || "__").split("__");
    const res = await listTeacherHomework({ class_name: class_name || undefined, section: section || undefined });
    setRows(res.data || []);
  }
  useEffect(() => { if (classSection) load(); }, [classSection]);

  async function onSubmit(e) {
    e.preventDefault();
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section) return;
    const payload = { ...form, class_name, section };
    try {
      if (editingId) {
        await updateTeacherHomework(editingId, toFormData(payload));
        setMsg("Homework updated");
      } else {
        await createTeacherHomework(toFormData(payload));
        setMsg("Homework created");
      }
      setEditingId(null);
      setForm({ title: "", description: "", due_date: "", attachments: [] });
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save homework");
    }
  }

  async function onDelete(id) {
    await deleteTeacherHomework(id);
    await load();
  }

  function onEdit(row) {
    setEditingId(row.id);
    setForm({ title: row.title || "", description: row.description || "", due_date: row.due_date || "", attachments: [] });
    setClassSection(`${row.class_name}__${row.section}`);
  }

  const cols = useMemo(() => ([
    { key: "title", label: "Title" },
    { key: "class", label: "Class", render: (r) => `${r.class_name}-${r.section}` },
    { key: "due_date", label: "Due Date", render: (r) => r.due_date || "-" },
    { key: "description", label: "Description", render: (r) => r.description || "-" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title={editingId ? "Update Homework" : "Create Homework"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onSubmit}>
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Select class-section</option>
            {classes.map((c, idx) => <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>{c.class_name}-{c.section}</option>)}
          </Select>
          <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" required />
          <Input type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
          <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
          <Input type="file" multiple onChange={(e) => setForm((p) => ({ ...p, attachments: Array.from(e.target.files || []) }))} />
          <Button type="submit">{editingId ? "Update" : "Create"}</Button>
        </form>
      </Card>
      <Card title="Homework List">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

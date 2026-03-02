import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import {
  convertAdmission,
  createAdmissionAdmin,
  deleteAdmission,
  listAdmissions,
  updateAdmission,
  updateAdmissionStatus
} from "../../api/admissions.api";

function statusTone(status) {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "yellow";
}

const initialForm = {
  full_name: "",
  applying_class: "",
  section: "",
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

export default function Admissions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await listAdmissions({ q: q || undefined, status: status || undefined });
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toFormData(form);
      if (editingId) await updateAdmission(editingId, payload);
      else await createAdmissionAdmin(payload);
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
      applying_class: row.applying_class || "",
      section: row.section || "",
      parent_name: row.parent_name || "",
      parent_phone: row.parent_phone || "",
      dob: row.dob || "",
      gender: row.gender || "",
      address: row.address || ""
    });
  }

  async function onRemove(id) {
    await deleteAdmission(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
    }
    await load();
  }

  async function onStatus(id, nextStatus) {
    await updateAdmissionStatus(id, nextStatus, remarks[id] || "");
    await load();
  }

  async function onConvert(id) {
    await convertAdmission(id);
    await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(() => ([
    { key: "application_no", label: "Application No" },
    { key: "full_name", label: "Student" },
    { key: "applying_class", label: "Applying Class" },
    { key: "parent_name", label: "Parent" },
    { key: "parent_phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onRemove(r.id)}>Delete</Button>
          {r.status === "PENDING" ? (
            <Input
              className="w-44"
              value={remarks[r.id] || ""}
              onChange={(e) => setRemarks((m) => ({ ...m, [r.id]: e.target.value }))}
              placeholder="Remarks"
            />
          ) : null}
          {r.status === "PENDING" ? (
            <>
              <Button className="px-2 py-1 text-xs" onClick={() => onStatus(r.id, "APPROVED")}>Approve</Button>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onStatus(r.id, "REJECTED")}>Reject</Button>
            </>
          ) : null}
          {r.status === "APPROVED" ? (
            <Button className="px-2 py-1 text-xs" onClick={() => onConvert(r.id)}>Convert</Button>
          ) : null}
        </div>
      )
    }
  ]), [remarks]);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={editingId ? "Update Admission" : "Add Admission"} className="lg:col-span-1">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Student full name" />
            <Input required value={form.applying_class} onChange={(e) => setForm((f) => ({ ...f, applying_class: e.target.value }))} placeholder="Applying class" />
            <Input value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} placeholder="Section" />
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

        <Card title="Admissions" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student name" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Search"}</Button>
          </div>
          <Table columns={columns} rows={rows} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { activateAcademicYear, createAcademicYear, deleteAcademicYear, listAcademicYears, updateAcademicYear } from "../../api/settings.api";

export default function SettingsAcademicYears() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", start_date: "", end_date: "", is_active: false });

  async function load() {
    setLoading(true);
    try {
      const res = await listAcademicYears();
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setMsg("");
    try {
      await createAcademicYear({ name, start_date: startDate, end_date: endDate, is_active: isActive });
      setName("");
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      setMsg("Academic year created");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to create");
    }
  }

  async function onActivate(id) {
    await activateAcademicYear(id);
    await load();
  }

  async function onDelete(id) {
    await deleteAcademicYear(id);
    await load();
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditForm({
      name: row.name || "",
      start_date: row.start_date || "",
      end_date: row.end_date || "",
      is_active: !!row.is_active
    });
  }

  async function onUpdate() {
    await updateAcademicYear(editingId, editForm);
    setEditingId(null);
    await load();
  }

  const columns = useMemo(() => ([
    {
      key: "name",
      label: "Name",
      render: (r) => editingId === r.id ? <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} /> : r.name
    },
    {
      key: "start_date",
      label: "Start",
      render: (r) => editingId === r.id ? <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm((p) => ({ ...p, start_date: e.target.value }))} /> : r.start_date
    },
    {
      key: "end_date",
      label: "End",
      render: (r) => editingId === r.id ? <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm((p) => ({ ...p, end_date: e.target.value }))} /> : r.end_date
    },
    {
      key: "is_active",
      label: "Active",
      render: (r) => editingId === r.id
        ? <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
        : (r.is_active ? "YES" : "NO")
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {editingId === r.id ? (
            <>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={onUpdate}>Update</Button>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
            </>
          ) : (
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => startEdit(r)}>Edit</Button>
          )}
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onActivate(r.id)} disabled={r.is_active}>Activate</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), [editingId, editForm]);

  return (
    <DashboardLayout>
      <Card title="Academic Years" className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onCreate}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="2025-26" />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active</label>
          <Button type="submit">Create</Button>
        </form>
        {msg ? <div className="text-sm text-slate-600 mt-3">{msg}</div> : null}
      </Card>
      <Card title={loading ? "Loading..." : "Academic Year List"}>
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

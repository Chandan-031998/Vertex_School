import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { createVehicle, deleteVehicle, listVehicles, updateVehicle } from "../../../api/transport.api";

const initial = { bus_no: "", registration_no: "", capacity: "", status: "ACTIVE", insurance_expiry: "", fitness_expiry: "" };

export default function AdminTransportVehicles() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await listVehicles();
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, capacity: Number(form.capacity) };
    try {
      if (editingId) await updateVehicle(editingId, payload);
      else await createVehicle(payload);
      setForm(initial);
      setEditingId(null);
      setMsg("Saved");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed");
    }
  }

  function onEdit(r) {
    setEditingId(r.id);
    setForm({
      bus_no: r.bus_no || "",
      registration_no: r.registration_no || "",
      capacity: String(r.capacity || ""),
      status: r.status || "ACTIVE",
      insurance_expiry: r.insurance_expiry || "",
      fitness_expiry: r.fitness_expiry || ""
    });
  }

  const cols = useMemo(() => ([
    { key: "bus_no", label: "Bus No" },
    { key: "registration_no", label: "Registration" },
    { key: "capacity", label: "Capacity" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteVehicle(r.id); await load(); }}>Deactivate</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-3 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div> : null}
      <Card title={editingId ? "Update Vehicle" : "Create Vehicle"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <Input value={form.bus_no} onChange={(e) => setForm((p) => ({ ...p, bus_no: e.target.value }))} placeholder="Bus no" required />
          <Input value={form.registration_no} onChange={(e) => setForm((p) => ({ ...p, registration_no: e.target.value }))} placeholder="Registration no" required />
          <Input type="number" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} placeholder="Capacity" required />
          <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          <Input type="date" value={form.insurance_expiry} onChange={(e) => setForm((p) => ({ ...p, insurance_expiry: e.target.value }))} />
          <Input type="date" value={form.fitness_expiry} onChange={(e) => setForm((p) => ({ ...p, fitness_expiry: e.target.value }))} />
          <Button type="submit">{editingId ? "Update" : "Create"}</Button>
        </form>
      </Card>
      <Card title="Vehicles">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

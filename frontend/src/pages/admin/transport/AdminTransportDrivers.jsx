import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { createDriver, deleteDriver, listDrivers, updateDriver } from "../../../api/transport.api";

const initial = { full_name: "", phone: "", license_no: "", license_expiry: "", type: "DRIVER", status: "ACTIVE" };

export default function AdminTransportDrivers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);
  const [editId, setEditId] = useState(null);

  async function load() {
    const res = await listDrivers();
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    if (editId) await updateDriver(editId, form);
    else await createDriver(form);
    setForm(initial);
    setEditId(null);
    await load();
  }

  const cols = useMemo(() => ([
    { key: "full_name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "license_no", label: "License" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => { setEditId(r.id); setForm(r); }}>Edit</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteDriver(r.id); await load(); }}>Deactivate</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      <Card title={editId ? "Update Driver/Attendant" : "Create Driver/Attendant"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-6" onSubmit={save}>
          <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Full name" required />
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" required />
          <Input value={form.license_no} onChange={(e) => setForm((p) => ({ ...p, license_no: e.target.value }))} placeholder="License no" required />
          <Input type="date" value={form.license_expiry || ""} onChange={(e) => setForm((p) => ({ ...p, license_expiry: e.target.value }))} />
          <Select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            <option value="DRIVER">DRIVER</option>
            <option value="ATTENDANT">ATTENDANT</option>
          </Select>
          <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          <Button type="submit">{editId ? "Update" : "Create"}</Button>
        </form>
      </Card>
      <Card title="Drivers & Attendants">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { createAssignment, deleteAssignment, listAssignments, listDrivers, listRoutes, listVehicles } from "../../../api/transport.api";

const initial = { vehicle_id: "", route_id: "", driver_id: "", attendant_id: "" };

export default function AdminTransportAssignments() {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initial);

  async function load() {
    const [a, v, r, d] = await Promise.all([listAssignments(), listVehicles(), listRoutes(), listDrivers()]);
    setRows(a.data || []);
    setVehicles(v.data || []);
    setRoutes(r.data || []);
    setDrivers(d.data || []);
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    await createAssignment({
      vehicle_id: Number(form.vehicle_id),
      route_id: Number(form.route_id),
      driver_id: Number(form.driver_id),
      attendant_id: form.attendant_id ? Number(form.attendant_id) : null
    });
    setForm(initial);
    await load();
  }

  const cols = useMemo(() => ([
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.bus_no || "-" },
    { key: "route", label: "Route", render: (r) => r.route?.route_name || "-" },
    { key: "driver", label: "Driver", render: (r) => r.driver?.full_name || "-" },
    { key: "attendant", label: "Attendant", render: (r) => r.attendant?.full_name || "-" },
    { key: "active", label: "Active", render: (r) => String(!!r.active) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteAssignment(r.id); await load(); }}>Deactivate</Button>
    }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="Create Assignment" className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onCreate}>
          <Select value={form.vehicle_id} onChange={(e) => setForm((p) => ({ ...p, vehicle_id: e.target.value }))}>
            <option value="">Vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.bus_no}</option>)}
          </Select>
          <Select value={form.route_id} onChange={(e) => setForm((p) => ({ ...p, route_id: e.target.value }))}>
            <option value="">Route</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
          </Select>
          <Select value={form.driver_id} onChange={(e) => setForm((p) => ({ ...p, driver_id: e.target.value }))}>
            <option value="">Driver</option>
            {drivers.filter((d) => d.type === "DRIVER").map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </Select>
          <Select value={form.attendant_id} onChange={(e) => setForm((p) => ({ ...p, attendant_id: e.target.value }))}>
            <option value="">Attendant (optional)</option>
            {drivers.filter((d) => d.type === "ATTENDANT").map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </Select>
          <Button type="submit">Assign</Button>
        </form>
      </Card>
      <Card title="Assignments">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { createAllocation, deleteAllocation, listAllocations, listRoutes, listVehicles } from "../../../api/transport.api";
import { listStudents } from "../../../api/students.api";

export default function AdminTransportAllocations() {
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeRows, setRouteRows] = useState([]);
  const [filters, setFilters] = useState({ class_name: "", section: "", q: "" });
  const [form, setForm] = useState({
    student_id: "",
    route_id: "",
    stop_id: "",
    vehicle_id: "",
    pickup_enabled: true,
    drop_enabled: true,
    monthly_fee: ""
  });

  async function loadBase() {
    const [r, v, s] = await Promise.all([listRoutes(), listVehicles(), listStudents()]);
    setRouteRows(r.data || []);
    setRoutes(r.data || []);
    setVehicles(v.data || []);
    setStudents(s.data || []);
  }
  async function loadAllocations() {
    const res = await listAllocations(filters);
    setRows(res.data || []);
  }
  useEffect(() => { loadBase(); loadAllocations(); }, []);

  useEffect(() => {
    const route = routeRows.find((r) => Number(r.id) === Number(form.route_id));
    setStops(route?.stops || []);
  }, [form.route_id, routeRows]);

  async function onCreate(e) {
    e.preventDefault();
    await createAllocation({
      student_id: Number(form.student_id),
      route_id: Number(form.route_id),
      stop_id: Number(form.stop_id),
      vehicle_id: Number(form.vehicle_id),
      pickup_enabled: !!form.pickup_enabled,
      drop_enabled: !!form.drop_enabled,
      monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : null
    });
    setForm({ student_id: "", route_id: "", stop_id: "", vehicle_id: "", pickup_enabled: true, drop_enabled: true, monthly_fee: "" });
    await loadAllocations();
  }

  const cols = useMemo(() => ([
    { key: "student", label: "Student", render: (r) => r.student?.full_name || "-" },
    { key: "class", label: "Class", render: (r) => `${r.student?.class_name || "-"}-${r.student?.section || "-"}` },
    { key: "route", label: "Route", render: (r) => r.route?.route_name || "-" },
    { key: "stop", label: "Stop", render: (r) => r.stop?.stop_name || "-" },
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.bus_no || "-" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteAllocation(r.id); await loadAllocations(); }}>Cancel</Button>
    }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="Filters" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input value={filters.class_name} onChange={(e) => setFilters((p) => ({ ...p, class_name: e.target.value }))} placeholder="Class" />
          <Input value={filters.section} onChange={(e) => setFilters((p) => ({ ...p, section: e.target.value }))} placeholder="Section" />
          <Input value={filters.q} onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))} placeholder="Search" />
          <Button onClick={loadAllocations}>Apply</Button>
        </div>
      </Card>
      <Card title="Allocate Student Transport" className="mb-4">
        <form className="grid gap-3 md:grid-cols-7" onSubmit={onCreate}>
          <Select value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}>
            <option value="">Student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name}-{s.section})</option>)}
          </Select>
          <Select value={form.route_id} onChange={(e) => setForm((p) => ({ ...p, route_id: e.target.value, stop_id: "" }))}>
            <option value="">Route</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
          </Select>
          <Select value={form.stop_id} onChange={(e) => setForm((p) => ({ ...p, stop_id: e.target.value }))}>
            <option value="">Stop</option>
            {stops.map((s) => <option key={s.id} value={s.id}>{s.stop_name}</option>)}
          </Select>
          <Select value={form.vehicle_id} onChange={(e) => setForm((p) => ({ ...p, vehicle_id: e.target.value }))}>
            <option value="">Vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.bus_no}</option>)}
          </Select>
          <Input type="number" value={form.monthly_fee} onChange={(e) => setForm((p) => ({ ...p, monthly_fee: e.target.value }))} placeholder="Monthly fee" />
          <Button type="submit">Assign</Button>
        </form>
      </Card>
      <Card title="Allocations">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

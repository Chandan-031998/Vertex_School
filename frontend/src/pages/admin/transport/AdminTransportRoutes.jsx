import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { createRoute, createStop, deleteRoute, deleteStop, listRoutes, updateRoute, updateStop } from "../../../api/transport.api";

const initialRoute = { route_name: "", start_point: "", end_point: "", status: "ACTIVE" };
const initialStop = { stop_name: "", pickup_time: "", drop_time: "", stop_order: 1 };

export default function AdminTransportRoutes() {
  const [routes, setRoutes] = useState([]);
  const [routeForm, setRouteForm] = useState(initialRoute);
  const [routeEditId, setRouteEditId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [stopForm, setStopForm] = useState(initialStop);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await listRoutes();
    const data = res.data || [];
    setRoutes(data);
    if (!selectedRouteId && data.length) setSelectedRouteId(String(data[0].id));
  }
  useEffect(() => { load(); }, []);

  async function saveRoute(e) {
    e.preventDefault();
    if (routeEditId) await updateRoute(routeEditId, routeForm);
    else await createRoute(routeForm);
    setRouteForm(initialRoute);
    setRouteEditId(null);
    setMsg("Route saved");
    await load();
  }

  async function saveStop(e) {
    e.preventDefault();
    if (!selectedRouteId) return;
    await createStop(Number(selectedRouteId), { ...stopForm, stop_order: Number(stopForm.stop_order) });
    setStopForm(initialStop);
    setMsg("Stop added");
    await load();
  }

  const selectedRoute = routes.find((r) => String(r.id) === String(selectedRouteId));

  const routeCols = useMemo(() => ([
    { key: "route_name", label: "Route" },
    { key: "start_point", label: "Start" },
    { key: "end_point", label: "End" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => { setRouteEditId(r.id); setRouteForm(r); }}>Edit</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteRoute(r.id); await load(); }}>Deactivate</Button>
        </div>
      )
    }
  ]), []);

  const stopCols = useMemo(() => ([
    { key: "stop_order", label: "Order" },
    { key: "stop_name", label: "Stop" },
    { key: "pickup_time", label: "Pickup" },
    { key: "drop_time", label: "Drop" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="px-2 py-1 text-xs"
            onClick={async () => {
              await updateStop(r.id, { stop_order: Number(r.stop_order) + 1 });
              await load();
            }}
          >Reorder +1</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteStop(r.id); await load(); }}>Delete</Button>
        </div>
      )
    }
  ]), []);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-3 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div> : null}
      <Card title={routeEditId ? "Update Route" : "Create Route"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={saveRoute}>
          <Input value={routeForm.route_name} onChange={(e) => setRouteForm((p) => ({ ...p, route_name: e.target.value }))} placeholder="Route name" required />
          <Input value={routeForm.start_point} onChange={(e) => setRouteForm((p) => ({ ...p, start_point: e.target.value }))} placeholder="Start point" required />
          <Input value={routeForm.end_point} onChange={(e) => setRouteForm((p) => ({ ...p, end_point: e.target.value }))} placeholder="End point" required />
          <Select value={routeForm.status} onChange={(e) => setRouteForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          <Button type="submit">{routeEditId ? "Update" : "Create"}</Button>
        </form>
      </Card>
      <Card title="Routes" className="mb-4">
        <Table columns={routeCols} rows={routes} />
      </Card>
      <Card title="Stops">
        <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={saveStop}>
          <Select value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)}>
            <option value="">Select route</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
          </Select>
          <Input value={stopForm.stop_name} onChange={(e) => setStopForm((p) => ({ ...p, stop_name: e.target.value }))} placeholder="Stop name" required />
          <Input type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm((p) => ({ ...p, pickup_time: e.target.value }))} />
          <Input type="time" value={stopForm.drop_time} onChange={(e) => setStopForm((p) => ({ ...p, drop_time: e.target.value }))} />
          <Input type="number" value={stopForm.stop_order} onChange={(e) => setStopForm((p) => ({ ...p, stop_order: e.target.value }))} />
          <Button type="submit">Add Stop</Button>
        </form>
        <Table columns={stopCols} rows={selectedRoute?.stops || []} />
      </Card>
    </DashboardLayout>
  );
}

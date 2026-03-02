import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { endTrip, listRoutes, listTrips, listVehicles, startTrip, upsertTripEvent } from "../../../api/transport.api";
import { listStudents } from "../../../api/students.api";

export default function AdminTransportTrips() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [students, setStudents] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [eventForm, setEventForm] = useState({ student_id: "", boarded: false, dropped: false, remarks: "" });
  const [startForm, setStartForm] = useState({ vehicle_id: "", route_id: "", trip_date: new Date().toISOString().slice(0, 10), trip_type: "PICKUP" });

  async function load() {
    const [r, v, s, t] = await Promise.all([listRoutes(), listVehicles(), listStudents(), listTrips({})]);
    setRoutes(r.data || []);
    setVehicles(v.data || []);
    setStudents(s.data || []);
    const tripRows = t.data || [];
    setTrips(tripRows);
    if (!tripId && tripRows.length) setTripId(String(tripRows[0].id));
  }
  useEffect(() => { load(); }, []);

  async function onStart(e) {
    e.preventDefault();
    await startTrip({ ...startForm, vehicle_id: Number(startForm.vehicle_id), route_id: Number(startForm.route_id) });
    await load();
  }
  async function onEvent(e) {
    e.preventDefault();
    if (!tripId) return;
    await upsertTripEvent(Number(tripId), {
      student_id: Number(eventForm.student_id),
      boarded: !!eventForm.boarded,
      dropped: !!eventForm.dropped,
      remarks: eventForm.remarks || null
    });
    setEventForm({ student_id: "", boarded: false, dropped: false, remarks: "" });
  }

  const cols = useMemo(() => ([
    { key: "id", label: "Trip ID" },
    { key: "trip_date", label: "Date" },
    { key: "trip_type", label: "Type" },
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.bus_no || "-" },
    { key: "route", label: "Route", render: (r) => r.route?.route_name || "-" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions", render: (r) => <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await endTrip(r.id); await load(); }}>End</Button> }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="Start Trip" className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onStart}>
          <Select value={startForm.vehicle_id} onChange={(e) => setStartForm((p) => ({ ...p, vehicle_id: e.target.value }))}>
            <option value="">Vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.bus_no}</option>)}
          </Select>
          <Select value={startForm.route_id} onChange={(e) => setStartForm((p) => ({ ...p, route_id: e.target.value }))}>
            <option value="">Route</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
          </Select>
          <Input type="date" value={startForm.trip_date} onChange={(e) => setStartForm((p) => ({ ...p, trip_date: e.target.value }))} />
          <Select value={startForm.trip_type} onChange={(e) => setStartForm((p) => ({ ...p, trip_type: e.target.value }))}>
            <option value="PICKUP">PICKUP</option>
            <option value="DROP">DROP</option>
          </Select>
          <Button type="submit">Start</Button>
        </form>
      </Card>
      <Card title="Trips" className="mb-4">
        <Table columns={cols} rows={trips} />
      </Card>
      <Card title="Mark Boarded/Dropped">
        <form className="grid gap-3 md:grid-cols-6" onSubmit={onEvent}>
          <Select value={tripId} onChange={(e) => setTripId(e.target.value)}>
            <option value="">Trip</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.id} ({t.trip_date} {t.trip_type})</option>)}
          </Select>
          <Select value={eventForm.student_id} onChange={(e) => setEventForm((p) => ({ ...p, student_id: e.target.value }))}>
            <option value="">Student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select value={String(eventForm.boarded)} onChange={(e) => setEventForm((p) => ({ ...p, boarded: e.target.value === "true" }))}>
            <option value="false">Boarded: No</option>
            <option value="true">Boarded: Yes</option>
          </Select>
          <Select value={String(eventForm.dropped)} onChange={(e) => setEventForm((p) => ({ ...p, dropped: e.target.value === "true" }))}>
            <option value="false">Dropped: No</option>
            <option value="true">Dropped: Yes</option>
          </Select>
          <Input value={eventForm.remarks} onChange={(e) => setEventForm((p) => ({ ...p, remarks: e.target.value }))} placeholder="Remarks" />
          <Button type="submit">Save Event</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}

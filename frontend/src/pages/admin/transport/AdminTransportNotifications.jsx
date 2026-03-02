import { useEffect, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { listRoutes, notifyTransport } from "../../../api/transport.api";
import { listStudents } from "../../../api/students.api";

export default function AdminTransportNotifications() {
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    target: "CLASS",
    class_name: "",
    section: "",
    student_id: "",
    route_id: "",
    title: "",
    message: ""
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    listRoutes().then((r) => setRoutes(r.data || []));
    listStudents().then((s) => setStudents(s.data || []));
  }, []);

  async function onSend(e) {
    e.preventDefault();
    try {
      await notifyTransport({
        target: form.target,
        class_name: form.class_name || undefined,
        section: form.section || undefined,
        student_id: form.student_id ? Number(form.student_id) : undefined,
        route_id: form.route_id ? Number(form.route_id) : undefined,
        title: form.title,
        message: form.message
      });
      setMsg("Notification sent");
      setForm((p) => ({ ...p, title: "", message: "" }));
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send");
    }
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-3 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div> : null}
      <Card title="Transport Notifications">
        <form className="grid gap-3 md:grid-cols-3" onSubmit={onSend}>
          <Select value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}>
            <option value="CLASS">CLASS</option>
            <option value="STUDENT">STUDENT</option>
            <option value="ROUTE">ROUTE</option>
          </Select>
          <Input value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))} placeholder="Class (for CLASS target)" />
          <Input value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} placeholder="Section (for CLASS target)" />
          <Select value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}>
            <option value="">Student (for STUDENT target)</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select value={form.route_id} onChange={(e) => setForm((p) => ({ ...p, route_id: e.target.value }))}>
            <option value="">Route (for ROUTE target)</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
          </Select>
          <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" required />
          <Input value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Message" required />
          <Button type="submit">Send Notification</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}

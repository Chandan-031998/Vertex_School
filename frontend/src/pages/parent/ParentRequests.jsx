import { useEffect, useMemo, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { createParentRequest, parentRequests, parentChildren } from "../../api/parent.api";

export default function ParentRequests() {
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ student_id: "", request_type: "STOP_CHANGE", payload_json: "{}" });

  async function load() {
    const [s, r] = await Promise.all([parentChildren(), parentRequests()]);
    const studentsData = s.data || [];
    setStudents(studentsData);
    setRows(r.data || []);
    if (!form.student_id && studentsData.length) setForm((p) => ({ ...p, student_id: String(studentsData[0].id) }));
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    await createParentRequest({
      student_id: Number(form.student_id),
      request_type: form.request_type,
      payload_json: JSON.parse(form.payload_json || "{}")
    });
    setForm((p) => ({ ...p, payload_json: "{}" }));
    await load();
  }

  const cols = useMemo(() => ([
    { key: "student", label: "Student", render: (r) => r.student?.full_name || "-" },
    { key: "request_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "admin_note", label: "Admin Note", render: (r) => r.admin_note || "-" },
    { key: "created_at", label: "Requested At" }
  ]), []);

  return (
    <ParentLayout>
      <Card title="Raise Transport Request" className="mb-4">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
          <Select value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}>
            <option value="">Student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select value={form.request_type} onChange={(e) => setForm((p) => ({ ...p, request_type: e.target.value }))}>
            <option value="STOP_CHANGE">STOP_CHANGE</option>
            <option value="PICKUP_CHANGE">PICKUP_CHANGE</option>
            <option value="DROP_CHANGE">DROP_CHANGE</option>
            <option value="PAUSE_TRANSPORT">PAUSE_TRANSPORT</option>
            <option value="RESUME_TRANSPORT">RESUME_TRANSPORT</option>
          </Select>
          <Input value={form.payload_json} onChange={(e) => setForm((p) => ({ ...p, payload_json: e.target.value }))} placeholder='{"stop_id":12}' />
          <Button type="submit">Submit</Button>
        </form>
      </Card>
      <Card title="My Requests">
        <Table columns={cols} rows={rows} />
      </Card>
    </ParentLayout>
  );
}

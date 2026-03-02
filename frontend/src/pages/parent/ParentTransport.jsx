import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { parentTransport, parentChildren } from "../../api/parent.api";

export default function ParentTransport() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    parentChildren().then((res) => {
      const rows = res.data || [];
      setStudents(rows);
      if (rows.length) setStudentId(String(rows[0].id));
    });
  }, []);

  useEffect(() => {
    if (!studentId) return;
    parentTransport({ student_id: Number(studentId) }).then((res) => setData(res.data)).catch(() => setData(null));
  }, [studentId]);

  return (
    <ParentLayout>
      <Card title="My Transport">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select child</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Vehicle: <b>{data?.allocation?.vehicle?.bus_no || "-"}</b></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Route: <b>{data?.allocation?.route?.route_name || "-"}</b></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Stop: <b>{data?.allocation?.stop?.stop_name || "-"}</b></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Driver: <b>{data?.assignment?.driver?.full_name || "-"}</b></div>
        </div>
      </Card>
    </ParentLayout>
  );
}

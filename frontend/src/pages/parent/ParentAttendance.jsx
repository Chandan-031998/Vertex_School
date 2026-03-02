import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { parentAttendance, parentChildren } from "../../api/parent.api";

export default function ParentAttendance() {
  const now = new Date();
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [data, setData] = useState({ present: 0, absent: 0, total: 0, percentage: 0, rows: [] });

  useEffect(() => {
    parentChildren().then((res) => {
      const rows = res.data || [];
      setChildren(rows);
      if (rows.length) setStudentId(String(rows[0].id));
    });
  }, []);

  async function load() {
    if (!studentId) return;
    const res = await parentAttendance({ student_id: Number(studentId), month: Number(month), year: Number(year) });
    setData(res.data || data);
  }

  return (
    <ParentLayout>
      <Card title="Attendance">
        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select child</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </Select>
          <Input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" />
          <Input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
          <Button onClick={load}>Load</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-4 text-sm">
          <div className="rounded bg-slate-50 p-3">Present: <b>{data.present}</b></div>
          <div className="rounded bg-slate-50 p-3">Absent: <b>{data.absent}</b></div>
          <div className="rounded bg-slate-50 p-3">Total: <b>{data.total}</b></div>
          <div className="rounded bg-slate-50 p-3">Percentage: <b>{Number(data.percentage || 0).toFixed(2)}%</b></div>
        </div>
      </Card>
    </ParentLayout>
  );
}

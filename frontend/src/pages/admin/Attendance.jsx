import { useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import { dailyAttendance, deleteAttendance, exportAttendanceCsv, monthlyAttendance, updateAttendance } from "../../api/attendance.api";

export default function Attendance() {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [monthlyRows, setMonthlyRows] = useState([]);
  const [dailyRows, setDailyRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadMonthly() {
    if (!className || !section || !month) return;
    setLoading(true);
    try {
      const res = await monthlyAttendance({ class_name: className, section, month });
      setMonthlyRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadDaily() {
    if (!className || !section || !date) return;
    setLoading(true);
    try {
      const res = await dailyAttendance({ class_name: className, section, date });
      setDailyRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function onStatus(id, status) {
    await updateAttendance(id, { status });
    await loadDaily();
  }

  async function onDelete(id) {
    await deleteAttendance(id);
    await loadDaily();
  }

  const monthlyColumns = useMemo(() => ([
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "total", label: "Total" },
    { key: "percentage", label: "Percentage", render: (r) => `${Number(r.percentage || 0).toFixed(2)}%` }
  ]), []);

  const dailyColumns = useMemo(() => ([
    { key: "student_id", label: "Student ID" },
    { key: "student", label: "Student" },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Select value={r.status} onChange={(e) => onStatus(r.id, e.target.value)}>
          <option value="P">PRESENT</option>
          <option value="A">ABSENT</option>
        </Select>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
    }
  ]), [dailyRows]);

  const canExport = className && section && month;

  return (
    <DashboardLayout>
      <Card title="Attendance Reports" className="mb-4">
        <div className="grid gap-3 md:grid-cols-5 mb-4">
          <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class (e.g., 10)" />
          <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section (e.g., A)" />
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button onClick={loadMonthly}>{loading ? "Loading..." : "View Monthly"}</Button>
          <a
            className={`inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium ${canExport ? "text-slate-900 hover:bg-slate-50" : "pointer-events-none text-slate-400"}`}
            href={canExport ? exportAttendanceCsv({ class_name: className, section, month }) : "#"}
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
        </div>
        <Table columns={monthlyColumns} rows={monthlyRows} />
      </Card>

      <Card title="Daily Corrections (Admin)">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class" />
          <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={loadDaily}>Load Daily Entries</Button>
        </div>
        <Table columns={dailyColumns} rows={dailyRows} />
      </Card>
    </DashboardLayout>
  );
}

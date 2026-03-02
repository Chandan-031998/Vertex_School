import { useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { money } from "../../utils/format";
import { attendanceReport, classStrength, exportStudentsCsv, feeReport } from "../../api/reports.api";

export default function Reports() {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const [strengthRows, setStrengthRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [feeRows, setFeeRows] = useState([]);

  async function loadStrength() {
    if (!className) return;
    const res = await classStrength({ class_name: className });
    setStrengthRows(res.data || []);
  }

  async function loadAttendance() {
    if (!className || !section || !month) return;
    const res = await attendanceReport({ class_name: className, section, month });
    setAttendanceRows(res.data || []);
  }

  async function loadFeeReport() {
    const res = await feeReport({ month: month || undefined });
    setFeeRows(res.data || []);
  }

  const strengthColumns = useMemo(() => ([
    { key: "class_name", label: "Class" },
    { key: "section", label: "Section" },
    { key: "count", label: "Students" }
  ]), []);

  const attendanceColumns = useMemo(() => ([
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "total", label: "Total" },
    { key: "percentage", label: "Percentage", render: (r) => `${Number(r.percentage || 0).toFixed(2)}%` }
  ]), []);

  const feeColumns = useMemo(() => ([
    { key: "invoice_no", label: "Invoice" },
    { key: "billing_month", label: "Month" },
    { key: "student", label: "Student" },
    { key: "total_amount", label: "Total", render: (r) => money(r.total_amount) },
    { key: "paid_amount", label: "Collected", render: (r) => money(r.paid_amount) },
    { key: "due_amount", label: "Pending", render: (r) => money(r.due_amount) }
  ]), []);

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class" />
        <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section" />
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <a
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          href={exportStudentsCsv({ class_name: className || undefined, section: section || undefined })}
          target="_blank"
          rel="noreferrer"
        >
          Export Students CSV
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Class Strength">
          <Button className="mb-3" onClick={loadStrength}>Load Class Strength</Button>
          <Table columns={strengthColumns} rows={strengthRows} />
        </Card>

        <Card title="Attendance Report">
          <Button className="mb-3" onClick={loadAttendance}>Load Attendance</Button>
          <Table columns={attendanceColumns} rows={attendanceRows} />
        </Card>
      </div>

      <Card title="Fee Report" className="mt-4">
        <Button className="mb-3" onClick={loadFeeReport}>Load Fee Report</Button>
        <Table columns={feeColumns} rows={feeRows} />
      </Card>
    </DashboardLayout>
  );
}

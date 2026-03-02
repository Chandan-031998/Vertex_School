import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { teacherAttendanceExportCsv, teacherAttendanceReport, teacherClasses } from "../../api/teacher.api";

export default function TeacherAttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    }).catch(() => setClasses([]));
  }, []);

  async function load() {
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section || !month) return;
    const res = await teacherAttendanceReport({ class_name, section, month });
    setRows(res.data || []);
  }

  const cols = useMemo(() => ([
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "total", label: "Total" },
    { key: "percentage", label: "%", render: (r) => Number(r.percentage || 0).toFixed(2) }
  ]), []);

  const [class_name, section] = (classSection || "__").split("__");
  const exportLink = class_name && section && month ? teacherAttendanceExportCsv({ class_name, section, month }) : "#";

  return (
    <DashboardLayout>
      <Card title="Attendance Reports">
        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Select class-section</option>
            {classes.map((c, idx) => (
              <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>
                {c.class_name}-{c.section}
              </option>
            ))}
          </Select>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button onClick={load}>Load Report</Button>
          <a
            href={exportLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900"
          >
            Export CSV
          </a>
        </div>
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

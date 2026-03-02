import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { teacherAttendanceClassDate, teacherAttendanceMark, teacherClasses } from "../../api/teacher.api";

export default function AttendanceEntry() {
  const [classes, setClasses] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    }).catch(() => setClasses([]));
  }, []);

  async function loadAttendance() {
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section) return;
    try {
      const res = await teacherAttendanceClassDate({ class_name, section, date });
      const students = res.data?.students || [];
      setRows(students);
      setStatuses(Object.fromEntries(students.map((s) => [s.id, s.status || "P"])));
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to load attendance");
    }
  }

  function markAllPresent() {
    setStatuses(Object.fromEntries(rows.map((s) => [s.id, "P"])));
  }

  async function onSave() {
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section || !rows.length) return;
    try {
      await teacherAttendanceMark({
        date,
        class_name,
        section,
        records: rows.map((s) => ({ student_id: s.id, status: statuses[s.id] || "P" }))
      });
      setMsg("Attendance saved");
      await loadAttendance();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save attendance");
    }
  }

  const columns = useMemo(() => ([
    { key: "admission_no", label: "Admission No" },
    { key: "full_name", label: "Student" },
    { key: "roll_no", label: "Roll No" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Select value={statuses[r.id] || "P"} onChange={(e) => setStatuses((p) => ({ ...p, [r.id]: e.target.value }))}>
          <option value="P">Present</option>
          <option value="A">Absent</option>
        </Select>
      )
    }
  ]), [statuses]);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="Attendance Marking">
        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Select class-section</option>
            {classes.map((c, idx) => (
              <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>
                {c.class_name}-{c.section}
              </option>
            ))}
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={loadAttendance}>Load</Button>
          <Button variant="secondary" onClick={markAllPresent}>Mark all present</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

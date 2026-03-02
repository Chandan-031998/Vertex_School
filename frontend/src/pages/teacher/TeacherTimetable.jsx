import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import { getTeacherTimetable } from "../../api/teacher.api";

export default function TeacherTimetable() {
  const [assigned, setAssigned] = useState([]);
  const [entries, setEntries] = useState([]);
  const [classSection, setClassSection] = useState("");

  useEffect(() => {
    getTeacherTimetable().then((res) => {
      const data = res.data || {};
      const cls = data.assigned_classes || [];
      setAssigned(cls);
      setEntries(data.timetable_entries || []);
      if (cls.length) setClassSection(`${cls[0].class_name}__${cls[0].section}`);
    }).catch(() => {
      setAssigned([]);
      setEntries([]);
    });
  }, []);

  const filtered = useMemo(() => {
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section) return entries;
    return entries.filter((e) => String(e.class?.class_name || e.class_name) === class_name && String(e.section?.section_name || e.section) === section);
  }, [entries, classSection]);

  const cols = useMemo(() => ([
    { key: "class_name", label: "Class", render: (r) => r.class?.class_name || "-" },
    { key: "section", label: "Section", render: (r) => r.section?.section_name || "-" },
    { key: "day_of_week", label: "Day" },
    { key: "period_no", label: "Period" },
    { key: "subject_name", label: "Subject" },
    { key: "time", label: "Time", render: (r) => `${r.start_time} - ${r.end_time}` },
    { key: "room_no", label: "Room", render: (r) => r.room_no || "-" }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="My Timetable">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">All assigned classes</option>
            {assigned.map((c, idx) => <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>{c.class_name}-{c.section}</option>)}
          </Select>
        </div>
        <Table columns={cols} rows={filtered} />
      </Card>
    </DashboardLayout>
  );
}

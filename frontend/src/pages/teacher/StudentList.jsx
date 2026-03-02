import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { teacherClasses, teacherStudents } from "../../api/teacher.api";

export default function StudentList() {
  const nav = useNavigate();
  const [classes, setClasses] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    }).catch(() => setClasses([]));
  }, []);

  async function loadStudents() {
    const [class_name, section] = (classSection || "__").split("__");
    const res = await teacherStudents({
      class_name: class_name || undefined,
      section: section || undefined,
      q: q || undefined
    });
    setRows(res.data || []);
  }

  useEffect(() => {
    if (classSection) loadStudents();
  }, [classSection]);

  const cols = useMemo(() => ([
    { key: "admission_no", label: "Admission No" },
    { key: "full_name", label: "Name" },
    { key: "roll_no", label: "Roll No" },
    { key: "class_name", label: "Class" },
    { key: "section", label: "Section" },
    { key: "parent_phone", label: "Parent Phone" },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => nav(`/teacher/students/${r.id}`)}>
          View Profile
        </Button>
      )
    }
  ]), [nav]);

  return (
    <DashboardLayout>
      <Card title="My Students">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Select class-section</option>
            {classes.map((c, idx) => (
              <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>
                {c.class_name}-{c.section} ({c.student_count})
              </option>
            ))}
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/roll/phone" />
          <Button onClick={loadStudents}>Search</Button>
        </div>
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

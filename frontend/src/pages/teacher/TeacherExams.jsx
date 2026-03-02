import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import {
  createTeacherExam,
  deleteTeacherExam,
  getTeacherExamMarks,
  listTeacherExams,
  teacherClasses,
  upsertTeacherExamMarks,
  updateTeacherExam
} from "../../api/teacher.api";
import { listSubjects } from "../../api/settings.api";

export default function TeacherExams() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rows, setRows] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [marksExam, setMarksExam] = useState(null);
  const [marksRows, setMarksRows] = useState([]);
  const [form, setForm] = useState({
    subject_id: "",
    exam_name: "",
    exam_date: "",
    max_marks: ""
  });

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    });
    listSubjects().then((res) => setSubjects(res.data || []));
  }, []);

  async function load() {
    const [class_name, section] = (classSection || "__").split("__");
    const res = await listTeacherExams({ class_name: class_name || undefined, section: section || undefined });
    setRows(res.data || []);
  }
  useEffect(() => { if (classSection) load(); }, [classSection]);

  async function onSubmit(e) {
    e.preventDefault();
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section) return;
    const payload = {
      class_name,
      section,
      subject_id: Number(form.subject_id),
      exam_name: form.exam_name,
      exam_date: form.exam_date,
      max_marks: Number(form.max_marks)
    };
    try {
      if (editingId) {
        await updateTeacherExam(editingId, payload);
        setMsg("Exam updated");
      } else {
        await createTeacherExam(payload);
        setMsg("Exam created");
      }
      setEditingId(null);
      setForm({ subject_id: "", exam_name: "", exam_date: "", max_marks: "" });
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save exam");
    }
  }

  function onEdit(row) {
    setEditingId(row.id);
    setClassSection(`${row.class_name}__${row.section}`);
    setForm({
      subject_id: String(row.subject_id || ""),
      exam_name: row.exam_name || "",
      exam_date: row.exam_date || "",
      max_marks: String(row.max_marks || "")
    });
  }

  async function onDelete(id) {
    await deleteTeacherExam(id);
    await load();
  }

  async function openMarks(exam) {
    const res = await getTeacherExamMarks(exam.id);
    setMarksExam(res.data?.exam || exam);
    setMarksRows((res.data?.students || []).map((s) => ({
      ...s,
      marks_obtained: s.marks_obtained ?? "",
      remarks: s.remarks ?? ""
    })));
  }

  async function saveMarks() {
    if (!marksExam) return;
    await upsertTeacherExamMarks(marksExam.id, {
      records: marksRows.map((r) => ({
        student_id: r.id,
        marks_obtained: Number(r.marks_obtained || 0),
        remarks: r.remarks || null
      }))
    });
    setMsg("Marks saved");
  }

  const examCols = useMemo(() => ([
    { key: "exam_name", label: "Exam" },
    { key: "class", label: "Class", render: (r) => `${r.class_name}-${r.section}` },
    { key: "subject", label: "Subject", render: (r) => r.subject?.subject_name || r.subject_id },
    { key: "exam_date", label: "Date" },
    { key: "max_marks", label: "Max Marks" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => openMarks(r)}>Marks</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), []);

  const marksCols = useMemo(() => ([
    { key: "full_name", label: "Student" },
    {
      key: "marks_obtained",
      label: "Marks",
      render: (r) => <Input type="number" min="0" value={r.marks_obtained} onChange={(e) => setMarksRows((p) => p.map((x) => x.id === r.id ? { ...x, marks_obtained: e.target.value } : x))} />
    },
    {
      key: "remarks",
      label: "Remarks",
      render: (r) => <Input value={r.remarks} onChange={(e) => setMarksRows((p) => p.map((x) => x.id === r.id ? { ...x, remarks: e.target.value } : x))} />
    }
  ]), [marksRows]);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title={editingId ? "Update Exam" : "Create Exam"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-6" onSubmit={onSubmit}>
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Class-section</option>
            {classes.map((c, idx) => <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>{c.class_name}-{c.section}</option>)}
          </Select>
          <Select value={form.subject_id} onChange={(e) => setForm((p) => ({ ...p, subject_id: e.target.value }))}>
            <option value="">Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </Select>
          <Input value={form.exam_name} onChange={(e) => setForm((p) => ({ ...p, exam_name: e.target.value }))} placeholder="Exam name" required />
          <Input type="date" value={form.exam_date} onChange={(e) => setForm((p) => ({ ...p, exam_date: e.target.value }))} required />
          <Input type="number" min="0" value={form.max_marks} onChange={(e) => setForm((p) => ({ ...p, max_marks: e.target.value }))} placeholder="Max marks" required />
          <Button type="submit">{editingId ? "Update" : "Create"}</Button>
        </form>
      </Card>
      <Card title="Exam List" className="mb-4">
        <Table columns={examCols} rows={rows} />
      </Card>
      {marksExam ? (
        <Card title={`Marks Entry: ${marksExam.exam_name}`}>
          <Table columns={marksCols} rows={marksRows} />
          <Button className="mt-4" onClick={saveMarks}>Save Marks</Button>
        </Card>
      ) : null}
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { teacherStudentById, teacherUpdateStudentRemarks } from "../../api/teacher.api";

export default function TeacherStudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const res = await teacherStudentById(id);
      const data = res.data;
      setStudent(data);
      setRemarks(data?.teacher_remarks || "");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to load student");
    }
  }

  useEffect(() => { load(); }, [id]);

  async function onSave() {
    try {
      await teacherUpdateStudentRemarks(id, { teacher_remarks: remarks });
      setMsg("Remarks saved");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save remarks");
    }
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="Student Profile" className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={student?.full_name || ""} readOnly />
          <Input value={student?.admission_no || ""} readOnly />
          <Input value={student?.roll_no || ""} readOnly />
          <Input value={student?.class_name || ""} readOnly />
          <Input value={student?.section || ""} readOnly />
          <Input value={student?.parent_phone || ""} readOnly />
        </div>
      </Card>
      <Card title="Teacher Remarks">
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Write remarks/notes for this student"
        />
        <Button className="mt-3" onClick={onSave}>Save Remarks</Button>
      </Card>
    </DashboardLayout>
  );
}

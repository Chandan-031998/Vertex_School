import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { assignTeacherClasses, listStaff } from "../../api/staff.api";

const blankRow = { class_name: "", section: "" };

export default function AssignClasses() {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [rows, setRows] = useState([blankRow]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await listStaff();
      const teacherRows = (res.data || []).filter((s) => s.role === "TEACHER");
      setTeachers(teacherRows);
      if (teacherRows.length) {
        setTeacherId(String(teacherRows[0].id));
        const assigned = Array.isArray(teacherRows[0].assigned_classes) && teacherRows[0].assigned_classes.length
          ? teacherRows[0].assigned_classes
          : [blankRow];
        setRows(assigned.map((a) => ({ class_name: a.class_name || "", section: a.section || "" })));
      }
    }
    load();
  }, []);

  function onTeacherChange(nextId) {
    setTeacherId(nextId);
    const teacher = teachers.find((t) => String(t.id) === String(nextId));
    const assigned = Array.isArray(teacher?.assigned_classes) && teacher.assigned_classes.length
      ? teacher.assigned_classes
      : [blankRow];
    setRows(assigned.map((a) => ({ class_name: a.class_name || "", section: a.section || "" })));
  }

  function setRow(idx, key, value) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  }

  function addRow() {
    setRows((prev) => [...prev, blankRow]);
  }

  function removeRow(idx) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSave() {
    setSaving(true);
    setToast(null);
    try {
      const payload = rows
        .map((r) => ({ class_name: String(r.class_name || "").trim(), section: String(r.section || "").trim() }))
        .filter((r) => r.class_name && r.section);
      if (!teacherId) throw new Error("Select teacher");
      await assignTeacherClasses(Number(teacherId), payload);
      setToast({ type: "success", text: "Classes assigned successfully." });
      const refreshed = await listStaff();
      const teacherRows = (refreshed.data || []).filter((s) => s.role === "TEACHER");
      setTeachers(teacherRows);
    } catch (e) {
      setToast({ type: "error", text: e?.response?.data?.message || "Failed to assign classes." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <DashboardLayout>
      <Card title="Assign Classes To Teacher">
        {toast ? (
          <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {toast.text}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3 mb-4">
          <Select value={teacherId} onChange={(e) => onTeacherChange(e.target.value)}>
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.employee_code})</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-4">
              <Input value={row.class_name} onChange={(e) => setRow(idx, "class_name", e.target.value)} placeholder="Class (e.g., 10)" />
              <Input value={row.section} onChange={(e) => setRow(idx, "section", e.target.value)} placeholder="Section (e.g., A)" />
              <Button type="button" variant="secondary" onClick={addRow}>Add Row</Button>
              <Button type="button" variant="secondary" onClick={() => removeRow(idx)} disabled={rows.length === 1}>Remove</Button>
            </div>
          ))}
        </div>

        <Button className="mt-4" onClick={onSave} disabled={saving || !teacherId}>{saving ? "Saving..." : "Save Assignment"}</Button>
      </Card>
    </DashboardLayout>
  );
}

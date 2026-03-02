import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import { createSubject, deleteSubject, listClasses, listSubjects, updateSubject } from "../../api/settings.api";

export default function SettingsSubjects() {
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [classId, setClassId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editClassId, setEditClassId] = useState("");

  async function loadClasses() {
    const res = await listClasses();
    const cls = res.data || [];
    setClasses(cls);
    if (!classId && cls.length) setClassId(String(cls[0].id));
  }

  async function loadSubjects(nextClassId = classId) {
    const res = await listSubjects(nextClassId ? { class_id: nextClassId } : {});
    setRows(res.data || []);
  }

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadSubjects(); }, [classId]);

  async function onCreate(e) {
    e.preventDefault();
    await createSubject({ class_id: Number(classId), subject_name: subjectName });
    setSubjectName("");
    await loadSubjects();
  }

  async function onDelete(id) {
    await deleteSubject(id);
    await loadSubjects();
  }

  function onEdit(row) {
    setEditingId(row.id);
    setEditSubjectName(row.subject_name || "");
    setEditClassId(String(row.class_id || ""));
  }

  async function onUpdate() {
    await updateSubject(editingId, { class_id: Number(editClassId), subject_name: editSubjectName });
    setEditingId(null);
    setEditClassId("");
    setEditSubjectName("");
    await loadSubjects();
  }

  const columns = useMemo(() => ([
    {
      key: "subject_name",
      label: "Subject",
      render: (r) => editingId === r.id ? <Input value={editSubjectName} onChange={(e) => setEditSubjectName(e.target.value)} /> : r.subject_name
    },
    {
      key: "class",
      label: "Class",
      render: (r) => editingId === r.id ? (
        <Select value={editClassId} onChange={(e) => setEditClassId(e.target.value)}>
          <option value="">Select class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </Select>
      ) : (r.class?.class_name || "-")
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {editingId === r.id ? (
            <>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={onUpdate}>Update</Button>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
            </>
          ) : (
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          )}
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), [editingId, editSubjectName, editClassId, classes]);

  return (
    <DashboardLayout>
      <Card title="Create Subject" className="mb-4">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </Select>
          <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Subject name" />
          <Button type="submit">Create</Button>
        </form>
      </Card>
      <Card title="Subjects">
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

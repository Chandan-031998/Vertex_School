import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { addSection, createClass, deleteClass, deleteSection, listClasses, updateClass } from "../../api/settings.api";

export default function SettingsClasses() {
  const [rows, setRows] = useState([]);
  const [className, setClassName] = useState("");
  const [sections, setSections] = useState("A,B");
  const [newSection, setNewSection] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSections, setEditSections] = useState("");

  async function load() {
    const res = await listClasses();
    setRows(res.data || []);
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    const cleanSections = sections.split(",").map((s) => s.trim()).filter(Boolean);
    await createClass({ class_name: className, sections: cleanSections });
    setClassName("");
    setSections("A,B");
    await load();
  }

  async function onDeleteClass(id) {
    await deleteClass(id);
    await load();
  }

  async function onAddSection(classId) {
    const section_name = String(newSection[classId] || "").trim();
    if (!section_name) return;
    await addSection(classId, { section_name });
    setNewSection((p) => ({ ...p, [classId]: "" }));
    await load();
  }

  async function onDeleteSection(id) {
    await deleteSection(id);
    await load();
  }

  function onEdit(row) {
    setEditingId(row.id);
    setEditName(row.class_name || "");
    setEditSections((row.sections || []).map((s) => s.section_name).join(","));
  }

  async function onUpdateClass() {
    const cleanSections = editSections.split(",").map((s) => s.trim()).filter(Boolean);
    await updateClass(editingId, { class_name: editName, sections: cleanSections });
    setEditingId(null);
    setEditName("");
    setEditSections("");
    await load();
  }

  const columns = useMemo(() => ([
    {
      key: "class_name",
      label: "Class",
      render: (r) => editingId === r.id ? <Input value={editName} onChange={(e) => setEditName(e.target.value)} /> : r.class_name
    },
    {
      key: "sections",
      label: "Sections",
      render: (r) => editingId === r.id
        ? <Input value={editSections} onChange={(e) => setEditSections(e.target.value)} placeholder="A,B" />
        : ((r.sections || []).map((s) => s.section_name).join(", ") || "-")
    },
    {
      key: "manage",
      label: "Manage Sections",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Input className="w-24" value={newSection[r.id] || ""} onChange={(e) => setNewSection((p) => ({ ...p, [r.id]: e.target.value }))} placeholder="A" />
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onAddSection(r.id)}>Add</Button>
        </div>
      )
    },
    {
      key: "remove_section",
      label: "Delete Section",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {(r.sections || []).map((s) => (
            <Button key={s.id} type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDeleteSection(s.id)}>{s.section_name}</Button>
          ))}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {editingId === r.id ? (
            <>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={onUpdateClass}>Update</Button>
              <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
            </>
          ) : (
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEdit(r)}>Edit</Button>
          )}
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDeleteClass(r.id)}>Delete Class</Button>
        </div>
      )
    }
  ]), [newSection, editingId, editName, editSections]);

  return (
    <DashboardLayout>
      <Card title="Create Class" className="mb-4">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
          <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class name (e.g. 10)" />
          <Input value={sections} onChange={(e) => setSections(e.target.value)} placeholder="Sections (comma separated)" />
          <Button type="submit">Create</Button>
        </form>
      </Card>
      <Card title="Classes & Sections">
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

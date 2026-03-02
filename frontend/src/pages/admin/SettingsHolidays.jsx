import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import { createHoliday, deleteHoliday, listHolidays, updateHoliday } from "../../api/settings.api";

export default function SettingsHolidays() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("HOLIDAY");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("HOLIDAY");

  async function load() {
    const res = await listHolidays(month ? { month } : {});
    setRows(res.data || []);
  }

  useEffect(() => { load(); }, [month]);

  async function onCreate(e) {
    e.preventDefault();
    await createHoliday({ title, date, type });
    setTitle("");
    setDate("");
    setType("HOLIDAY");
    await load();
  }

  async function onDelete(id) {
    await deleteHoliday(id);
    await load();
  }

  function onEdit(row) {
    setEditingId(row.id);
    setEditTitle(row.title || "");
    setEditDate(row.date || "");
    setEditType(row.type || "HOLIDAY");
  }

  async function onUpdate() {
    await updateHoliday(editingId, { title: editTitle, date: editDate, type: editType });
    setEditingId(null);
    await load();
  }

  const columns = useMemo(() => ([
    { key: "date", label: "Date", render: (r) => editingId === r.id ? <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} /> : r.date },
    { key: "title", label: "Title", render: (r) => editingId === r.id ? <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> : r.title },
    {
      key: "type",
      label: "Type",
      render: (r) => editingId === r.id ? (
        <Select value={editType} onChange={(e) => setEditType(e.target.value)}>
          <option value="HOLIDAY">HOLIDAY</option>
          <option value="EVENT">EVENT</option>
        </Select>
      ) : r.type
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
  ]), [editingId, editTitle, editDate, editType]);

  return (
    <DashboardLayout>
      <Card title="Add Holiday/Event" className="mb-4">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={onCreate}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="HOLIDAY">HOLIDAY</option>
            <option value="EVENT">EVENT</option>
          </Select>
          <Button type="submit">Create</Button>
        </form>
      </Card>
      <Card title="Holidays">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

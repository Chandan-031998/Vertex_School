import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import {
  listClasses,
  listTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable
} from "../../api/settings.api";

const dayOptions = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function emptyForm() {
  return {
    class_id: "",
    section_id: "",
    day_of_week: "MON",
    period_no: "",
    subject_name: "",
    start_time: "09:00:00",
    end_time: "09:45:00",
    teacher_name: "",
    room_no: ""
  };
}

export default function SettingsTimetable() {
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const sectionsByClass = useMemo(() => {
    const map = new Map();
    classes.forEach((c) => map.set(String(c.id), c.sections || []));
    return map;
  }, [classes]);

  const selectedClassSections = sectionsByClass.get(String(form.class_id)) || [];
  const filterSections = sectionsByClass.get(String(filterClassId)) || [];

  async function loadClasses() {
    const res = await listClasses();
    const data = res.data || [];
    setClasses(data);
    if (data.length && !form.class_id) {
      const firstClassId = String(data[0].id);
      const firstSectionId = data[0].sections?.[0]?.id ? String(data[0].sections[0].id) : "";
      setForm((prev) => ({ ...prev, class_id: firstClassId, section_id: firstSectionId }));
    }
  }

  async function loadTimetables(class_id = filterClassId, section_id = filterSectionId) {
    const params = {};
    if (class_id) params.class_id = class_id;
    if (section_id) params.section_id = section_id;
    const res = await listTimetables(params);
    setRows(res.data || []);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadTimetables();
  }, [filterClassId, filterSectionId]);

  function onChange(key, value) {
    setForm((prev) => {
      if (key === "class_id") {
        const nextSections = sectionsByClass.get(String(value)) || [];
        return { ...prev, class_id: value, section_id: nextSections[0]?.id ? String(nextSections[0].id) : "" };
      }
      return { ...prev, [key]: value };
    });
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      class_id: String(row.class_id),
      section_id: String(row.section_id),
      day_of_week: row.day_of_week,
      period_no: String(row.period_no),
      subject_name: row.subject_name || "",
      start_time: row.start_time || "09:00:00",
      end_time: row.end_time || "09:45:00",
      teacher_name: row.teacher_name || "",
      room_no: row.room_no || ""
    });
    setMsg("");
  }

  function resetForm() {
    setEditingId(null);
    setForm((prev) => ({ ...emptyForm(), class_id: prev.class_id, section_id: prev.section_id }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        class_id: Number(form.class_id),
        section_id: Number(form.section_id),
        day_of_week: form.day_of_week,
        period_no: Number(form.period_no),
        subject_name: form.subject_name.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        teacher_name: form.teacher_name.trim() || null,
        room_no: form.room_no.trim() || null
      };
      if (editingId) {
        await updateTimetable(editingId, payload);
        setMsg("Timetable updated");
      } else {
        await createTimetable(payload);
        setMsg("Timetable created");
      }
      resetForm();
      await loadTimetables();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save timetable");
    }
  }

  async function onDelete(id) {
    try {
      await deleteTimetable(id);
      if (editingId === id) resetForm();
      await loadTimetables();
      setMsg("Timetable deleted");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to delete timetable");
    }
  }

  const columns = useMemo(
    () => [
      { key: "class", label: "Class", render: (r) => r.class?.class_name || "-" },
      { key: "section", label: "Section", render: (r) => r.section?.section_name || "-" },
      { key: "day", label: "Day", render: (r) => r.day_of_week },
      { key: "period", label: "Period", render: (r) => r.period_no },
      { key: "subject", label: "Subject", render: (r) => r.subject_name },
      { key: "time", label: "Time", render: (r) => `${r.start_time} - ${r.end_time}` },
      { key: "teacher", label: "Teacher", render: (r) => r.teacher_name || "-" },
      { key: "room", label: "Room", render: (r) => r.room_no || "-" },
      {
        key: "actions",
        label: "Actions",
        render: (r) => (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => startEdit(r)}>
              Edit
            </Button>
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>
              Delete
            </Button>
          </div>
        )
      }
    ],
    [editingId]
  );

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}

      <Card title={editingId ? "Update Timetable Entry" : "Create Timetable Entry"} className="mb-4">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <Select value={form.class_id} onChange={(e) => onChange("class_id", e.target.value)} required>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </Select>
          <Select value={form.section_id} onChange={(e) => onChange("section_id", e.target.value)} required>
            <option value="">Select section</option>
            {selectedClassSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.section_name}
              </option>
            ))}
          </Select>
          <Select value={form.day_of_week} onChange={(e) => onChange("day_of_week", e.target.value)} required>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Input type="number" min="1" value={form.period_no} onChange={(e) => onChange("period_no", e.target.value)} placeholder="Period No" required />
          <Input value={form.subject_name} onChange={(e) => onChange("subject_name", e.target.value)} placeholder="Subject" required />
          <Input value={form.start_time} onChange={(e) => onChange("start_time", e.target.value)} placeholder="HH:MM:SS" required />
          <Input value={form.end_time} onChange={(e) => onChange("end_time", e.target.value)} placeholder="HH:MM:SS" required />
          <Input value={form.teacher_name} onChange={(e) => onChange("teacher_name", e.target.value)} placeholder="Teacher name (optional)" />
          <Input value={form.room_no} onChange={(e) => onChange("room_no", e.target.value)} placeholder="Room no (optional)" />
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="Timetable Entries">
        <div className="mb-3 grid gap-3 md:grid-cols-4">
          <Select value={filterClassId} onChange={(e) => { setFilterClassId(e.target.value); setFilterSectionId(""); }}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </Select>
          <Select value={filterSectionId} onChange={(e) => setFilterSectionId(e.target.value)}>
            <option value="">All sections</option>
            {filterSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.section_name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={() => { setFilterClassId(""); setFilterSectionId(""); }}>
            Clear Filters
          </Button>
        </div>
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

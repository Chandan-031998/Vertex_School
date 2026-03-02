import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { createAdminParent, getAdminParent, updateAdminParent } from "../../../api/admin.parents.api";
import { listStudents } from "../../../api/students.api";

export default function AdminParentForm({ mode = "create" }) {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    is_active: true,
    class_name: "",
    section: "",
    student_ids: []
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    listStudents().then((res) => setStudents(res.data || []));
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    getAdminParent(id).then((res) => {
      const d = res.data || {};
      setForm((p) => ({
        ...p,
        full_name: d.full_name || "",
        email: d.email || "",
        phone: d.phone || "",
        address: d.address || "",
        is_active: !!d.is_active,
        student_ids: d.student_ids || []
      }));
    });
  }, [id, isEdit]);

  const filteredStudents = students.filter((s) => {
    if (form.class_name && s.class_name !== form.class_name) return false;
    if (form.section && s.section !== form.section) return false;
    return true;
  });

  function toggleStudent(studentId) {
    const idNum = Number(studentId);
    setForm((p) => ({
      ...p,
      student_ids: p.student_ids.includes(idNum)
        ? p.student_ids.filter((x) => x !== idNum)
        : [...p.student_ids, idNum]
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        is_active: form.is_active,
        student_ids: form.student_ids
      };
      if (isEdit) await updateAdminParent(id, payload);
      else await createAdminParent(payload);
      nav("/admin/parents");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save parent");
    }
  }

  const classOptions = Array.from(new Set(students.map((s) => s.class_name)));
  const sectionOptions = Array.from(new Set(students.filter((s) => !form.class_name || s.class_name === form.class_name).map((s) => s.section)));

  return (
    <DashboardLayout>
      {msg ? <div className="mb-3 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div> : null}
      <Card title={isEdit ? "Edit Parent" : "Create Parent"}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Full name" required />
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" required={!isEdit} readOnly={isEdit} />
            <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={isEdit ? "Leave blank to keep password" : "Password"} required={!isEdit} />
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
            <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
            <Select value={String(form.is_active)} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "true" }))}>
              <option value="true">ACTIVE</option>
              <option value="false">INACTIVE</option>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-sm font-semibold text-slate-700">Link Students</div>
            <div className="mb-3 grid gap-3 md:grid-cols-3">
              <Select value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}>
                <option value="">All Classes</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}>
                <option value="">All Sections</option>
                {sectionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="max-h-64 overflow-auto rounded border border-slate-100">
              {filteredStudents.map((s) => (
                <label key={s.id} className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm">
                  <input type="checkbox" checked={form.student_ids.includes(Number(s.id))} onChange={() => toggleStudent(s.id)} />
                  <span>{s.full_name} ({s.class_name}-{s.section})</span>
                </label>
              ))}
              {!filteredStudents.length ? <div className="px-3 py-2 text-sm text-slate-500">No students found</div> : null}
            </div>
          </div>

          <Button type="submit">{isEdit ? "Update Parent" : "Create Parent"}</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}

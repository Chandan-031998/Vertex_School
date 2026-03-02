import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { deleteAdminParent, listAdminParents, resetAdminParentPassword } from "../../../api/admin.parents.api";

export default function AdminParentsList() {
  const [rows, setRows] = useState([]);
  const [passwords, setPasswords] = useState({});

  async function load() {
    const res = await listAdminParents();
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, []);

  const cols = useMemo(() => ([
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "children_count", label: "Children" },
    { key: "status", label: "Status", render: (r) => (r.is_active ? "ACTIVE" : "INACTIVE") },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link to={`/admin/parents/${r.id}/edit`} className="inline-flex rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-900">View/Edit</Link>
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await deleteAdminParent(r.id); await load(); }}>Disable</Button>
          </div>
          <div className="flex gap-2">
            <Input className="w-40" type="password" placeholder="New password" value={passwords[r.id] || ""} onChange={(e) => setPasswords((p) => ({ ...p, [r.id]: e.target.value }))} />
            <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { if (!passwords[r.id]) return; await resetAdminParentPassword(r.id, { new_password: passwords[r.id] }); setPasswords((p) => ({ ...p, [r.id]: "" })); }}>Reset</Button>
          </div>
        </div>
      )
    }
  ]), [passwords]);

  return (
    <DashboardLayout>
      <Card title="Parents" className="mb-4">
        <Link to="/admin/parents/new" className="inline-flex rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white">Create Parent</Link>
      </Card>
      <Card title="Parent Users">
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

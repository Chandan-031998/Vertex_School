import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { listRolePermissions, listRolesCatalog, updateRolePermissions } from "../../api/settings.api";

export default function SettingsRolesPermissions() {
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("ADMIN");
  const [resource, setResource] = useState("students");
  const [crud, setCrud] = useState({ can_create: true, can_read: true, can_update: true, can_delete: true });

  async function load() {
    const [permRes, roleRes] = await Promise.all([listRolePermissions(), listRolesCatalog()]);
    setRows(permRes.data || []);
    const roleRows = roleRes.data || [];
    setRoles(roleRows);
    if (roleRows.length && !roleRows.includes(role)) setRole(roleRows[0]);
  }
  useEffect(() => { load(); }, []);

  async function onSaveTemplate() {
    const filtered = rows.filter((r) => r.role_name === role).map((r) => ({
      resource: r.resource,
      can_create: !!r.can_create,
      can_read: !!r.can_read,
      can_update: !!r.can_update,
      can_delete: !!r.can_delete
    }));
    const without = filtered.filter((r) => r.resource !== resource);
    without.push({ resource, ...crud });
    await updateRolePermissions(role, { permissions: without });
    await load();
  }

  const columns = useMemo(() => ([
    { key: "role_name", label: "Role" },
    { key: "resource", label: "Resource" },
    { key: "can_create", label: "C", render: (r) => (r.can_create ? "Y" : "N") },
    { key: "can_read", label: "R", render: (r) => (r.can_read ? "Y" : "N") },
    { key: "can_update", label: "U", render: (r) => (r.can_update ? "Y" : "N") },
    { key: "can_delete", label: "D", render: (r) => (r.can_delete ? "Y" : "N") }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="Roles & Permissions" className="mb-4">
        <div className="grid gap-3 md:grid-cols-6">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input value={resource} onChange={(e) => setResource(e.target.value)} placeholder="Resource" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={crud.can_create} onChange={(e) => setCrud((p) => ({ ...p, can_create: e.target.checked }))} />Create</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={crud.can_read} onChange={(e) => setCrud((p) => ({ ...p, can_read: e.target.checked }))} />Read</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={crud.can_update} onChange={(e) => setCrud((p) => ({ ...p, can_update: e.target.checked }))} />Update</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={crud.can_delete} onChange={(e) => setCrud((p) => ({ ...p, can_delete: e.target.checked }))} />Delete</label>
        </div>
        <Button className="mt-4" onClick={onSaveTemplate}>Save Permission Template</Button>
      </Card>
      <Card title="Current Templates">
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { getAuditLogs } from "../../api/settings.api";

export default function SettingsAuditLogs() {
  const [limit, setLimit] = useState(200);
  const [rows, setRows] = useState([]);

  async function load() {
    const res = await getAuditLogs(limit);
    setRows(res.data || []);
  }

  useEffect(() => { load(); }, []);

  const cols = useMemo(() => ([
    { key: "created_at", label: "Time" },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
    { key: "entity_id", label: "Entity ID" },
    { key: "user_id", label: "User" }
  ]), []);

  return (
    <DashboardLayout>
      <Card title="Audit Logs" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value || 200))} />
          <Button onClick={load}>Load Logs</Button>
        </div>
      </Card>
      <Card title="Activity Logs"><Table columns={cols} rows={rows} /></Card>
    </DashboardLayout>
  );
}

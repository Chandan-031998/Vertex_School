import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { createIntegration, deleteIntegration, listIntegrations, updateIntegration } from "../../api/settings.api";

export default function SettingsIntegrations() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("SMTP");
  const [configJson, setConfigJson] = useState("{}");
  const [editing, setEditing] = useState(null);

  async function load() {
    const res = await listIntegrations();
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, []);

  async function onCreate() {
    await createIntegration({ type, config_json: JSON.parse(configJson || "{}") });
    setConfigJson("{}");
    await load();
  }

  async function onUpdate() {
    await updateIntegration(editing.id, { type: editing.type, config_json: JSON.parse(editing.config_json_text || "{}") });
    setEditing(null);
    await load();
  }

  async function onDelete(id) {
    await deleteIntegration(id);
    await load();
  }

  const cols = useMemo(() => ([
    { key: "type", label: "Type", render: (r) => editing?.id === r.id ? <Select value={editing.type} onChange={(e) => setEditing((p) => ({ ...p, type: e.target.value }))}><option>SMTP</option><option>SMS</option><option>PAYMENT</option><option>WHATSAPP</option></Select> : String(r.type || "").toUpperCase() },
    { key: "config", label: "Config", render: (r) => editing?.id === r.id ? <Input value={editing.config_json_text} onChange={(e) => setEditing((p) => ({ ...p, config_json_text: e.target.value }))} /> : JSON.stringify(r.config_json || {}) },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        {editing?.id === r.id ? <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={onUpdate}>Update</Button> : <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditing({ ...r, type: String(r.type || "").toUpperCase(), config_json_text: JSON.stringify(r.config_json || {}) })}>Edit</Button>}
        {editing?.id === r.id ? <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => setEditing(null)}>Cancel</Button> : null}
        <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDelete(r.id)}>Delete</Button>
      </div>
    ) }
  ]), [editing]);

  return (
    <DashboardLayout>
      <Card title="Create Integration" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={type} onChange={(e) => setType(e.target.value)}><option>SMTP</option><option>SMS</option><option>PAYMENT</option><option>WHATSAPP</option></Select>
          <Input value={configJson} onChange={(e) => setConfigJson(e.target.value)} placeholder='{"host":"..."}' />
          <Button onClick={onCreate}>Create</Button>
        </div>
      </Card>
      <Card title="Integrations"><Table columns={cols} rows={rows} /></Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { approveTransportRequest, listTransportRequests, rejectTransportRequest } from "../../../api/transport.api";

export default function AdminTransportRequests() {
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");

  async function load() {
    const res = await listTransportRequests({ status: status || undefined });
    setRows(res.data || []);
  }
  useEffect(() => { load(); }, [status]);

  const cols = useMemo(() => ([
    { key: "id", label: "ID" },
    { key: "student", label: "Student", render: (r) => r.student?.full_name || "-" },
    { key: "request_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "payload", label: "Payload", render: (r) => JSON.stringify(r.payload_json || {}) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await approveTransportRequest(r.id, { admin_note: note || null }); await load(); }}>Approve</Button>
          <Button type="button" variant="secondary" className="px-2 py-1 text-xs" onClick={async () => { await rejectTransportRequest(r.id, { admin_note: note || null }); await load(); }}>Reject</Button>
        </div>
      )
    }
  ]), [note]);

  return (
    <DashboardLayout>
      <Card title="Transport Requests">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </Select>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Admin note for approve/reject" />
          <Button onClick={load}>Refresh</Button>
        </div>
        <Table columns={cols} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { parentChildren, parentFees } from "../../api/parent.api";

export default function ParentFees() {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [rows, setRows] = useState([]);
  useEffect(() => {
    parentChildren().then((res) => {
      const data = res.data || [];
      setChildren(data);
      if (data.length) setStudentId(String(data[0].id));
    });
  }, []);

  async function load() {
    if (!studentId) return;
    const res = await parentFees({ student_id: Number(studentId) });
    setRows(res.data || []);
  }
  useEffect(() => { if (studentId) load(); }, [studentId]);

  const cols = useMemo(() => ([
    { key: "invoice_no", label: "Invoice" },
    { key: "billing_month", label: "Month" },
    { key: "total_amount", label: "Total" },
    { key: "paid_amount", label: "Paid" },
    { key: "due_amount", label: "Due" },
    { key: "status", label: "Status" },
    {
      key: "download",
      label: "Receipt",
      render: () => <Button type="button" variant="secondary" className="px-2 py-1 text-xs">Download</Button>
    }
  ]), []);

  return (
    <ParentLayout>
      <Card title="Fees">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select child</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </Select>
          <Button onClick={load}>Refresh</Button>
        </div>
        <Table columns={cols} rows={rows} />
      </Card>
    </ParentLayout>
  );
}

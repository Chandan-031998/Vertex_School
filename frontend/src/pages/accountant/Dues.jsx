import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { money } from "../../utils/format";
import { listInvoices } from "../../api/fees.api";
import { createNotification } from "../../api/notifications.api";

export default function Dues() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [sendingFor, setSendingFor] = useState("");

  async function load() {
    const [unpaid, partial] = await Promise.all([
      listInvoices({ month: month || undefined, status: "UNPAID" }),
      listInvoices({ month: month || undefined, status: "PARTIAL" })
    ]);
    setRows([...(unpaid.data || []), ...(partial.data || [])]);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendReminder(row) {
    setSendingFor(row.invoice_no);
    try {
      await createNotification({
        student_id: row.student_id,
        type: "FEE_REMINDER",
        title: `Fee due for ${row.billing_month}`,
        message: `Invoice ${row.invoice_no} has pending due of ${money(row.due_amount)}.`,
        channel: "IN_APP"
      });
    } finally {
      setSendingFor("");
    }
  }

  const columns = useMemo(() => ([
    { key: "invoice_no", label: "Invoice" },
    { key: "student", label: "Student" },
    { key: "billing_month", label: "Month" },
    { key: "due_amount", label: "Due", render: (r) => money(r.due_amount) },
    { key: "status", label: "Status" },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <Button
          className="px-2 py-1 text-xs"
          disabled={sendingFor === r.invoice_no}
          onClick={() => sendReminder(r)}
        >
          {sendingFor === r.invoice_no ? "Sending..." : "Send Reminder"}
        </Button>
      )
    }
  ]), [sendingFor]);

  return (
    <DashboardLayout>
      <Card title="Pending Dues">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button onClick={load}>Load Dues</Button>
        </div>
        <Table columns={columns} rows={rows} />
      </Card>
    </DashboardLayout>
  );
}

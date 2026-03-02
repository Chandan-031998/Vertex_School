import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { money } from "../../utils/format";
import { exportFeeCsv, generateInvoice, listInvoices, recordPayment } from "../../api/fees.api";
import { listStudents } from "../../api/students.api";

function statusTone(status) {
  if (status === "PAID") return "green";
  if (status === "PARTIAL") return "yellow";
  return "red";
}

export default function FeeInvoices() {
  const [students, setStudents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState("");

  const [newInvoice, setNewInvoice] = useState({ student_id: "", billing_month: new Date().toISOString().slice(0, 7) });
  const [payment, setPayment] = useState({ invoiceId: "", amount_paid: "", payment_mode: "CASH", transaction_ref: "" });

  async function loadInvoices() {
    const res = await listInvoices({ month: month || undefined, status: status || undefined });
    setInvoices(res.data || []);
  }

  useEffect(() => {
    listStudents({}).then((res) => setStudents(res.data || [])).catch(() => setStudents([]));
    loadInvoices();
  }, []);

  async function onGenerate(e) {
    e.preventDefault();
    await generateInvoice({ student_id: Number(newInvoice.student_id), billing_month: newInvoice.billing_month });
    await loadInvoices();
  }

  async function onPayment(e) {
    e.preventDefault();
    await recordPayment(Number(payment.invoiceId), {
      amount_paid: Number(payment.amount_paid),
      payment_mode: payment.payment_mode,
      transaction_ref: payment.transaction_ref || undefined
    });
    setPayment({ invoiceId: "", amount_paid: "", payment_mode: "CASH", transaction_ref: "" });
    await loadInvoices();
  }

  const columns = useMemo(() => ([
    { key: "invoice_no", label: "Invoice" },
    { key: "student", label: "Student" },
    { key: "billing_month", label: "Month" },
    { key: "total_amount", label: "Total", render: (r) => money(r.total_amount) },
    { key: "paid_amount", label: "Paid", render: (r) => money(r.paid_amount) },
    { key: "due_amount", label: "Due", render: (r) => money(r.due_amount) },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> }
  ]), []);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <Card title="Generate Invoice">
          <form className="space-y-3" onSubmit={onGenerate}>
            <Select required value={newInvoice.student_id} onChange={(e) => setNewInvoice((f) => ({ ...f, student_id: e.target.value }))}>
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name}-{s.section})</option>)}
            </Select>
            <Input required type="month" value={newInvoice.billing_month} onChange={(e) => setNewInvoice((f) => ({ ...f, billing_month: e.target.value }))} />
            <Button>Generate</Button>
          </form>
        </Card>

        <Card title="Record Payment">
          <form className="space-y-3" onSubmit={onPayment}>
            <Select required value={payment.invoiceId} onChange={(e) => setPayment((f) => ({ ...f, invoiceId: e.target.value }))}>
              <option value="">Select invoice</option>
              {invoices.map((r) => <option key={r.id} value={r.id}>{r.invoice_no} ({r.student})</option>)}
            </Select>
            <Input required type="number" min="1" value={payment.amount_paid} onChange={(e) => setPayment((f) => ({ ...f, amount_paid: e.target.value }))} placeholder="Amount" />
            <Select value={payment.payment_mode} onChange={(e) => setPayment((f) => ({ ...f, payment_mode: e.target.value }))}>
              <option value="CASH">CASH</option>
              <option value="ONLINE">ONLINE</option>
            </Select>
            <Input value={payment.transaction_ref} onChange={(e) => setPayment((f) => ({ ...f, transaction_ref: e.target.value }))} placeholder="Transaction ref (optional)" />
            <Button>Save Payment</Button>
          </form>
        </Card>
      </div>

      <Card title="Invoice List">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PAID">PAID</option>
          </Select>
          <Button onClick={loadInvoices}>Filter</Button>
          <a className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50" href={exportFeeCsv({ month: month || undefined })} target="_blank" rel="noreferrer">Export CSV</a>
        </div>
        <Table columns={columns} rows={invoices} />
      </Card>
    </DashboardLayout>
  );
}

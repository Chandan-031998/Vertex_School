import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { money } from "../../utils/format";
import {
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  generateInvoice,
  listFeeStructures,
  listInvoices,
  deleteInvoice,
  recordPayment,
  exportFeeCsv
} from "../../api/fees.api";
import { listStudents } from "../../api/students.api";

function invoiceTone(status) {
  if (status === "PAID") return "green";
  if (status === "PARTIAL") return "yellow";
  return "red";
}

const initialStructure = {
  class_name: "",
  fee_name: "Tuition",
  amount: "",
  frequency: "MONTHLY"
};

const initialInvoice = {
  student_id: "",
  billing_month: new Date().toISOString().slice(0, 7)
};

const initialPayment = {
  invoiceId: "",
  amount_paid: "",
  payment_mode: "CASH",
  transaction_ref: ""
};

export default function Fees() {
  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [structureForm, setStructureForm] = useState(initialStructure);
  const [editingStructureId, setEditingStructureId] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(initialInvoice);
  const [paymentForm, setPaymentForm] = useState(initialPayment);

  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  async function loadBase() {
    const [structureRes, studentRes] = await Promise.all([
      listFeeStructures(),
      listStudents({})
    ]);
    setStructures(structureRes.data || []);
    setStudents(studentRes.data || []);
  }

  async function loadInvoices() {
    setLoadingInvoices(true);
    try {
      const res = await listInvoices({
        month: monthFilter || undefined,
        status: statusFilter || undefined
      });
      setInvoices(res.data || []);
    } finally {
      setLoadingInvoices(false);
    }
  }

  useEffect(() => {
    loadBase();
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreateStructure(e) {
    e.preventDefault();
    const payload = { ...structureForm, amount: Number(structureForm.amount) };
    if (editingStructureId) await updateFeeStructure(editingStructureId, payload);
    else await createFeeStructure(payload);
    setStructureForm(initialStructure);
    setEditingStructureId(null);
    const refreshed = await listFeeStructures();
    setStructures(refreshed.data || []);
  }

  async function onGenerateInvoice(e) {
    e.preventDefault();
    await generateInvoice({
      student_id: Number(invoiceForm.student_id),
      billing_month: invoiceForm.billing_month
    });
    await loadInvoices();
  }

  async function onRecordPayment(e) {
    e.preventDefault();
    await recordPayment(Number(paymentForm.invoiceId), {
      amount_paid: Number(paymentForm.amount_paid),
      payment_mode: paymentForm.payment_mode,
      transaction_ref: paymentForm.transaction_ref || undefined
    });
    setPaymentForm(initialPayment);
    await loadInvoices();
  }

  async function onEditStructure(row) {
    setEditingStructureId(row.id);
    setStructureForm({
      class_name: row.class_name || "",
      fee_name: row.fee_name || "Tuition",
      amount: row.amount || "",
      frequency: row.frequency || "MONTHLY"
    });
  }

  async function onDeleteStructure(id) {
    await deleteFeeStructure(id);
    if (editingStructureId === id) {
      setEditingStructureId(null);
      setStructureForm(initialStructure);
    }
    const refreshed = await listFeeStructures();
    setStructures(refreshed.data || []);
  }

  async function onDeleteInvoice(id) {
    await deleteInvoice(id);
    await loadInvoices();
  }

  const invoiceColumns = useMemo(() => ([
    { key: "invoice_no", label: "Invoice" },
    { key: "student", label: "Student" },
    { key: "billing_month", label: "Month" },
    { key: "class_name", label: "Class" },
    { key: "total_amount", label: "Total", render: (r) => money(r.total_amount) },
    { key: "paid_amount", label: "Paid", render: (r) => money(r.paid_amount) },
    { key: "due_amount", label: "Due", render: (r) => money(r.due_amount) },
    { key: "status", label: "Status", render: (r) => <Badge tone={invoiceTone(r.status)}>{r.status}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDeleteInvoice(r.id)}>Delete</Button>
    }
  ]), []);

  const structureColumns = useMemo(() => ([
    { key: "class_name", label: "Class" },
    { key: "fee_name", label: "Fee" },
    { key: "frequency", label: "Frequency" },
    { key: "amount", label: "Amount", render: (r) => money(r.amount) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onEditStructure(r)}>Edit</Button>
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onDeleteStructure(r.id)}>Delete</Button>
        </div>
      )
    }
  ]), [editingStructureId]);

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <Card title={editingStructureId ? "Update Fee Structure" : "Add Fee Structure"}>
          <form className="space-y-3" onSubmit={onCreateStructure}>
            <Input required value={structureForm.class_name} onChange={(e) => setStructureForm((f) => ({ ...f, class_name: e.target.value }))} placeholder="Class (e.g., 10)" />
            <Input required value={structureForm.fee_name} onChange={(e) => setStructureForm((f) => ({ ...f, fee_name: e.target.value }))} placeholder="Fee name" />
            <Input required type="number" min="1" value={structureForm.amount} onChange={(e) => setStructureForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
            <Select value={structureForm.frequency} onChange={(e) => setStructureForm((f) => ({ ...f, frequency: e.target.value }))}>
              <option value="MONTHLY">MONTHLY</option>
              <option value="QUARTERLY">QUARTERLY</option>
              <option value="YEARLY">YEARLY</option>
            </Select>
            <div className="flex gap-2">
              <Button className="flex-1">{editingStructureId ? "Update Structure" : "Save Structure"}</Button>
              {editingStructureId ? (
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setEditingStructureId(null); setStructureForm(initialStructure); }}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Generate Invoice">
          <form className="space-y-3" onSubmit={onGenerateInvoice}>
            <Select required value={invoiceForm.student_id} onChange={(e) => setInvoiceForm((f) => ({ ...f, student_id: e.target.value }))}>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.class_name}-{s.section})</option>
              ))}
            </Select>
            <Input required type="month" value={invoiceForm.billing_month} onChange={(e) => setInvoiceForm((f) => ({ ...f, billing_month: e.target.value }))} />
            <Button className="w-full">Generate</Button>
          </form>
        </Card>

        <Card title="Record Payment">
          <form className="space-y-3" onSubmit={onRecordPayment}>
            <Select required value={paymentForm.invoiceId} onChange={(e) => setPaymentForm((f) => ({ ...f, invoiceId: e.target.value }))}>
              <option value="">Select invoice</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.invoice_no} ({inv.student})</option>
              ))}
            </Select>
            <Input required type="number" min="1" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm((f) => ({ ...f, amount_paid: e.target.value }))} placeholder="Amount paid" />
            <Select value={paymentForm.payment_mode} onChange={(e) => setPaymentForm((f) => ({ ...f, payment_mode: e.target.value }))}>
              <option value="CASH">CASH</option>
              <option value="ONLINE">ONLINE</option>
            </Select>
            <Input value={paymentForm.transaction_ref} onChange={(e) => setPaymentForm((f) => ({ ...f, transaction_ref: e.target.value }))} placeholder="Transaction ref (optional)" />
            <Button className="w-full">Save Payment</Button>
          </form>
        </Card>
      </div>

      <Card title="Fee Structures" className="mb-4">
        <Table columns={structureColumns} rows={structures} />
      </Card>

      <Card title="Invoices">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PAID">PAID</option>
          </Select>
          <Button onClick={loadInvoices}>{loadingInvoices ? "Loading..." : "Filter"}</Button>
          <a className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50" href={exportFeeCsv({ month: monthFilter || undefined })} target="_blank" rel="noreferrer">
            Export CSV
          </a>
        </div>
        <Table columns={invoiceColumns} rows={invoices} />
      </Card>
    </DashboardLayout>
  );
}

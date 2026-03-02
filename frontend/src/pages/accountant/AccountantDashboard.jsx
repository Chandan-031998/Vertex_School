import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import { listInvoices } from "../../api/fees.api";
import { money } from "../../utils/format";

export default function AccountantDashboard() {
  const [month] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);

  useEffect(() => {
    listInvoices({ month }).then((res) => setRows(res.data || [])).catch(() => setRows([]));
  }, [month]);

  const stats = useMemo(() => {
    let billed = 0;
    let collected = 0;
    let pending = 0;
    for (const r of rows) {
      billed += Number(r.total_amount || 0);
      collected += Number(r.paid_amount || 0);
      pending += Number(r.due_amount || 0);
    }
    return { billed, collected, pending };
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Billed This Month">
          <div className="text-3xl font-extrabold">{money(stats.billed)}</div>
          <div className="text-xs text-slate-500 mt-1">{month}</div>
        </Card>
        <Card title="Collected">
          <div className="text-3xl font-extrabold">{money(stats.collected)}</div>
          <div className="text-xs text-slate-500 mt-1">From paid and partial invoices</div>
        </Card>
        <Card title="Pending Dues">
          <div className="text-3xl font-extrabold">{money(stats.pending)}</div>
          <div className="text-xs text-slate-500 mt-1">Across unpaid and partial invoices</div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

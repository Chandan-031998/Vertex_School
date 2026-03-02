import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import { parentDashboard } from "../../api/parent.api";

export default function ParentDashboard() {
  const [data, setData] = useState({
    children_count: 0,
    attendance_today: { present: 0, absent: 0, unmarked: 0 },
    fees_dues: { pending_total: 0 },
    transport: { enabled: false, active_allocations: 0 },
    latest_notifications: []
  });

  useEffect(() => {
    parentDashboard().then((res) => setData(res.data || data)).catch(() => {});
  }, []);

  return (
    <ParentLayout>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Children"><div className="text-3xl font-extrabold">{data.children_count}</div></Card>
        <Card title="Pending Dues"><div className="text-3xl font-extrabold">{Number(data.fees_dues?.pending_total || 0).toFixed(2)}</div></Card>
        <Card title="Present Today"><div className="text-3xl font-extrabold text-emerald-700">{data.attendance_today?.present || 0}</div></Card>
        <Card title="Absent Today"><div className="text-3xl font-extrabold text-rose-700">{data.attendance_today?.absent || 0}</div></Card>
      </div>
      <Card title="Quick Actions" className="mt-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/parent/fees" className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">View Fees</Link>
          <Link to="/parent/attendance" className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">View Attendance</Link>
          <Link to="/parent/transport" className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">View Transport</Link>
        </div>
      </Card>
      <Card title="Recent Notifications" className="mt-4">
        <div className="space-y-2">
          {(data.latest_notifications || []).map((n) => (
            <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <div className="font-semibold">{n.title}</div>
              <div className="text-slate-600">{n.message}</div>
            </div>
          ))}
          {(!data.latest_notifications || !data.latest_notifications.length) ? <div className="text-sm text-slate-500">No notifications</div> : null}
        </div>
      </Card>
    </ParentLayout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import { teacherDashboard } from "../../api/teacher.api";

export default function TeacherDashboard() {
  const [data, setData] = useState({
    assigned_classes: [],
    total_students_assigned: 0,
    attendance_today: { present: 0, absent: 0, unmarked: 0 },
    pending_attendance_classes: [],
    quick_links: []
  });

  useEffect(() => {
    teacherDashboard()
      .then((res) => setData(res.data || {}))
      .catch(() => setData({
        assigned_classes: [],
        total_students_assigned: 0,
        attendance_today: { present: 0, absent: 0, unmarked: 0 },
        pending_attendance_classes: [],
        quick_links: []
      }));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-100 via-white to-emerald-100 px-6 py-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teacher Workspace</div>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">My Dashboard</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {(data.assigned_classes || []).map((c, idx) => (
            <span key={`${c.class_name}-${c.section}-${idx}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {c.class_name}-{c.section}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Assigned Students">
          <div className="text-3xl font-extrabold">{data.total_students_assigned || 0}</div>
        </Card>
        <Card title="Present Today">
          <div className="text-3xl font-extrabold text-emerald-700">{data.attendance_today?.present || 0}</div>
        </Card>
        <Card title="Absent Today">
          <div className="text-3xl font-extrabold text-rose-700">{data.attendance_today?.absent || 0}</div>
        </Card>
        <Card title="Unmarked Today">
          <div className="text-3xl font-extrabold text-amber-700">{data.attendance_today?.unmarked || 0}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Pending Attendance Classes">
          <div className="space-y-2">
            {(data.pending_attendance_classes || []).length ? data.pending_attendance_classes.map((c, idx) => (
              <div key={`${c.class_name}-${c.section}-${idx}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {c.class_name}-{c.section}
              </div>
            )) : <div className="text-sm text-slate-500">All assigned classes marked for today.</div>}
          </div>
        </Card>
        <Card title="Quick Links">
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white" to="/teacher/attendance">Mark Attendance</Link>
            <Link className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900" to="/teacher/students">View Students</Link>
            <Link className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900" to="/teacher/reports">Reports</Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

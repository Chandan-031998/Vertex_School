import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { adminDashboard } from "../../api/dashboard.api";
import { money } from "../../utils/format";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminDashboard().then((r) => setData(r.data)).catch(() => setData(null));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-100 via-white to-indigo-100 px-6 py-7 text-slate-900 shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">School Command Center</div>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-slate-600">Track academics, attendance, and collections from one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">Total Students</div>
          <div className="mt-2 text-3xl font-black text-slate-900">{data?.totals?.totalStudents ?? "-"}</div>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Total Staff</div>
          <div className="mt-2 text-3xl font-black text-slate-900">{data?.totals?.totalStaff ?? "-"}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Monthly Collection</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{data?.fees ? money(data.fees.collected) : "-"}</div>
          <div className="mt-1 text-xs text-slate-500">{data?.fees?.month}</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">Pending Dues</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{data?.fees ? money(data.fees.pending) : "-"}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Fee Summary">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>Billed</span>
              <b>{data?.fees ? money(data.fees.billed) : "-"}</b>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>Collected</span>
              <b>{data?.fees ? money(data.fees.collected) : "-"}</b>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>Pending</span>
              <b>{data?.fees ? money(data.fees.pending) : "-"}</b>
            </div>
          </div>
        </Card>
        <Card title="Attendance Overview (last 7 days)">
          <div className="space-y-2">
            {(data?.attendance || []).map((a) => (
              <div key={a.date} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-600">{a.date}</span>
                <span className="font-semibold text-slate-900">{a.present}/{a.total}</span>
              </div>
            ))}
            {(!data?.attendance || data.attendance.length===0) ? <div className="text-sm text-slate-500">No data</div> : null}
          </div>
        </Card>
      </div>

      <Card title="Attendance Taken By Class & Teacher (Today)" className="mt-6">
        <Table
          columns={[
            { key: "class_name", label: "Class" },
            { key: "section", label: "Section" },
            { key: "teacher_name", label: "Teacher" },
            { key: "taken_count", label: "Attendance Entries" },
            { key: "date", label: "Date" }
          ]}
          rows={data?.attendanceByClassTeacher || []}
        />
      </Card>
    </DashboardLayout>
  );
}

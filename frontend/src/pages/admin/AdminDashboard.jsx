import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BadgeDollarSign, GraduationCap, UserSquare2, WalletCards } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import { Skeleton, StatSkeletonCard } from "../../components/ui/Skeleton";
import { adminDashboard } from "../../api/dashboard.api";
import { money } from "../../utils/format";

const containerVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function StatCard({ label, value, icon: Icon, subtitle, moneyMode = false }) {
  return (
    <motion.div
      variants={itemVariant}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
          <motion.div
            key={String(value)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-2 text-3xl font-black text-slate-800"
          >
            <AnimatedCounter value={Number(value) || 0} formatter={(num) => (moneyMode ? money(num) : Math.round(num).toLocaleString())} />
          </motion.div>
          <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-100">
          <Icon size={20} className="text-indigo-600" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminDashboard()
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const attendanceChartData = useMemo(
    () =>
      (data?.attendance || []).map((a) => ({
        day: a.date?.slice(5) || a.date,
        present: Number(a.present || 0),
        total: Number(a.total || 0)
      })),
    [data]
  );

  const feeChartData = useMemo(() => {
    const fees = data?.fees;
    if (!fees) return [];
    return [
      { name: "Billed", amount: Number(fees.billed || 0) },
      { name: "Collected", amount: Number(fees.collected || 0) },
      { name: "Pending", amount: Number(fees.pending || 0) }
    ];
  }, [data]);

  return (
    <DashboardLayout>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-6 text-white shadow-lg"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">School Command Center</div>
        <h1 className="mt-2 text-3xl font-black">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-white/90">Track academics, attendance, and fee operations from one professional dashboard.</p>
      </motion.section>

      <motion.div variants={containerVariant} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Total Students" subtitle="Enrolled learners" value={data?.totals?.totalStudents ?? 0} icon={GraduationCap} />
            <StatCard label="Total Staff" subtitle="Active team" value={data?.totals?.totalStaff ?? 0} icon={UserSquare2} />
            <StatCard label="Monthly Collection" subtitle={data?.fees?.month || "Current month"} value={data?.fees?.collected ?? 0} icon={BadgeDollarSign} moneyMode />
            <StatCard label="Pending Dues" subtitle="Outstanding amount" value={data?.fees?.pending ?? 0} icon={WalletCards} moneyMode />
          </>
        )}
      </motion.div>

      <motion.div variants={containerVariant} initial="hidden" animate="show" className="mt-6 grid gap-5 lg:grid-cols-2">
        <motion.div variants={itemVariant}>
          <Card title="Attendance Trend (Last 7 Days)">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#FFFFFF" }} />
                    <Area type="monotone" dataKey="present" stroke="#4F46E5" strokeWidth={3} fill="url(#attendanceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariant}>
          <Card title="Fee Collection Summary">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeChartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip formatter={(value) => money(Number(value || 0))} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#FFFFFF" }} />
                    <Bar dataKey="amount" radius={[12, 12, 0, 0]} fill="#06B6D4" animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariant} initial="hidden" animate="show" className="mt-6">
        <Card title="Attendance Taken By Class & Teacher (Today)">
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
      </motion.div>
    </DashboardLayout>
  );
}

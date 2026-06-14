import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BadgeDollarSign,
  CalendarCheck2,
  GraduationCap,
  IndianRupee,
  RefreshCw,
  UserSquare2,
  WalletCards
} from "lucide-react";
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
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

const FEE_COLORS = ["#4F46E5", "#06B6D4", "#F59E0B"];

function StatCard({ label, value, icon: Icon, subtitle, moneyMode = false, accent }) {
  return (
    <motion.div
      variants={itemVariant}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </div>
          <motion.div
            key={String(value)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl"
          >
            <AnimatedCounter
              value={Number(value) || 0}
              formatter={(num) => (moneyMode ? money(num) : Math.round(num).toLocaleString())}
            />
          </motion.div>
          <div className="mt-1 truncate text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
          <Icon size={21} />
        </div>
      </div>
    </motion.div>
  );
}

function ChartToggle({ value, onChange, options, label }) {
  return (
    <div aria-label={label} className="inline-flex rounded-lg bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
            value === option.value
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="grid h-72 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-indigo-600">
          <CalendarCheck2 className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-700">No chart data yet</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function DashboardTooltip({ active, payload, label, moneyMode = false, rateMode = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="mb-1 text-xs font-bold text-slate-700">{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="font-bold text-slate-900">
            {moneyMode
              ? money(Number(item.value || 0))
              : rateMode
                ? `${Number(item.value || 0).toFixed(1)}%`
                : Number(item.value || 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRange, setAttendanceRange] = useState(7);
  const [attendanceMode, setAttendanceMode] = useState("count");
  const [feeMode, setFeeMode] = useState("bar");

  function loadDashboard() {
    setLoading(true);
    adminDashboard()
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const allAttendanceData = useMemo(
    () =>
      (data?.attendance || []).map((item) => {
        const present = Number(item.present || 0);
        const total = Number(item.total || 0);
        return {
          day: item.date
            ? new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
              })
            : "",
          present,
          absent: Math.max(total - present, 0),
          total,
          rate: total ? (present / total) * 100 : 0
        };
      }),
    [data]
  );

  const attendanceChartData = useMemo(
    () => allAttendanceData.slice(-attendanceRange),
    [allAttendanceData, attendanceRange]
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

  const attendanceRate = useMemo(() => {
    const totals = attendanceChartData.reduce(
      (acc, item) => ({ present: acc.present + item.present, total: acc.total + item.total }),
      { present: 0, total: 0 }
    );
    return totals.total ? (totals.present / totals.total) * 100 : 0;
  }, [attendanceChartData]);

  const collectionRate = Number(data?.fees?.billed)
    ? (Number(data?.fees?.collected || 0) / Number(data.fees.billed)) * 100
    : 0;

  return (
    <DashboardLayout>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 px-5 py-6 text-white shadow-xl shadow-indigo-600/15 sm:px-7 sm:py-8"
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100">
              School Command Center
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
              Live visibility into academics, attendance, staffing, and fee operations.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-bold backdrop-blur transition hover:bg-white/20 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh data
          </button>
        </div>
      </motion.section>

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {loading ? (
          <>
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Total Students"
              subtitle="Active enrolled learners"
              value={data?.totals?.totalStudents ?? 0}
              icon={GraduationCap}
              accent="from-indigo-600 to-blue-500"
            />
            <StatCard
              label="Total Staff"
              subtitle="School team members"
              value={data?.totals?.totalStaff ?? 0}
              icon={UserSquare2}
              accent="from-violet-600 to-fuchsia-500"
            />
            <StatCard
              label="Monthly Collection"
              subtitle={`${collectionRate.toFixed(0)}% of billed fees`}
              value={data?.fees?.collected ?? 0}
              icon={BadgeDollarSign}
              moneyMode
              accent="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="Pending Dues"
              subtitle={data?.fees?.month || "Current month"}
              value={data?.fees?.pending ?? 0}
              icon={WalletCards}
              moneyMode
              accent="from-amber-500 to-orange-500"
            />
          </>
        )}
      </motion.div>

      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="show"
        className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]"
      >
        <motion.div variants={itemVariant}>
          <Card className="h-full !p-4 sm:!p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Attendance Trend</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {attendanceRate.toFixed(1)}% average attendance in selected period
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ChartToggle
                  label="Attendance display"
                  value={attendanceMode}
                  onChange={setAttendanceMode}
                  options={[
                    { value: "count", label: "Count" },
                    { value: "rate", label: "Rate" }
                  ]}
                />
                <ChartToggle
                  label="Attendance range"
                  value={attendanceRange}
                  onChange={setAttendanceRange}
                  options={[
                    { value: 7, label: "7D" },
                    { value: 14, label: "14D" },
                    { value: 30, label: "30D" }
                  ]}
                />
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : attendanceChartData.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#64748B" fontSize={11} />
                    <YAxis
                      domain={attendanceMode === "rate" ? [0, 100] : [0, "auto"]}
                      axisLine={false}
                      tickLine={false}
                      stroke="#64748B"
                      fontSize={11}
                      tickFormatter={(value) => (attendanceMode === "rate" ? `${value}%` : value)}
                    />
                    <Tooltip
                      content={<DashboardTooltip rateMode={attendanceMode === "rate"} />}
                      cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
                    />
                    {attendanceMode === "rate" ? (
                      <Area
                        type="monotone"
                        dataKey="rate"
                        name="Attendance"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fill="url(#presentGradient)"
                        activeDot={{ r: 6, strokeWidth: 3, stroke: "#FFFFFF" }}
                      />
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey="present"
                          name="Present"
                          stroke="#4F46E5"
                          strokeWidth={3}
                          fill="url(#presentGradient)"
                          activeDot={{ r: 6, strokeWidth: 3, stroke: "#FFFFFF" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total"
                          stroke="#06B6D4"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Insert attendance records for recent dates to populate this trend." />
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariant}>
          <Card className="h-full !p-4 sm:!p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Fee Collection</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {collectionRate.toFixed(1)}% collection efficiency this month
                </p>
              </div>
              <ChartToggle
                label="Fee chart type"
                value={feeMode}
                onChange={setFeeMode}
                options={[
                  { value: "bar", label: "Bars" },
                  { value: "donut", label: "Donut" }
                ]}
              />
            </div>

            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : feeChartData.some((item) => item.amount > 0) ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {feeMode === "bar" ? (
                    <BarChart data={feeChartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748B" fontSize={11} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        stroke="#64748B"
                        fontSize={11}
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                      />
                      <Tooltip content={<DashboardTooltip moneyMode />} cursor={{ fill: "#F8FAFC" }} />
                      <Bar dataKey="amount" name="Amount" radius={[10, 10, 3, 3]} animationDuration={700}>
                        {feeChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={FEE_COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={feeChartData.filter((item) => item.name !== "Billed")}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius="52%"
                        outerRadius="76%"
                        paddingAngle={4}
                        stroke="none"
                      >
                        <Cell fill="#06B6D4" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip content={<DashboardTooltip moneyMode />} />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={9} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart message="Insert current-month fee invoices and payments to show collection performance." />
            )}
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariant} initial="hidden" animate="show" className="mt-5">
        <Card className="!p-4 sm:!p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Today&apos;s Attendance Activity</h2>
              <p className="text-xs text-slate-500">Entries grouped by class and marking teacher</p>
            </div>
          </div>
          <div className="overflow-x-auto">
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
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

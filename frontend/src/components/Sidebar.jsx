import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeIndianRupee,
  Bell,
  BellRing,
  BookOpen,
  BookOpenCheck,
  BriefcaseBusiness,
  Bus,
  BusFront,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock3,
  ContactRound,
  CreditCard,
  FileBarChart2,
  Flag,
  Gauge,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MapPinned,
  Menu,
  MessageSquareWarning,
  NotebookTabs,
  RadioTower,
  ReceiptIndianRupee,
  Route,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
  UsersRound,
  UserRoundCheck,
  UserRoundCog,
  UserRoundPlus,
  UserSquare2,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getStoredBranding, resolveBrandingAssetUrl } from "../utils/branding";

const iconByLabel = {
  Dashboard: LayoutDashboard,
  Reports: ChartNoAxesCombined,
  Admissions: UserRoundPlus,
  Students: GraduationCap,
  Attendance: ClipboardCheck,
  Timetable: Clock3,
  "Fees & Billing": ReceiptIndianRupee,
  Staff: BriefcaseBusiness,
  Parents: UsersRound,
  "Assign Classes": BookOpenCheck,
  Notifications: BellRing,
  Vehicles: BusFront,
  "Routes & Stops": MapPinned,
  "Drivers & Attendants": ContactRound,
  Assignments: GitBranch,
  "Student Allocation": UserRoundCheck,
  "Trips / Live Status": RadioTower,
  Requests: MessageSquareWarning,
  "Transport Notifications": Bell,
  Settings: SlidersHorizontal,
  Homework: NotebookTabs,
  Exams: FileBarChart2,
  Messages: Mail,
  Profile: UserRoundCog,
  Invoices: CreditCard,
  "Pending Dues": BadgeIndianRupee,
  "Fee Reminders": BellRing,
  "My Children": Users,
  Fees: ReceiptIndianRupee,
  Transport: Bus,
  "Teacher Panel": BookOpen,
  Security: Shield,
  "Live Status": Gauge,
  Calendar: CalendarDays,
  Routes: Route,
  Account: UserSquare2,
  General: Settings,
  Flags: Flag
};

const menus = {
  ADMIN: [
    { group: "Overview", items: [{ to: "/admin", label: "Dashboard" }, { to: "/admin/reports", label: "Reports" }] },
    { group: "Academics", items: [{ to: "/admin/admissions", label: "Admissions" }, { to: "/admin/students", label: "Students" }, { to: "/admin/attendance", label: "Attendance" }, { to: "/admin/timetable", label: "Timetable" }] },
    { group: "Operations", items: [{ to: "/admin/fees", label: "Fees & Billing" }, { to: "/admin/staff", label: "Staff" }, { to: "/admin/parents", label: "Parents" }, { to: "/admin/staff/assign-classes", label: "Assign Classes" }, { to: "/admin/notifications", label: "Notifications" }] },
    { group: "Transport", items: [{ to: "/admin/transport/vehicles", label: "Vehicles" }, { to: "/admin/transport/routes", label: "Routes & Stops" }, { to: "/admin/transport/drivers", label: "Drivers & Attendants" }, { to: "/admin/transport/assignments", label: "Assignments" }, { to: "/admin/transport/allocations", label: "Student Allocation" }, { to: "/admin/transport/trips", label: "Trips / Live Status" }, { to: "/admin/transport/requests", label: "Requests" }, { to: "/admin/transport/notifications", label: "Transport Notifications" }] },
    { group: "System", items: [{ to: "/admin/settings", label: "Settings" }] }
  ],
  TEACHER: [
    { group: "Teacher Panel", items: [{ to: "/teacher", label: "Dashboard" }, { to: "/teacher/students", label: "Students" }, { to: "/teacher/attendance", label: "Attendance" }, { to: "/teacher/homework", label: "Homework" }, { to: "/teacher/exams", label: "Exams" }, { to: "/teacher/timetable", label: "Timetable" }, { to: "/teacher/messages", label: "Messages" }, { to: "/teacher/reports", label: "Reports" }, { to: "/teacher/profile", label: "Profile" }] }
  ],
  ACCOUNTANT: [
    { group: "Finance", items: [{ to: "/accountant", label: "Dashboard" }, { to: "/accountant/fees", label: "Invoices" }, { to: "/accountant/dues", label: "Pending Dues" }, { to: "/accountant/notifications", label: "Fee Reminders" }] }
  ],
  PARENT: [
    { group: "Parent Portal", items: [{ to: "/parent/dashboard", label: "Dashboard" }, { to: "/parent/children", label: "My Children" }, { to: "/parent/attendance", label: "Attendance" }, { to: "/parent/fees", label: "Fees" }, { to: "/parent/transport", label: "Transport" }, { to: "/parent/requests", label: "Requests" }, { to: "/parent/notifications", label: "Notifications" }, { to: "/parent/settings", label: "Settings" }] }
  ],
  TRANSPORT_MANAGER: [
    { group: "Transport", items: [{ to: "/admin/transport/vehicles", label: "Vehicles" }, { to: "/admin/transport/routes", label: "Routes & Stops" }, { to: "/admin/transport/drivers", label: "Drivers & Attendants" }, { to: "/admin/transport/assignments", label: "Assignments" }, { to: "/admin/transport/allocations", label: "Student Allocation" }, { to: "/admin/transport/trips", label: "Trips / Live Status" }, { to: "/admin/transport/requests", label: "Requests" }, { to: "/admin/transport/notifications", label: "Transport Notifications" }] }
  ]
};

function BrandMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 shadow-sm">
      <span className="text-sm font-black tracking-wide text-white">V</span>
    </div>
  );
}

function SidebarContent({ collapsed, setCollapsed, setMobileOpen }) {
  const { user } = useAuth();
  const loc = useLocation();
  const groups = menus[user?.role] || [];
  const [branding, setBranding] = useState({
    product_name: "Vertex",
    logo_url: ""
  });

  useEffect(() => {
    const stored = getStoredBranding();
    if (stored) {
      setBranding((prev) => ({ ...prev, ...stored }));
    }
  }, []);

  const menuGroups = useMemo(() => groups, [groups]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {branding.logo_url ? (
              <img src={resolveBrandingAssetUrl(branding.logo_url)} alt="logo" className="h-10 w-10 rounded-xl border border-slate-200 object-cover" />
            ) : (
              <BrandMark />
            )}
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <div className="truncate text-lg font-extrabold text-slate-800">
                {branding.product_name || "Vertex"}
              </div>
              <div className="text-xs text-slate-500">School Manager</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden rounded-xl p-2 text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-800 lg:inline-flex"
            aria-label="Toggle Sidebar"
          >
            <Menu size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex rounded-xl p-2 text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div
              className={`px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              {group.group}
            </div>
            {group.items.map((m) => {
              const Icon = iconByLabel[m.label] || BookOpen;
              const isRootDashboard = ["/admin", "/teacher", "/accountant"].includes(m.to);
              const active =
                loc.pathname === m.to ||
                (!isRootDashboard && loc.pathname.startsWith(`${m.to}/`)) ||
                (m.to === "/admin/settings" && loc.pathname.startsWith("/admin/settings"));

              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? m.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    collapsed ? "lg:justify-center" : "lg:justify-start"
                  } ${
                    active
                      ? "bg-gradient-to-r from-indigo-50 to-cyan-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className={`truncate ${collapsed ? "lg:hidden" : "lg:inline"}`}>{m.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <span className={collapsed ? "lg:hidden" : ""}>
              Signed in as <span className="font-semibold text-slate-800">{user?.role}</span>
          </span>
          <span className={`place-items-center font-semibold text-slate-800 ${collapsed ? "hidden lg:grid" : "hidden"}`}>
            {user?.role?.slice(0, 2) || "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen ? (
        <motion.button
          type="button"
          aria-label="Close navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 cursor-default bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <motion.aside
        initial={false}
        layout
        className={`fixed inset-y-0 left-0 z-40 w-[min(88vw,304px)] border-r border-slate-200 bg-white shadow-2xl transition-[transform,width] duration-300 ease-out lg:static lg:translate-x-0 lg:shadow-none ${
          collapsed ? "lg:w-[88px]" : "lg:w-72"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </motion.aside>
    </>
  );
}

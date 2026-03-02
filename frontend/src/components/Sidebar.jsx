import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  CreditCard,
  FileBarChart2,
  Flag,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Route,
  Settings,
  Shield,
  Users,
  UserSquare2,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getStoredBranding, resolveBrandingAssetUrl } from "../utils/branding";

const iconByLabel = {
  Dashboard: LayoutDashboard,
  Reports: FileBarChart2,
  Admissions: GraduationCap,
  Students: Users,
  Attendance: CalendarDays,
  Timetable: CalendarDays,
  "Fees & Billing": CreditCard,
  Staff: UserSquare2,
  Parents: Users,
  "Assign Classes": BookOpen,
  Notifications: Bell,
  Vehicles: Bus,
  "Routes & Stops": Route,
  "Drivers & Attendants": Users,
  Assignments: Shield,
  "Student Allocation": Users,
  "Trips / Live Status": Gauge,
  Requests: Flag,
  "Transport Notifications": Bell,
  Settings
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
            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold text-slate-800">{branding.product_name || "Vertex"}</div>
                <div className="text-xs text-slate-500">School Manager</div>
              </div>
            ) : null}
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
            {!collapsed ? <div className="px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{group.group}</div> : null}
            {group.items.map((m) => {
              const Icon = iconByLabel[m.label] || BookOpen;
              const active =
                loc.pathname === m.to ||
                loc.pathname.startsWith(`${m.to}/`) ||
                (m.to === "/admin/settings" && loc.pathname.startsWith("/admin/settings"));

              return (
                <Link
                  key={m.to}
                  to={m.to}
                  title={collapsed ? m.label : undefined}
                  className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                    active ? "bg-indigo-50 text-indigo-600" : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                    <Icon size={16} />
                  </span>
                  {!collapsed ? <span className="truncate">{m.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          {!collapsed ? (
            <>
              Signed in as <span className="font-semibold text-slate-800">{user?.role}</span>
            </>
          ) : (
            <span className="grid place-items-center font-semibold text-slate-800">{user?.role?.slice(0, 2) || "--"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-30 bg-slate-900/25 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 88 : 288 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} setMobileOpen={setMobileOpen} />
      </motion.aside>
    </>
  );
}

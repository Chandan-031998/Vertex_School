import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { applyBrandingTheme, getStoredBranding, resolveBrandingAssetUrl } from "../utils/branding";

const menus = {
  ADMIN: [
    {
      group: "Overview",
      items: [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/reports", label: "Reports" }
      ]
    },
    {
      group: "Academics",
      items: [
        { to: "/admin/admissions", label: "Admissions" },
        { to: "/admin/students", label: "Students" },
        { to: "/admin/attendance", label: "Attendance" },
        { to: "/admin/timetable", label: "Timetable" }
      ]
    },
    {
      group: "Operations",
      items: [
        { to: "/admin/fees", label: "Fees & Billing" },
        { to: "/admin/staff", label: "Staff" },
        { to: "/admin/parents", label: "Parents" },
        { to: "/admin/staff/assign-classes", label: "Assign Classes" },
        { to: "/admin/notifications", label: "Notifications" }
      ]
    },
    {
      group: "Transport",
      items: [
        { to: "/admin/transport/vehicles", label: "Vehicles" },
        { to: "/admin/transport/routes", label: "Routes & Stops" },
        { to: "/admin/transport/drivers", label: "Drivers & Attendants" },
        { to: "/admin/transport/assignments", label: "Assignments" },
        { to: "/admin/transport/allocations", label: "Student Allocation" },
        { to: "/admin/transport/trips", label: "Trips / Live Status" },
        { to: "/admin/transport/requests", label: "Requests" },
        { to: "/admin/transport/notifications", label: "Transport Notifications" }
      ]
    },
    {
      group: "System",
      items: [
        { to: "/admin/settings", label: "Settings" }
      ]
    }
  ],
  TEACHER: [
    {
      group: "Teacher Panel",
      items: [
        { to: "/teacher", label: "Dashboard" },
        { to: "/teacher/students", label: "Students" },
        { to: "/teacher/attendance", label: "Attendance" },
        { to: "/teacher/homework", label: "Homework" },
        { to: "/teacher/exams", label: "Exams" },
        { to: "/teacher/timetable", label: "Timetable" },
        { to: "/teacher/messages", label: "Messages" },
        { to: "/teacher/reports", label: "Reports" },
        { to: "/teacher/profile", label: "Profile" }
      ]
    }
  ],
  ACCOUNTANT: [
    {
      group: "Finance",
      items: [
        { to: "/accountant", label: "Dashboard" },
        { to: "/accountant/fees", label: "Invoices" },
        { to: "/accountant/dues", label: "Pending Dues" },
        { to: "/accountant/notifications", label: "Fee Reminders" }
      ]
    }
  ],
  PARENT: [
    {
      group: "Parent Portal",
      items: [
        { to: "/parent/dashboard", label: "Dashboard" },
        { to: "/parent/children", label: "My Children" },
        { to: "/parent/attendance", label: "Attendance" },
        { to: "/parent/fees", label: "Fees" },
        { to: "/parent/transport", label: "Transport" },
        { to: "/parent/requests", label: "Requests" },
        { to: "/parent/notifications", label: "Notifications" },
        { to: "/parent/settings", label: "Settings" }
      ]
    }
  ],
  TRANSPORT_MANAGER: [
    {
      group: "Transport",
      items: [
        { to: "/admin/transport/vehicles", label: "Vehicles" },
        { to: "/admin/transport/routes", label: "Routes & Stops" },
        { to: "/admin/transport/drivers", label: "Drivers & Attendants" },
        { to: "/admin/transport/assignments", label: "Assignments" },
        { to: "/admin/transport/allocations", label: "Student Allocation" },
        { to: "/admin/transport/trips", label: "Trips / Live Status" },
        { to: "/admin/transport/requests", label: "Requests" },
        { to: "/admin/transport/notifications", label: "Transport Notifications" }
      ]
    }
  ]
};

function BrandMark({ primary, secondary }) {
  return (
    <div
      className="grid h-10 w-10 place-items-center rounded-xl shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${primary || "var(--brand-primary)"} 0%, ${secondary || "var(--brand-secondary)"} 100%)`
      }}
    >
      <span className="text-sm font-black text-white tracking-wide">V</span>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const loc = useLocation();
  const groups = menus[user?.role] || [];
  const [branding, setBranding] = useState({
    product_name: "Vertex",
    logo_url: "",
    primary_color: "#3030C8",
    secondary_color: "#2626B6"
  });

  useEffect(() => {
    const stored = getStoredBranding();
    if (stored) {
      setBranding((p) => ({ ...p, ...stored }));
      applyBrandingTheme(stored);
    }
  }, []);

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img src={resolveBrandingAssetUrl(branding.logo_url)} alt="logo" className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
          ) : (
            <BrandMark primary={branding.primary_color} secondary={branding.secondary_color} />
          )}
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-slate-900">
              {branding.product_name || "Vertex"}
            </div>
            <div className="text-xs text-slate-500">School Manager</div>
          </div>
        </div>
      </div>
      <nav className="space-y-4 px-3 py-4">
        {groups.map((group) => (
          <div key={group.group} className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{group.group}</div>
            {group.items.map((m) => {
              const active = loc.pathname === m.to || loc.pathname.startsWith(`${m.to}/`) || (m.to === "/admin/settings" && loc.pathname.startsWith("/admin/settings"));
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className={`mb-1 block rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "text-white" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}
                  style={active ? { background: `linear-gradient(135deg, ${branding.primary_color || "var(--brand-primary)"} 0%, ${branding.secondary_color || "var(--brand-secondary)"} 100%)` } : undefined}
                >
                  {m.label}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
          Signed in as <span className="font-semibold text-slate-900">{user?.role}</span>
        </div>
      </nav>
    </aside>
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Menu } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-slate-50 px-4 py-4 md:px-8">
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-5 text-white shadow-lg">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Control Center</div>
        <div className="mt-1 text-xl font-extrabold md:text-2xl">Welcome back, {user?.full_name || "Team"}</div>
        <p className="mt-1 text-sm text-white/90">Track attendance, fees, and academics from one clean EdTech dashboard.</p>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen?.(true)}
            className="inline-flex rounded-xl border border-slate-300 bg-white p-2 text-slate-800 transition-all duration-300 ease-in-out hover:bg-slate-100 lg:hidden"
            aria-label="Open Menu"
          >
            <Menu size={18} />
          </button>
          <div className="text-sm text-slate-500">
            Signed in as <span className="font-semibold text-slate-800">{user?.role}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 transition-all duration-300 ease-in-out hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-500" />
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-300 ease-in-out hover:bg-slate-100"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                {(user?.full_name || "U").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{user?.full_name || "User"}</span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                >
                  <div className="px-2 py-1 text-xs text-slate-500">{user?.role}</div>
                  <Button variant="secondary" className="w-full justify-start" onClick={logout}>
                    Logout
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

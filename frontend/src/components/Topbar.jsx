import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/85 px-6 py-3 backdrop-blur">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Control Panel</div>
        <div className="text-sm text-slate-700">Welcome, <span className="font-semibold text-slate-900">{user?.full_name}</span></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-1 text-xs font-semibold text-white">{user?.role}</div>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>
    </header>
  );
}

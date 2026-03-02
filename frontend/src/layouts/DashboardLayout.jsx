import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <Sidebar />
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute top-40 left-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>
        <Topbar />
        <main className="relative z-10 p-6">{children}</main>
      </div>
    </div>
  );
}

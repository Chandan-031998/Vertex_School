export default function Badge({ color = "slate", children }) {
  const map = {
    slate: "bg-slate-100 text-slate-800",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
    cyan: "bg-cyan-100 text-cyan-600"
  };

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${map[color] || map.slate}`}>{children}</span>;
}

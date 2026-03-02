export default function Badge({ children, tone="slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    yellow: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700"
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${map[tone] || map.slate}`}>{children}</span>;
}

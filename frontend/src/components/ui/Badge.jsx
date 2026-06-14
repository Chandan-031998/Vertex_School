export default function Badge({ color, tone, children }) {
  const map = {
    slate: "bg-slate-100 text-slate-800",
    emerald: "bg-emerald-100 text-emerald-600",
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    yellow: "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
    cyan: "bg-cyan-100 text-cyan-600"
  };
  const resolvedColor = color || tone || "slate";

  return <span className={`inline-flex max-w-full break-words rounded-full px-2 py-1 text-xs font-medium ${map[resolvedColor] || map.slate}`}>{children}</span>;
}

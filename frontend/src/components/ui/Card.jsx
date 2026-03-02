export default function Card({ title, children, className="" }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur ${className}`}>
      {title ? <div className="px-5 pt-5 pb-2 font-semibold text-slate-900">{title}</div> : null}
      <div className="p-5 pt-3">{children}</div>
    </div>
  );
}

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`app-card ${className}`}>
      {title ? <div className="pb-2 text-base font-semibold text-slate-800">{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

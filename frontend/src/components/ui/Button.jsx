export default function Button({ className="", variant="primary", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const styles = variant === "secondary"
    ? "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
    : "btn-primary-theme";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

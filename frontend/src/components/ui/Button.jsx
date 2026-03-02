export default function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out active:scale-[0.98]";
  const styles =
    variant === "secondary"
      ? "bg-white border border-slate-300 text-slate-800 shadow-sm hover:bg-slate-100"
      : "bg-indigo-600 text-white shadow-md hover:bg-indigo-700";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

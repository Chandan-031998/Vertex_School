export default function Input({ className="", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    />
  );
}

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all duration-300 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}

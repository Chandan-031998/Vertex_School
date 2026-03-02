export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-sm border border-slate-100 p-6">
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-brand-500"></div>
          <div className="text-sm text-slate-500">School Manager</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-indigo-600"></div>
          <div className="text-sm text-slate-500">School Manager</div>
        </div>
        {children}
      </div>
    </div>
  );
}

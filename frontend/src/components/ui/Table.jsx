function renderCell(column, row) {
  return typeof column.render === "function" ? column.render(row) : row[column.key];
}

export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="min-w-0">
      <div className="hidden overflow-x-auto rounded-xl border border-slate-100 md:block">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left font-semibold text-slate-700">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id || idx} className="border-t border-slate-100 hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className="max-w-xs break-words px-4 py-3 align-top text-slate-800">{renderCell(c, r)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length || 1} className="px-4 py-6 text-center text-slate-500">No data</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((r, idx) => (
          <div key={r.id || idx} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            {columns.map((c) => (
              <div key={c.key} className="grid gap-1 border-b border-slate-100 py-2 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{c.label}</div>
                <div className="min-w-0 break-words text-sm text-slate-800">{renderCell(c, r)}</div>
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-center text-sm text-slate-500">No data</div>
        ) : null}
      </div>
    </div>
  );
}

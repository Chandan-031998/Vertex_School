function toCsv(rows, headers) {
  const cols = headers || (rows[0] ? Object.keys(rows[0]) : []);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replaceAll('"', '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [];
  lines.push(cols.map(escape).join(","));
  for (const r of rows) {
    lines.push(cols.map((c) => escape(r[c])).join(","));
  }
  return lines.join("\n");
}
module.exports = { toCsv };

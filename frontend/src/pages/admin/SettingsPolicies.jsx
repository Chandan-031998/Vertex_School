import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { getAttendanceSettings, getFeeSettings, getSecuritySettings, updateAttendanceSettings, updateFeeSettings, updateSecuritySettings } from "../../api/settings.api";

export default function SettingsPolicies() {
  const defaultFee = {
    currency: "INR",
    receipt_prefix: "VSM-REC",
    invoice_prefix: "VSM-INV",
    late_fee_enabled: false,
    late_fee_type: "FIXED",
    late_fee_value: 0,
    grace_days: 0,
    payment_methods_json: ["CASH", "ONLINE", "UPI"]
  };
  const defaultAttendance = {
    mode: "DAILY",
    cutoff_time: "",
    allow_edit_days: 1,
    auto_absent_after_cutoff: false,
    leave_types_json: ["SICK", "CASUAL", "OFFICIAL"]
  };
  const defaultSecurity = {
    password_min_length: 8,
    password_require_upper: true,
    password_require_number: true,
    password_require_symbol: false,
    session_timeout_minutes: 120,
    enable_2fa: false
  };

  const [fee, setFee] = useState({
    currency: "INR",
    receipt_prefix: "VSM-REC",
    invoice_prefix: "VSM-INV",
    late_fee_enabled: false,
    late_fee_type: "FIXED",
    late_fee_value: 0,
    grace_days: 0,
    payment_methods_json: ["CASH", "ONLINE", "UPI"]
  });
  const [attendance, setAttendance] = useState({
    mode: "DAILY",
    cutoff_time: "",
    allow_edit_days: 1,
    auto_absent_after_cutoff: false,
    leave_types_json: ["SICK", "CASUAL", "OFFICIAL"]
  });
  const [security, setSecurity] = useState({
    password_min_length: 8,
    password_require_upper: true,
    password_require_number: true,
    password_require_symbol: false,
    session_timeout_minutes: 120,
    enable_2fa: false
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const [f, a, s] = await Promise.all([getFeeSettings(), getAttendanceSettings(), getSecuritySettings()]);
      if (f.data) setFee((p) => ({ ...p, ...f.data }));
      if (a.data) setAttendance((p) => ({ ...p, ...a.data, cutoff_time: a.data.cutoff_time || "" }));
      if (s.data) setSecurity((p) => ({ ...p, ...s.data }));
    }
    load();
  }, []);

  async function saveFees() {
    await updateFeeSettings({
      ...fee,
      payment_methods_json: String(fee.payment_methods_json || "").split(",").map((v) => v.trim()).filter(Boolean)
    });
    setMsg("Fee settings saved");
  }
  async function createFees() {
    await saveFees();
    setMsg("Fee settings created/updated");
  }
  async function deleteFees() {
    await updateFeeSettings(defaultFee);
    setFee(defaultFee);
    setMsg("Fee settings reset (deleted to defaults)");
  }

  async function saveAttendance() {
    await updateAttendanceSettings({
      ...attendance,
      allow_edit_days: Number(attendance.allow_edit_days || 0),
      leave_types_json: String(attendance.leave_types_json || "").split(",").map((v) => v.trim()).filter(Boolean)
    });
    setMsg("Attendance settings saved");
  }
  async function createAttendance() {
    await saveAttendance();
    setMsg("Attendance settings created/updated");
  }
  async function deleteAttendance() {
    await updateAttendanceSettings({
      ...defaultAttendance,
      leave_types_json: defaultAttendance.leave_types_json
    });
    setAttendance(defaultAttendance);
    setMsg("Attendance settings reset (deleted to defaults)");
  }

  async function saveSecurity() {
    await updateSecuritySettings({
      ...security,
      password_min_length: Number(security.password_min_length || 8),
      session_timeout_minutes: Number(security.session_timeout_minutes || 120)
    });
    setMsg("Security settings saved");
  }
  async function createSecurity() {
    await saveSecurity();
    setMsg("Security settings created/updated");
  }
  async function deleteSecurity() {
    await updateSecuritySettings(defaultSecurity);
    setSecurity(defaultSecurity);
    setMsg("Security settings reset (deleted to defaults)");
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div> : null}

      <Card title="Fee Settings" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input value={fee.currency || ""} onChange={(e) => setFee((p) => ({ ...p, currency: e.target.value }))} placeholder="Currency" />
          <Input value={fee.receipt_prefix || ""} onChange={(e) => setFee((p) => ({ ...p, receipt_prefix: e.target.value }))} placeholder="Receipt prefix" />
          <Input value={fee.invoice_prefix || ""} onChange={(e) => setFee((p) => ({ ...p, invoice_prefix: e.target.value }))} placeholder="Invoice prefix" />
          <Select value={fee.late_fee_type || "FIXED"} onChange={(e) => setFee((p) => ({ ...p, late_fee_type: e.target.value }))}>
            <option value="FIXED">FIXED</option>
            <option value="PERCENT">PERCENT</option>
          </Select>
          <Input type="number" value={fee.late_fee_value ?? 0} onChange={(e) => setFee((p) => ({ ...p, late_fee_value: e.target.value }))} placeholder="Late fee value" />
          <Input type="number" value={fee.grace_days ?? 0} onChange={(e) => setFee((p) => ({ ...p, grace_days: e.target.value }))} placeholder="Grace days" />
          <Input value={Array.isArray(fee.payment_methods_json) ? fee.payment_methods_json.join(",") : String(fee.payment_methods_json || "")} onChange={(e) => setFee((p) => ({ ...p, payment_methods_json: e.target.value }))} placeholder="CASH,ONLINE,UPI" />
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!fee.late_fee_enabled} onChange={(e) => setFee((p) => ({ ...p, late_fee_enabled: e.target.checked }))} /> Late fee enabled</label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={createFees}>Create</Button>
          <Button variant="secondary" onClick={saveFees}>Update</Button>
          <Button variant="secondary" onClick={deleteFees}>Delete (Reset)</Button>
        </div>
      </Card>

      <Card title="Attendance Settings" className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={attendance.mode || "DAILY"} onChange={(e) => setAttendance((p) => ({ ...p, mode: e.target.value }))}>
            <option value="DAILY">DAILY</option>
            <option value="PERIOD">PERIOD</option>
          </Select>
          <Input value={attendance.cutoff_time || ""} onChange={(e) => setAttendance((p) => ({ ...p, cutoff_time: e.target.value }))} placeholder="10:30:00" />
          <Input type="number" value={attendance.allow_edit_days ?? 1} onChange={(e) => setAttendance((p) => ({ ...p, allow_edit_days: e.target.value }))} placeholder="Allow edit days" />
          <Input value={Array.isArray(attendance.leave_types_json) ? attendance.leave_types_json.join(",") : String(attendance.leave_types_json || "")} onChange={(e) => setAttendance((p) => ({ ...p, leave_types_json: e.target.value }))} placeholder="SICK,CASUAL,OFFICIAL" />
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!attendance.auto_absent_after_cutoff} onChange={(e) => setAttendance((p) => ({ ...p, auto_absent_after_cutoff: e.target.checked }))} /> Auto absent after cutoff</label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={createAttendance}>Create</Button>
          <Button variant="secondary" onClick={saveAttendance}>Update</Button>
          <Button variant="secondary" onClick={deleteAttendance}>Delete (Reset)</Button>
        </div>
      </Card>

      <Card title="Security Settings">
        <div className="grid gap-3 md:grid-cols-4">
          <Input type="number" value={security.password_min_length ?? 8} onChange={(e) => setSecurity((p) => ({ ...p, password_min_length: e.target.value }))} placeholder="Password min length" />
          <Input type="number" value={security.session_timeout_minutes ?? 120} onChange={(e) => setSecurity((p) => ({ ...p, session_timeout_minutes: e.target.value }))} placeholder="Session timeout minutes" />
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!security.password_require_upper} onChange={(e) => setSecurity((p) => ({ ...p, password_require_upper: e.target.checked }))} /> Require upper</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!security.password_require_number} onChange={(e) => setSecurity((p) => ({ ...p, password_require_number: e.target.checked }))} /> Require number</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!security.password_require_symbol} onChange={(e) => setSecurity((p) => ({ ...p, password_require_symbol: e.target.checked }))} /> Require symbol</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!security.enable_2fa} onChange={(e) => setSecurity((p) => ({ ...p, enable_2fa: e.target.checked }))} /> Enable 2FA</label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={createSecurity}>Create</Button>
          <Button variant="secondary" onClick={saveSecurity}>Update</Button>
          <Button variant="secondary" onClick={deleteSecurity}>Delete (Reset)</Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}

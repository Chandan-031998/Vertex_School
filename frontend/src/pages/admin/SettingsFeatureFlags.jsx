import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getFeatures, updateFeatures } from "../../api/settings.api";

const keys = [
  "NOTIFICATIONS",
  "AI_ASSISTANT",
  "AI_INSIGHTS",
  "AI_FEES_PREDICT",
  "AI_OCR",
  "AI_REPORTS",
  "AI_TIMETABLE",
  "AI_MESSAGING"
];

export default function SettingsFeatureFlags() {
  const [flags, setFlags] = useState({});
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await getFeatures();
    setFlags(res.data?.features || {});
  }

  useEffect(() => { load(); }, []);

  async function onSave() {
    await updateFeatures({ features: flags });
    setMsg("Feature flags updated");
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="Feature Flags">
        <div className="grid gap-3 md:grid-cols-3">
          {keys.map((k) => (
            <label key={k} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={!!flags[k]} onChange={(e) => setFlags((p) => ({ ...p, [k]: e.target.checked }))} />
              {k}
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={onSave}>Save Flags</Button>
      </Card>
    </DashboardLayout>
  );
}

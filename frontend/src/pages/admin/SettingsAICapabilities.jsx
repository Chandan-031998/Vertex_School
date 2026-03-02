import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { aiAssistantStatus, aiInsightsStatus, aiReportsStatus } from "../../api/ai.api";

export default function SettingsAICapabilities() {
  const [assistant, setAssistant] = useState(null);
  const [insights, setInsights] = useState(null);
  const [reports, setReports] = useState(null);

  return (
    <DashboardLayout>
      <Card title="AI Capabilities (Feature-Gated)">
        <div className="grid gap-3 md:grid-cols-3">
          <Button onClick={async () => setAssistant(await aiAssistantStatus())}>Check AI Assistant</Button>
          <Button onClick={async () => setInsights(await aiInsightsStatus())}>Check AI Insights</Button>
          <Button onClick={async () => setReports(await aiReportsStatus())}>Check AI Reports</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs text-slate-700">
          <pre className="rounded-lg bg-slate-50 p-3 overflow-auto">{assistant ? JSON.stringify(assistant, null, 2) : "-"}</pre>
          <pre className="rounded-lg bg-slate-50 p-3 overflow-auto">{insights ? JSON.stringify(insights, null, 2) : "-"}</pre>
          <pre className="rounded-lg bg-slate-50 p-3 overflow-auto">{reports ? JSON.stringify(reports, null, 2) : "-"}</pre>
        </div>
      </Card>
    </DashboardLayout>
  );
}

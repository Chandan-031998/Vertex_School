import { useEffect, useMemo, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { parentNotifications } from "../../api/parent.api";

export default function ParentNotifications() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    parentNotifications().then((res) => setRows(res.data || [])).catch(() => setRows([]));
  }, []);

  const cols = useMemo(() => ([
    { key: "title", label: "Title" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" }
  ]), []);

  return (
    <ParentLayout>
      <Card title="Notifications">
        <Table columns={cols} rows={rows} />
      </Card>
    </ParentLayout>
  );
}

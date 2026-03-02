import { useEffect, useMemo, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { parentChildren } from "../../api/parent.api";

export default function ParentChildren() {
  const [rows, setRows] = useState([]);
  useEffect(() => { parentChildren().then((res) => setRows(res.data || [])); }, []);
  const cols = useMemo(() => ([
    { key: "full_name", label: "Name" },
    { key: "admission_no", label: "Admission No" },
    { key: "class_name", label: "Class" },
    { key: "section", label: "Section" },
    { key: "parent_phone", label: "Parent Phone" }
  ]), []);
  return (
    <ParentLayout>
      <Card title="My Children">
        <Table columns={cols} rows={rows} />
      </Card>
    </ParentLayout>
  );
}

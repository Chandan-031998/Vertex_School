import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { getTeacherMessageHistory, sendTeacherMessage, teacherClasses, teacherStudents } from "../../api/teacher.api";

export default function TeacherMessages() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [targetType, setTargetType] = useState("CLASS");
  const [classSection, setClassSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    teacherClasses().then((res) => {
      const data = res.data || [];
      setClasses(data);
      if (data.length) setClassSection(`${data[0].class_name}__${data[0].section}`);
    });
  }, []);

  useEffect(() => {
    const [class_name, section] = (classSection || "__").split("__");
    if (!class_name || !section) return;
    teacherStudents({ class_name, section }).then((res) => setStudents(res.data || []));
  }, [classSection]);

  async function loadHistory() {
    const [class_name, section] = (classSection || "__").split("__");
    const res = await getTeacherMessageHistory({
      class_name: class_name || undefined,
      section: section || undefined
    });
    setHistory(res.data || []);
  }

  useEffect(() => { loadHistory(); }, [classSection]);

  async function onSend(e) {
    e.preventDefault();
    const [class_name, section] = (classSection || "__").split("__");
    try {
      const payload = { channel, message };
      if (targetType === "STUDENT") payload.student_id = Number(studentId);
      else {
        payload.class_name = class_name;
        payload.section = section;
      }
      await sendTeacherMessage(payload);
      setMessage("");
      setMsg("Message sent");
      await loadHistory();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send message");
    }
  }

  const cols = useMemo(() => ([
    { key: "created_at", label: "When" },
    { key: "channel", label: "Channel" },
    { key: "target", label: "Target", render: (r) => r.student?.full_name || `${r.class_name}-${r.section}` },
    { key: "message", label: "Message" }
  ]), []);

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="Send Message" className="mb-4">
        <form className="grid gap-3 md:grid-cols-6" onSubmit={onSend}>
          <Select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="CLASS">Class</option>
            <option value="STUDENT">Student</option>
          </Select>
          <Select value={classSection} onChange={(e) => setClassSection(e.target.value)}>
            <option value="">Select class-section</option>
            {classes.map((c, idx) => <option key={`${c.class_name}-${c.section}-${idx}`} value={`${c.class_name}__${c.section}`}>{c.class_name}-{c.section}</option>)}
          </Select>
          {targetType === "STUDENT" ? (
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
          ) : <div />}
          <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WHATSAPP</option>
            <option value="EMAIL">EMAIL</option>
          </Select>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" required />
          <Button type="submit">Send</Button>
        </form>
      </Card>
      <Card title="Message History">
        <Table columns={cols} rows={history} />
      </Card>
    </DashboardLayout>
  );
}

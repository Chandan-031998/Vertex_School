import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { changeTeacherPassword, getTeacherProfile, updateTeacherProfile } from "../../api/teacher.api";

export default function TeacherProfile() {
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    phone: "",
    address: "",
    photo_url: ""
  });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await getTeacherProfile();
    const data = res.data || {};
    setProfile({
      email: data.user?.email || "",
      full_name: data.user?.full_name || "",
      phone: data.staff?.phone || "",
      address: data.staff?.address || "",
      photo_url: data.staff?.photo_url || ""
    });
  }

  useEffect(() => { load(); }, []);

  async function saveProfile() {
    try {
      await updateTeacherProfile({
        phone: profile.phone,
        address: profile.address,
        photo_url: profile.photo_url
      });
      setMsg("Profile updated");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to update profile");
    }
  }

  async function savePassword() {
    try {
      await changeTeacherPassword(pwd);
      setPwd({ current_password: "", new_password: "" });
      setMsg("Password changed");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to change password");
    }
  }

  return (
    <DashboardLayout>
      {msg ? <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div> : null}
      <Card title="My Profile" className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={profile.full_name} readOnly />
          <Input value={profile.email} readOnly />
          <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
          <Input value={profile.photo_url} onChange={(e) => setProfile((p) => ({ ...p, photo_url: e.target.value }))} placeholder="Photo URL" />
        </div>
        <Button className="mt-3" onClick={saveProfile}>Save Profile</Button>
      </Card>
      <Card title="Change Password">
        <div className="grid gap-3 md:grid-cols-3">
          <Input type="password" value={pwd.current_password} onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))} placeholder="Current password" />
          <Input type="password" value={pwd.new_password} onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))} placeholder="New password" />
        </div>
        <Button className="mt-3" onClick={savePassword}>Update Password</Button>
      </Card>
    </DashboardLayout>
  );
}

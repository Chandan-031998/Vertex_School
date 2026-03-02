import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { login as apiLogin } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@vertexschool.local");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      auth.login(res.data.token, res.data.user);
      const role = res.data.user.role;
      nav(
        role === "ADMIN"
          ? "/admin"
          : role === "TRANSPORT_MANAGER"
            ? "/admin/transport/vehicles"
            : role === "TEACHER"
              ? "/teacher"
              : role === "PARENT"
                ? "/parent/dashboard"
                : "/accountant"
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-lg font-bold text-slate-900 mb-1">Login</h1>
      <p className="text-sm text-slate-500 mb-5">Admin / Teacher / Accountant / Parent</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        </div>

        {error ? <div className="text-sm text-rose-600">{error}</div> : null}

        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 text-xs text-slate-500">
        Demo: admin@vertexschool.local / Admin@12345
      </div>
    </AuthLayout>
  );
}

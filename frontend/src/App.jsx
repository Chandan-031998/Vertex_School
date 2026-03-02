import Router from "./routes/Router";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export default function App() {
  const { token, user } = useAuth();

  // if logged in and visiting root, redirect by role
  if (token && user && window.location.pathname === "/") {
    const to = user.role === "ADMIN"
      ? "/admin"
      : user.role === "TRANSPORT_MANAGER"
        ? "/admin/transport/vehicles"
        : user.role === "TEACHER"
          ? "/teacher"
        : user.role === "PARENT"
            ? "/parent/dashboard"
            : "/accountant";
    return <Navigate to={to} replace />;
  }

  return <Router />;
}

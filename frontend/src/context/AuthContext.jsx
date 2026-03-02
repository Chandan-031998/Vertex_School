import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, getUser, setAuth } from "../utils/storage";
import { me as apiMe } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        if (token && !user) {
          const res = await apiMe();
          setUser(res.data.user);
        }
      } catch {
        clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login: (token, user) => { setAuth(token, user); setToken(token); setUser(user); },
    logout: () => { clearToken(); setToken(null); setUser(null); }
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

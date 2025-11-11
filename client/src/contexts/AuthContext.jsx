import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("auth:user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("auth:user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("auth:user", JSON.stringify(user));
    else localStorage.removeItem("auth:user");
  }, [user]);

  const login = async ({ username, password }) => {
    if (!username || !password)
      throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");

    try {
      const response = await api.post("/auth/login", {
        email: username,
        password: password,
      });

      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      let errorMsg = error.response?.data || "Unknown login error.";
      if (errorMsg === "Unauthorized") {
        errorMsg = "Incorrect Account or Password.";
      }
      throw new Error(errorMsg);
    }
  };

  const checkAuthStatusAfterRedirect = async () => {
    try {
      const response = await api.get("/auth/status");
      const userData = response.data.user;
      setUser(userData);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      checkAuthStatusAfterRedirect();
    }
  }, [user, loading]);

  // Mock API
  const register = async ({ name, email, password }) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!name || !email || !password)
      throw new Error("Thiếu thông tin đăng ký");
    const mockUser = { id: "u_" + Date.now(), name, email };
    setUser(mockUser);
    return mockUser;
  };

  const logout = async () => {
    await new Promise((r) => setTimeout(r, 300));
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

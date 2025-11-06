import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";

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

  //Mock API
  const login = async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu");
    const mockUser = {
      id: "u_" + Date.now(),
      name: email.split("@")[0],
      email,
    };
    setUser(mockUser);
    return mockUser;
  };

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

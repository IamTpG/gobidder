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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    const raw = localStorage.getItem("auth:user");
    if (raw) {
      try {
        const cachedUser = JSON.parse(raw);
        if (isMounted) setUser(cachedUser);
      } catch {
        localStorage.removeItem("auth:user");
      }
    } else {
      checkAuthStatusAfterRedirect();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("auth:user", JSON.stringify(user));
    else localStorage.removeItem("auth:user");
  }, [user]);

  const checkAuthStatusAfterRedirect = async () => {
    setLoading(true);
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

  const login = async ({ username, password }) => {
    if (!username || !password)
      throw new Error("Please enter your email and password");
    try {
      await api.post("/auth/login", { email: username, password });
      const { data } = await api.get("/users/me");
      setUser(data);
      return data;
    } catch (error) {
      let errorMsg = error.response?.data?.message || "Unknown login error.";
      if (errorMsg === "Unauthorized")
        errorMsg = "Incorrect email or password.";
      throw new Error(errorMsg);
    }
  };

  const register = async ({
    fullName,
    email,
    password,
    address,
    recaptchaToken,
  }) => {
    if (!fullName || !email || !password)
      throw new Error("Please fill all required fields");
    if (!recaptchaToken) throw new Error("Please verify you are not a robot");

    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
        address,
        recaptchaToken,
      });
      return response.data;
    } catch (error) {
      let errorMsg =
        error.response?.data?.message || "Unknown registration error";
      throw new Error(errorMsg);
    }
  };
  const verifyOtp = async ({ email, otp }) => {
    if (!email || !otp) throw new Error("Email and OTP are required");
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "OTP verification failed";
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("auth:user");
    } catch {
      // ignore network/logout errors; still clear local state
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/users/me");
      setUser(data);
      return data;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, verifyOtp, refreshUser }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
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
    const raw = localStorage.getItem("auth:user");
    if (raw) {
      try { setUser(JSON.parse(raw)); }
      catch { localStorage.removeItem("auth:user"); }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("auth:user", JSON.stringify(user));
    else localStorage.removeItem("auth:user");
  }, [user]);

  const login = async ({ username, password }) => {
    if (!username || !password) throw new Error("Please enter your email and password");
    try {
      const response = await api.post("/auth/login", { email: username, password });
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      let errorMsg = error.response?.data?.message || "Unknown login error.";
      if (errorMsg === "Unauthorized") errorMsg = "Incorrect email or password.";
      throw new Error(errorMsg);
    }
  };

  const register = async ({ fullName, email, password, address, recaptchaToken }) => {
    if (!fullName || !email || !password) throw new Error("Please fill all required fields");
    if (!recaptchaToken) throw new Error("Please verify you are not a robot");

    try {
      const response = await api.post("/auth/register", {
        fullName, email, password, address, recaptchaToken
      });
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      let errorMsg = error.response?.data?.message || "Unknown registration error";
      throw new Error(errorMsg);
    }
  };
  const verifyOtp = async ({ email, otp }) => {
    if (!email || !otp) throw new Error("Email and OTP are required");
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "OTP verification failed";
      throw new Error(errorMsg);
    }
  };

  const logout = async () => { setUser(null); };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, verifyOtp }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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
        // Set cached user temporarily to prevent localStorage deletion
        // API will update it with fresh data (including ratings) shortly
        if (isMounted) setUser(cachedUser);

        // Refresh user data from API to get latest fields (like ratings)
        api
          .get("/users/me")
          .then((response) => {
            if (isMounted) setUser(response.data);
          })
          .catch((error) => {
            console.error("Failed to refresh user data:", error);
            // If refresh fails (e.g., token expired), clear cached user
            if (error.response?.status === 401) {
              if (isMounted) setUser(null);
              localStorage.removeItem("auth:user");
            }
            // Otherwise keep using cached user as fallback
          })
          .finally(() => {
            if (isMounted) setLoading(false);
          });
      } catch {
        localStorage.removeItem("auth:user");
        setLoading(false);
      }
    } else {
      checkAuthStatusAfterRedirect();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Only save to localStorage if user has rating fields (complete data from API)
    // This prevents saving incomplete cached data
    if (
      user &&
      user.ratingPlus !== undefined &&
      user.ratingMinus !== undefined
    ) {
      localStorage.setItem("auth:user", JSON.stringify(user));
    } else if (!user) {
      localStorage.removeItem("auth:user");
    }
    // Don't save if user exists but missing rating fields (incomplete cached data)
  }, [user]);

  const checkAuthStatusAfterRedirect = async () => {
    setLoading(true);
    try {
      await api.get("/auth/status");
      // Fetch full profile (including ratings) immediately
      const response = await api.get("/users/me");
      setUser(response.data);
      // We don't save to localStorage here manually because the useEffect will match the data and save it automatically
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    if (!email || !password)
      throw new Error("Please enter your email and password");
    try {
      await api.post("/auth/login", { email, password });
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
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

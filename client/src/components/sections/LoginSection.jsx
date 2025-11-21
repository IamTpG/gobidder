import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import Spinner from "../common/Spinner";

export const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M44.5 20H24V28.5H35.4292C34.6542 32.5125 31.7458 35.3958 28 36.5667V44.0417H37.5833C42.9125 39.4625 46.125 32.35 46.125 24C46.125 22.6125 46.0125 21.2542 45.8167 19.9542L44.5 20Z"
      fill="#4285F4"
    />
    <path
      d="M24 46.125C30.6375 46.125 36.2167 43.9042 40.4042 40.1792L31.925 33.1583C29.6125 34.6333 26.9667 35.5 24 35.5C18.2583 35.5 13.375 31.5708 11.6667 26.1583H2.08333V33.6333C5.55 40.7333 14.1208 46.125 24 46.125Z"
      fill="#34A853"
    />
    <path
      d="M11.6667 26.1583C11.1625 24.7833 10.9083 23.4125 10.9083 22C10.9083 20.5875 11.1625 19.2167 11.6667 17.8417V10.3667H2.08333C0.375 14.3917 0 17.9125 0 22C0 26.0875 0.375 29.6083 2.08333 33.6333L11.6667 26.1583Z"
      fill="#FBBC05"
    />
    <path
      d="M24 8.875C27.5708 8.875 30.7708 10.15 33.3042 12.5833L40.4042 5.55833C36.2167 1.83333 30.6375 0 24 0C14.1208 0 5.55 5.39167 2.08333 12.5833L11.6667 19.9542C13.375 14.475 18.2583 10.5 24 10.5C26.9667 10.5 29.6125 11.3667 31.925 12.8417L33.3042 12.5833Z"
      fill="#EA4335"
    />
  </svg>
);

const LoginSection = () => {
  const API_URL = "http://localhost:5000/api";

  // Lấy hàm login từ Context
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      // Đăng nhập thành công, Context đã tự cập nhật user
      // Có thể chuyển hướng người dùng ở đây
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
        Login
      </h2>
      <div className="w-20 h-1 bg-slate-300 mx-auto mb-6 rounded-full"></div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username or Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Username or email address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
            placeholder="Enter your username or email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 pr-12 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Showing Error */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Remember Me & Submit */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="px-6 py-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.value)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
        </div>

        {/* Lost Password */}
        <div className="text-center pt-2">
          <a
            href="/forgot-password"
            className="text-primary hover:text-[#019974] font-medium text-sm hover:underline transition-colors"
          >
            Lost your password?
          </a>
        </div>

        {/* Đăng nhập với Google */}
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
            className="
                flex items-center justify-center gap-3 
                border-2 border-slate-200 bg-slate-50 transition-colors 
                !rounded-full px-6 py-2.5 font-semibold shadow-md
              "
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginSection;

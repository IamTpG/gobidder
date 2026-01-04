import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import { EyeIcon, EyeOffIcon, GoogleIcon } from "../common/Icons";

const LoginForm = () => {
  // Lấy hàm login từ Context
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // const [remember, setRemember] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    if (!validate()) return;

    setLoading(true);

    try {
      await login({ email, password });
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
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
        Login
      </h2>
      <div className="w-20 h-1 bg-slate-300 mx-auto mb-6 rounded-full"></div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
              errors.email
                ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                : "border-slate-200 focus:ring-primary focus:border-primary"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              className={`w-full px-4 py-2.5 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                errors.password
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-slate-200 focus:ring-primary focus:border-primary"
              }`}
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
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
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
            className="px-6 py-2 flex-grow"
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

          {/* <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.value)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label> */}
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

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Import axios instance đã cấu hình withCredentials
import Button from "../components/common/Button"; // Giả định bạn có component này
import Spinner from "../components/common/Spinner"; // Giả định bạn có component này

// --- ICONS ---
const MailIcon = () => (
  <svg
    className="w-12 h-12 text-primary mb-4 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const KeyIcon = () => (
  <svg
    className="w-12 h-12 text-primary mb-4 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11 11 11.5 9.5 13 7.5 13 6.5 14 6 14a2 2 0 01-2-2v-6a2 2 0 012-2h9a2 2 0 012 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-16 h-16 text-green-500 mb-4 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const EyeIcon = () => (
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

const EyeOffIcon = () => (
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

const ForgotPassword = () => {
  const navigate = useNavigate();

  // State quản lý các bước (1: Email, 2: OTP, 3: New Password, 4: Success)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility
  const [showPass, setShowPass] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please check your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Gọi API verify. Nếu thành công, BE sẽ set cookie 'reset_token'
      await api.post("/auth/verify-forgot-password-otp", { email, otp });
      setStep(3); // Chuyển sang bước nhập mật khẩu mới
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { newPassword });
      setStep(4);

      setTimeout(() => {
        navigate("/auth"); // Hoặc trang login
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Token may be expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Breadcrumb Section */}
      <div className="bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 text-center mb-6">
            Account Recovery
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm">
            <a
              href="/"
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Home
            </a>
            <span className="text-slate-400 font-bold">→</span>
            <a
              href="/auth"
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Account
            </a>
            <span className="text-slate-400 font-bold">→</span>
            <span className="text-slate-600 font-medium">Forgot Password</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-20 -mt-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Decorational blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

            {/* --- STEP 1: NHẬP EMAIL --- */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <MailIcon />
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-500 text-center mb-8 text-sm">
                  Enter your email address and we'll send you an OTP code to
                  reset your password.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" className="text-white" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send OTP Code"
                    )}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <a
                    href="/auth"
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    ← Back to Login
                  </a>
                </div>
              </div>
            )}

            {/* --- STEP 2: NHẬP OTP --- */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <KeyIcon />
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                  Verify OTP
                </h2>
                <p className="text-slate-500 text-center mb-8 text-sm">
                  We have sent a code to{" "}
                  <span className="font-semibold text-slate-700">{email}</span>.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm tracking-widest text-center font-bold text-lg"
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" className="text-white" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    Change Email Address
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: NHẬP MẬT KHẨU MỚI --- */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <KeyIcon />
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                  Reset Password
                </h2>
                <p className="text-slate-500 text-center mb-8 text-sm">
                  Please enter your new password below.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" className="text-white" />
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* --- STEP 4: THÀNH CÔNG --- */}
            {step === 4 && (
              <div className="animate-fadeIn text-center py-8">
                <CheckIcon />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Password Reset!
                </h2>
                <p className="text-slate-500 mb-8 text-sm">
                  Your password has been successfully reset. You can now login
                  with your new password.
                </p>
                <p className="text-sm text-slate-400">
                  Redirecting to login...
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    Go to Login Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

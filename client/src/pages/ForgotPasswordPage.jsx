import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthStepForm from "../components/auth/AuthStepForm";
import OtpVerificationForm from "../components/auth/OtpVerificationForm";
import Button from "../components/common/Button";
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  KeyIcon,
  CheckIcon,
} from "../components/common/Icons";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/verify-forgot-password-otp", { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
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
      await api.post("/auth/reset-password", { newPassword, email }); // Lưu ý: thường API reset cần gửi kèm email hoặc token nhận được từ bước verify
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const emailInput = (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Email Address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
        placeholder="Enter your email"
      />
    </div>
  );

  const newPassInput = (
    <div className="space-y-4">
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
            className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
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
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
          placeholder="Confirm new password"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Forgot Password</h1>
          <div className="w-20 h-1 bg-slate-300 my-2 mx-auto mb-6 rounded-full"></div>
        </div>

        {/* Send Email */}
        {step === 1 && (
          <AuthStepForm
            icon={<MailIcon />}
            title="Forgot Password?"
            description="Enter your email address and we'll send you an OTP code to reset your password."
            error={error}
            loading={loading}
            onSubmit={handleSendOtp}
            submitLabel="Send OTP Code"
            loadingLabel="Sending..."
            inputElement={emailInput}
            footerContent={
              <a
                href="/auth"
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                ← Back to Login
              </a>
            }
          />
        )}

        {/* Verify OTP */}
        {step === 2 && (
          <OtpVerificationForm
            email={email}
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            error={error}
            onSubmit={handleVerifyOtp}
            onBack={() => setStep(1)}
          />
        )}

        {/* New Password */}
        {step === 3 && (
          <AuthStepForm
            icon={<KeyIcon />}
            title="Reset Password"
            description="Please enter your new password below."
            error={error}
            loading={loading}
            onSubmit={handleResetPassword}
            submitLabel="Reset Password"
            loadingLabel="Resetting..."
            inputElement={newPassInput}
          />
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <AuthStepForm
            icon={<CheckIcon />}
            title="Password Reset!"
            description="Your password has been successfully reset. You can now login with your new password."
            hideSubmitButton={true}
            footerContent={
              <div className="mt-2">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Go to Login Now
                </Button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React from "react";

import AuthStepForm from "./AuthStepForm";
import { KeyIcon } from "../common/Icons";

const OtpVerificationForm = ({
  email,
  otp,
  setOtp,
  loading,
  error,
  onSubmit,
  onResend, // Hàm xử lý gửi lại OTP (optional)
  onBack, // Hàm xử lý quay lại (optional)
}) => {
  // Custom input element cho OTP
  const otpInput = (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Enter OTP Code
      </label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
        placeholder="XXXXXX"
        maxLength={6}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 tracking-[0.5em] text-center font-bold text-lg text-slate-700"
      />
    </div>
  );

  // Footer content
  const footer = (
    <div className="space-y-3">
      {onResend && (
        <button
          type="button"
          onClick={onResend}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          Resend Code
        </button>
      )}
      {onBack && (
        <div className="block">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← Change Email Address
          </button>
        </div>
      )}
    </div>
  );

  return (
    <AuthStepForm
      icon={<KeyIcon />}
      title="Verify OTP"
      description={
        <span>
          We have sent a code to{" "}
          <span className="font-semibold text-slate-700">{email}</span>
        </span>
      }
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      submitLabel="Verify Code"
      loadingLabel="Verifying..."
      inputElement={otpInput}
      footerContent={footer}
    />
  );
};

export default OtpVerificationForm;

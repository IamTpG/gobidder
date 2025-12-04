import React from "react";

import FormInput from "./FormInput";
import NotificationBanner from "./NotificationBanner";
import PasswordInput from "./PasswordInput";

const EmailChangeSection = ({
  formData,
  errors,
  notice,
  step,
  loading,
  onChange,
  onRequestOtp,
  onSubmit,
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Change email</h3>
          <p className="text-sm text-gray-500">
            Enter a new email to receive an OTP verification. Your current email
            stays active until you confirm.
          </p>
        </div>
      </div>
      <NotificationBanner type={notice?.type} message={notice?.message} />
      <form className="space-y-5" onSubmit={onSubmit}>
        <FormInput
          label="New email"
          name="newEmail"
          type="email"
          value={formData.newEmail}
          onChange={onChange}
          placeholder="user@example.com"
          error={errors.newEmail}
          required
        />
        <PasswordInput
          label="Current password"
          name="password"
          value={formData.password}
          onChange={onChange}
          placeholder="••••••••"
          error={errors.password}
          required
        />
        {step === "otp" && (
          <FormInput
            label="OTP code"
            name="otp"
            type="text"
            value={formData.otp}
            onChange={onChange}
            placeholder="6-digit code"
            error={errors.otp}
            required
          />
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onRequestOtp}
            disabled={loading}
            className="px-6 py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition disabled:opacity-60"
          >
            {step === "otp" ? "Resend OTP" : "Send OTP"}
          </button>
          <button
            type="submit"
            disabled={loading || step !== "otp"}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition disabled:opacity-40"
          >
            {loading ? "Processing..." : "Confirm change"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailChangeSection;

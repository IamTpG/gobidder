import React from "react";
import PasswordInput from "./PasswordInput";
import NotificationBanner from "./NotificationBanner";

const PasswordChangeSection = ({
  formData,
  errors,
  notice,
  loading,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Change password
          </h3>
          <p className="text-sm text-gray-500">
            Update your password by confirming the current one.
          </p>
        </div>
      </div>
      <NotificationBanner type={notice?.type} message={notice?.message} />
      <form className="space-y-5" onSubmit={onSubmit}>
        <PasswordInput
          label="Current password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={onChange}
          error={errors.currentPassword}
          required
        />
        <div className="grid gap-5 md:grid-cols-2">
          <PasswordInput
            label="New password"
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            error={errors.newPassword}
            required
          />
          <PasswordInput
            label="Confirm new password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordChangeSection;

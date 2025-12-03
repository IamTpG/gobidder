import React, { useState } from "react";

import api from "../../services/api";
import { useProfilePassword } from "../../hooks/useProfilePassword";
import { useProfileEmail } from "../../hooks/useProfileEmail";
import ProfileHeader from "./ProfileHeader";
import NotificationBanner from "./NotificationBanner";
import ProfileEditForm, { toInputDate } from "./ProfileEditForm";
import ProfileViewMode from "./ProfileViewMode";
import PasswordChangeSection from "./PasswordChangeSection";
import EmailChangeSection from "./EmailChangeSection";

const MyInfoTab = ({ profile, setProfile, onLogout, isLoggingOut }) => {
  // Logic Sửa thông tin cá nhân (Name, Address, Birthdate)
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    address: profile.address || "",
    birthdate: profile.birthdate ? toInputDate(profile.birthdate) : "",
  });

  const isLocalAccount = profile?.can_change_credentials;

  // Hooks cho Password & Email
  const passwordLogic = useProfilePassword();
  const emailLogic = useProfileEmail(profile, setProfile);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim())
      errors.full_name = "Full name cannot be empty.";
    if (formData.birthdate) {
      if (new Date(formData.birthdate) > new Date())
        errors.birthdate = "Birthdate cannot be greater than today.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setNotification(null);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        address: formData.address?.trim() || null,
        birthdate: formData.birthdate
          ? new Date(formData.birthdate).toISOString()
          : null,
      };
      const { data } = await api.put("/users/me", payload);
      setProfile((prev) => ({ ...prev, ...data }));
      setIsEditing(false);
      setNotification({
        type: "success",
        message: "Update information successfully.",
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Update information failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      full_name: profile.full_name || "",
      address: profile.address || "",
      birthdate: profile.birthdate ? toInputDate(profile.birthdate) : "",
    });
    setValidationErrors({});
    setNotification(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
      <ProfileHeader onLogout={onLogout} isLoggingOut={isLoggingOut} />

      <NotificationBanner
        type={notification?.type}
        message={notification?.message}
        onClose={() => setNotification(null)}
      />

      {isEditing ? (
        <ProfileEditForm
          profile={profile}
          formData={formData}
          errors={validationErrors}
          saving={saving}
          onChange={handleInputChange}
          onSubmit={handleSave}
          onCancel={handleCancelEdit}
        />
      ) : (
        <ProfileViewMode profile={profile} onEdit={() => setIsEditing(true)} />
      )}

      {isLocalAccount && (
        <div className="mt-12 space-y-8">
          <PasswordChangeSection
            formData={passwordLogic.form}
            errors={passwordLogic.errors}
            notice={passwordLogic.notice}
            loading={passwordLogic.loading}
            onChange={passwordLogic.handleChange}
            onSubmit={passwordLogic.handleSubmit}
          />
          <EmailChangeSection
            formData={emailLogic.form}
            errors={emailLogic.errors}
            notice={emailLogic.notice}
            step={emailLogic.step}
            loading={emailLogic.loading}
            onChange={emailLogic.handleChange}
            onRequestOtp={emailLogic.handleRequestOtp}
            onSubmit={emailLogic.handleConfirmChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyInfoTab;

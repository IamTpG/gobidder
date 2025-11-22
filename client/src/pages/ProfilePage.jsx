import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileViewMode from "../components/profile/ProfileViewMode";
import ProfileEditForm, {
  toInputDate,
} from "../components/profile/ProfileEditForm";
import PasswordChangeSection from "../components/profile/PasswordChangeSection";
import EmailChangeSection from "../components/profile/EmailChangeSection";
import NotificationBanner from "../components/profile/NotificationBanner";
import LoadingState from "../components/profile/LoadingState";
import ErrorState from "../components/profile/ErrorState";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    birthdate: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
    otp: "",
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailNotice, setEmailNotice] = useState(null);
  const [emailStep, setEmailStep] = useState("idle");
  const [changingEmail, setChangingEmail] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeNavKey = "information";
  const isLocalAccount = profile?.can_change_credentials;
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/users/me");
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          address: data.address || "",
          birthdate: data.birthdate ? toInputDate(data.birthdate) : "",
        });
      } catch (err) {
        const message =
          err.response?.data?.message || "Cannot load user information.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    setPasswordNotice(null);
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "New password must have at least 8 characters.";
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm new password.";
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = "Password confirmation does not match.";
    }
    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password.";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!validatePasswordForm()) return;

    setChangingPassword(true);
    setPasswordNotice(null);
    try {
      await api.post("/users/me/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordNotice({
        type: "success",
        message: "Password updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (err) {
      setPasswordNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEmailInputChange = (event) => {
    const { name, value } = event.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
    setEmailErrors((prev) => ({ ...prev, [name]: undefined }));
    setEmailNotice(null);
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim().toLowerCase());

  const handleRequestEmailOtp = async () => {
    const errors = {};
    if (!emailForm.password) {
      errors.password = "Password is required.";
    }
    if (!emailForm.newEmail) {
      errors.newEmail = "New email is required.";
    } else if (!isValidEmail(emailForm.newEmail)) {
      errors.newEmail = "Please enter a valid email.";
    } else if (
      profile?.email &&
      emailForm.newEmail.trim().toLowerCase() === profile.email.toLowerCase()
    ) {
      errors.newEmail = "New email must be different from current email.";
    }
    setEmailErrors(errors);
    if (Object.keys(errors).length) return;

    setChangingEmail(true);
    setEmailNotice(null);
    try {
      const payload = {
        newEmail: emailForm.newEmail.trim(),
        password: emailForm.password,
      };
      await api.post("/users/me/request-email-change", payload);
      setEmailNotice({
        type: "success",
        message:
          "OTP has been sent to your new email. Please verify within 5 minutes.",
      });
      setEmailStep("otp");
    } catch (err) {
      setEmailNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to send OTP.",
      });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleConfirmEmailChange = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!emailForm.newEmail) {
      errors.newEmail = "New email is required.";
    } else if (!isValidEmail(emailForm.newEmail)) {
      errors.newEmail = "Please enter a valid email.";
    }
    if (!emailForm.otp) {
      errors.otp = "OTP is required.";
    } else if (emailForm.otp.trim().length !== 6) {
      errors.otp = "OTP must have 6 digits.";
    }
    setEmailErrors(errors);
    if (Object.keys(errors).length) return;

    setChangingEmail(true);
    setEmailNotice(null);
    try {
      const payload = {
        newEmail: emailForm.newEmail.trim(),
        otp: emailForm.otp.trim(),
      };
      const { data } = await api.post(
        "/users/me/confirm-email-change",
        payload,
      );
      if (data?.user) {
        setProfile((prev) => ({ ...prev, ...data.user }));
      }
      setEmailNotice({
        type: "success",
        message: data?.message || "Email updated successfully.",
      });
      setEmailForm({ newEmail: "", otp: "", password: "" });
      setEmailStep("idle");
      setEmailErrors({});
    } catch (err) {
      setEmailNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to verify OTP.",
      });
    } finally {
      setChangingEmail(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: profile?.full_name || "",
      address: profile?.address || "",
      birthdate: profile?.birthdate ? toInputDate(profile.birthdate) : "",
    });
    setValidationErrors({});
    setNotification(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name cannot be empty.";
    }
    if (formData.birthdate) {
      const selected = new Date(formData.birthdate);
      const today = new Date();
      if (selected > today) {
        errors.birthdate = "Birthdate cannot be greater than today.";
      }
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
      setFormData({
        full_name: data.full_name || "",
        address: data.address || "",
        birthdate: data.birthdate ? toInputDate(data.birthdate) : "",
      });
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
    resetForm();
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err.response?.data?.message || "Logout failed. Please try again.",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar activeKey={activeNavKey} />

          <section className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
              <ProfileHeader
                onLogout={handleLogout}
                isLoggingOut={loggingOut}
              />

              <NotificationBanner
                type={notification?.type}
                message={notification?.message}
                onClose={() => setNotification(null)}
              />

              {loading && <LoadingState />}
              {!loading && error && (
                <ErrorState message={error} onRetry={handleRetry} />
              )}
              {!loading && !error && profile && (
                <div>
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
                    <ProfileViewMode
                      profile={profile}
                      onEdit={() => setIsEditing(true)}
                    />
                  )}

                  {isLocalAccount && (
                    <div className="mt-12 space-y-8">
                      <PasswordChangeSection
                        formData={passwordForm}
                        errors={passwordErrors}
                        notice={passwordNotice}
                        loading={changingPassword}
                        onChange={handlePasswordInputChange}
                        onSubmit={handlePasswordSubmit}
                      />

                      <EmailChangeSection
                        formData={emailForm}
                        errors={emailErrors}
                        notice={emailNotice}
                        step={emailStep}
                        loading={changingEmail}
                        onChange={handleEmailInputChange}
                        onRequestOtp={handleRequestEmailOtp}
                        onSubmit={handleConfirmEmailChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

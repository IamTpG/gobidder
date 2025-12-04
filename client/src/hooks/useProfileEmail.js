import { useState } from "react";
import api from "../services/api";

export const useProfileEmail = (profile, setProfile) => {
  const [form, setForm] = useState({ newEmail: "", password: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [step, setStep] = useState("idle");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setNotice(null);
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim().toLowerCase());

  const handleRequestOtp = async () => {
    const newErrors = {};
    if (!form.password) newErrors.password = "Password is required.";
    if (!form.newEmail) {
      newErrors.newEmail = "New email is required.";
    } else if (!isValidEmail(form.newEmail)) {
      newErrors.newEmail = "Please enter a valid email.";
    } else if (
      profile?.email &&
      form.newEmail.trim().toLowerCase() === profile.email.toLowerCase()
    ) {
      newErrors.newEmail = "New email must be different from current email.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    setNotice(null);
    try {
      await api.post("/users/me/request-email-change", {
        newEmail: form.newEmail.trim(),
        password: form.password,
      });
      setNotice({
        type: "success",
        message:
          "OTP has been sent to your new email. Please verify within 5 minutes.",
      });
      setStep("otp");
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to send OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async (event) => {
    event.preventDefault();
    const newErrors = {};
    if (!form.newEmail || !isValidEmail(form.newEmail))
      newErrors.newEmail = "Valid email is required.";
    if (!form.otp) {
      newErrors.otp = "OTP is required.";
    } else if (form.otp.trim().length !== 6) {
      newErrors.otp = "OTP must have 6 digits.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    setNotice(null);
    try {
      const { data } = await api.post("/users/me/confirm-email-change", {
        newEmail: form.newEmail.trim(),
        otp: form.otp.trim(),
      });
      if (data?.user) setProfile((prev) => ({ ...prev, ...data.user }));
      setNotice({
        type: "success",
        message: data?.message || "Email updated successfully.",
      });
      setForm({ newEmail: "", otp: "", password: "" });
      setStep("idle");
      setErrors({});
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to verify OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    notice,
    step,
    loading,
    handleChange,
    handleRequestOtp,
    handleConfirmChange,
  };
};

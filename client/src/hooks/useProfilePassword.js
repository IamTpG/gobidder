import { useState } from "react";
import api from "../services/api";

export const useProfilePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setNotice(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.currentPassword)
      newErrors.currentPassword = "Current password is required.";
    if (!form.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "New password must have at least 8 characters.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm new password.";
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Password confirmation does not match.";
    }
    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setNotice(null);
    try {
      await api.post("/users/me/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setNotice({ type: "success", message: "Password updated successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, notice, loading, handleChange, handleSubmit };
};

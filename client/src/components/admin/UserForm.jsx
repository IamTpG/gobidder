import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, RotateCcw } from "lucide-react";

import Spinner from "../common/Spinner";
import ConfirmDialog from "../common/ConfirmDialog";
import Button from "../common/Button";

const UserForm = ({ user, onClose, onSave, onResetPassword }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Bidder",
    address: "",
    birthdate: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "Bidder",
        address: user.address || "",
        birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Check if role is changing to Banned
    if (formData.role === "Banned" && (!user || user.role !== "Banned")) {
      setShowBanConfirm(true);
      return;
    }

    submitData();
  };

  const submitData = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
      setShowBanConfirm(false); // Reset in case of error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded bg-green-100 p-2 text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {!isEditMode && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Birthdate
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {!isEditMode && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Bidder">Bidder</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
              <option value="ExpiredSeller">ExpiredSeller</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            {isEditMode && user.role !== "Banned" && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="mr-auto flex items-center gap-1 rounded px-3 py-2 text-yellow-600 hover:bg-yellow-50"
                title="Reset Password"
              >
                <RotateCcw size={18} />
                <span className="text-sm font-medium">Reset Password</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading && <Spinner size="sm" className="mr-2" />}
              {isEditMode ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={submitData}
        title="Confirm Ban User"
        message="Are you sure you want to ban this user? They will not be able to log in or perform any actions."
        confirmText="Yes, Ban User"
        confirmVariant="danger"
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={async () => {
          setLoading(true);
          const success = await onResetPassword();
          setLoading(false);
          setShowResetConfirm(false);
          if (success) {
            setSuccessMessage("Password reset successfully and email sent.");
            setTimeout(() => setSuccessMessage(""), 5000);
          }
        }}
        title="Reset Password"
        message="Are you sure you want to reset this user's password? A new random password will be generated and sent to their email."
        confirmText="Yes, Reset Password"
        confirmVariant="warning"
        isLoading={loading}
      />
    </div>
  );
};

export default UserForm;

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

import Spinner from "../common/Spinner";

const UserForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Bidder",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "Bidder",
        password: "", // Don't fill password on edit
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">
            {isEditMode ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-red-700 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {!isEditMode && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                  minLength={8}
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {isEditMode && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                New Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium dark:text-gray-300">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Bidder">Bidder</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
              <option value="ExpiredSeller">ExpiredSeller</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              {isEditMode ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

import React from "react";

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = "",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? "border-red-400" : "border-gray-200"
        } ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""} focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;

import React from "react";

const NotificationBanner = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "bg-green-50 text-green-700 border border-green-100"
          : "bg-red-50 text-red-600 border border-red-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-current text-2xl opacity-70 hover:opacity-100"
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;

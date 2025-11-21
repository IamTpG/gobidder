import React from "react";

const ProfileHeader = ({ onLogout, isLoggingOut }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-md uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Profile
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-primary transition disabled:opacity-60"
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default ProfileHeader;

import React from "react";

const ProfileInfoCard = ({
  label,
  value,
  placeholder = "Update your information",
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value || placeholder}</p>
    </div>
  );
};

export default ProfileInfoCard;

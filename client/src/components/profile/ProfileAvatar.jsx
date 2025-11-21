import React from "react";

const sizeMap = {
  sm: "w-16 h-16 text-lg",
  md: "w-24 h-24 text-2xl",
  lg: "w-32 h-32 text-3xl",
};

const ProfileAvatar = ({
  name = "",
  avatarUrl,
  size = "lg",
  editable = false,
  onSelect,
}) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "GB";

  const dimensionClass = sizeMap[size] || sizeMap.lg;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onSelect) {
      onSelect(file);
    }
    event.target.value = "";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${dimensionClass} rounded-full object-cover border-4 border-white shadow-lg`}
        />
      ) : (
        <div
          className={`${dimensionClass} rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-semibold flex items-center justify-center border-4 border-white shadow-lg`}
        >
          {initials}
        </div>
      )}

      {editable && (
        <label
          className="absolute bottom-0 right-0 cursor-pointer bg-white text-gray-700 border border-gray-200 rounded-full p-2 shadow-md hover:bg-gray-50 transition"
          title="Change avatar"
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 20.5H4v-3.5L16.732 3.732z"
            />
          </svg>
        </label>
      )}
    </div>
  );
};

export default ProfileAvatar;
